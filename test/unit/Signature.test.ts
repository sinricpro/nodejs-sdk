/**
 * Unit tests for Signature
 */

import { Signature } from '../../src/core/Signature';
import type { SinricProMessage } from '../../src/core/types';

const HEADER = '{"payloadVersion":2,"signatureVersion":1}';

function envelope(payload: string, hmac: string): string {
  return `{"header":${HEADER},"payload":${payload},"signature":{"HMAC":${JSON.stringify(hmac)}}}`;
}

describe('Signature', () => {
  let signature: Signature;
  const testSecret = 'test-secret-key';

  beforeEach(() => {
    signature = new Signature(testSecret);
  });

  describe('sign', () => {
    it('should add HMAC signature to message', () => {
      const message: SinricProMessage = {
        header: {
          payloadVersion: 2,
          signatureVersion: 1,
        },
        payload: {
          action: 'setPowerState',
          deviceId: 'device-123',
          replyToken: 'token-123',
          type: 'request' as any,
          createdAt: 1234567890,
          value: { state: 'On' },
        },
      };

      signature.sign(message);

      expect(message.signature).toBeDefined();
      expect(message.signature?.HMAC).toBeTruthy();
      expect(typeof message.signature?.HMAC).toBe('string');
    });

    it('should generate consistent signatures for same payload', () => {
      const message1: SinricProMessage = {
        header: { payloadVersion: 2, signatureVersion: 1 },
        payload: {
          action: 'test',
          replyToken: 'token',
          type: 'event' as any,
          createdAt: 123,
          value: {},
        },
      };

      const message2: SinricProMessage = JSON.parse(JSON.stringify(message1));

      signature.sign(message1);
      signature.sign(message2);

      expect(message1.signature?.HMAC).toBe(message2.signature?.HMAC);
    });
  });

  describe('serialize', () => {
    it('should round-trip: what it signs is what it transmits', () => {
      const message: SinricProMessage = {
        header: { payloadVersion: 2, signatureVersion: 1 },
        payload: {
          action: 'setPowerState',
          deviceId: 'device-123',
          replyToken: 'token-123',
          type: 'response' as any,
          createdAt: 1234567890,
          value: { state: 'On' },
        },
      };

      const wire = signature.serialize(message);

      expect(signature.validate(wire)).toBe(true);
      expect(JSON.parse(wire).signature.HMAC).toBe(message.signature?.HMAC);
    });

    it('should emit header, payload and signature in the documented order', () => {
      const message: SinricProMessage = {
        header: { payloadVersion: 2, signatureVersion: 1 },
        payload: {
          action: 'test',
          replyToken: 'token',
          type: 'response' as any,
          createdAt: 1,
          value: {},
        },
      };

      const wire = signature.serialize(message);

      expect(wire.indexOf('"header":')).toBeLessThan(wire.indexOf('"payload":'));
      expect(wire.indexOf('"payload":')).toBeLessThan(wire.indexOf('"signature":'));
    });

    it('should splice the payload bytes verbatim into the envelope', () => {
      const message: SinricProMessage = {
        header: { payloadVersion: 2, signatureVersion: 1 },
        payload: {
          // Deliberately unsorted: the transmitted bytes must keep this order.
          value: { state: 'On' },
          action: 'setPowerState',
          replyToken: 'token',
          type: 'request' as any,
          createdAt: 1,
        },
      };

      const payloadStr = JSON.stringify(message.payload);
      const wire = signature.serialize(message);

      expect(wire).toContain(`"payload":${payloadStr},`);
      expect(signature.validate(wire)).toBe(true);
    });
  });

  describe('validate', () => {
    it('should validate a correctly signed message', () => {
      const payload = '{"action":"test","replyToken":"token","type":"request","createdAt":123}';
      const wire = envelope(payload, signature.calculateSignature(payload));

      expect(signature.validate(wire)).toBe(true);
    });

    it("should verify the received bytes, not a re-encoding of the sender's object", () => {
      // Foreign key order and spacing: re-encoding this payload would change the
      // bytes and fail, slicing them out of the message does not.
      const payload = '{"value": {"state": "On"}, "action": "setPowerState", "createdAt": 1}';
      const wire = envelope(payload, signature.calculateSignature(payload));

      expect(signature.validate(wire)).toBe(true);

      const reEncoded = JSON.stringify(JSON.parse(payload));
      expect(reEncoded).not.toBe(payload);
      expect(signature.calculateSignature(reEncoded)).not.toBe(
        signature.calculateSignature(payload)
      );
    });

    it('should be independent of payload key order', () => {
      const payloadA = '{"action":"setPowerState","createdAt":1,"value":{"state":"On"}}';
      const payloadB = '{"value":{"state":"On"},"createdAt":1,"action":"setPowerState"}';

      expect(signature.validate(envelope(payloadA, signature.calculateSignature(payloadA)))).toBe(
        true
      );
      expect(signature.validate(envelope(payloadB, signature.calculateSignature(payloadB)))).toBe(
        true
      );

      // Same object, different bytes - so a signature is not transferable between them.
      expect(signature.calculateSignature(payloadA)).not.toBe(
        signature.calculateSignature(payloadB)
      );
      expect(signature.validate(envelope(payloadB, signature.calculateSignature(payloadA)))).toBe(
        false
      );
    });

    it('should reject a tampered payload', () => {
      const payload = '{"action":"setPowerState","createdAt":1,"value":{"state":"Off"}}';
      const wire = envelope(payload, signature.calculateSignature(payload));
      const tampered = wire.replace('"Off"', '"On"');

      expect(tampered).not.toBe(wire);
      expect(signature.validate(tampered)).toBe(false);
    });

    it('should reject messages signed with a different secret', () => {
      const payload = '{"action":"test","createdAt":1}';
      const wire = envelope(payload, new Signature('another-secret').calculateSignature(payload));

      expect(signature.validate(wire)).toBe(false);
    });

    it('should reject messages with invalid signatures', () => {
      const payload = '{"action":"test","createdAt":1}';

      // Different length from a real digest - must not throw in the compare.
      expect(signature.validate(envelope(payload, 'invalid-signature'))).toBe(false);
      expect(signature.validate(envelope(payload, ''))).toBe(false);
    });

    it('should reject messages with no payload or no signature', () => {
      expect(signature.validate('{"header":{},"signature":{"HMAC":"x"}}')).toBe(false);
      expect(signature.validate('{"header":{},"payload":{"action":"test"}}')).toBe(false);
      expect(signature.validate('not json')).toBe(false);
    });
  });
});
