/**
 * Unit tests for Signature
 */

import { Signature } from '../../src/core/Signature';
import type { SinricProMessage } from '../../src/core/types';

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

  describe('validate', () => {
    it('should validate correctly signed messages', () => {
      const message: SinricProMessage = {
        header: { payloadVersion: 2, signatureVersion: 1 },
        payload: {
          action: 'test',
          replyToken: 'token',
          type: 'request' as any,
          createdAt: 123,
          value: {},
        },
      };

      signature.sign(message);
      const isValid = signature.validate(message);

      expect(isValid).toBe(true);
    });

    it('should reject messages with invalid signatures', () => {
      const message: SinricProMessage = {
        header: { payloadVersion: 2, signatureVersion: 1 },
        payload: {
          action: 'test',
          replyToken: 'token',
          type: 'request' as any,
          createdAt: 123,
          value: {},
        },
        signature: {
          HMAC: 'invalid-signature',
        },
      };

      const isValid = signature.validate(message);

      expect(isValid).toBe(false);
    });

    it('should accept timestamp messages without signature', () => {
      const message: any = {
        timestamp: 1234567890,
      };

      const isValid = signature.validate(message);

      expect(isValid).toBe(true);
    });
  });
});
