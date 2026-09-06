/**
 * HMAC-SHA256 signature implementation for SinricPro authentication
 */

import { createHmac, timingSafeEqual } from 'crypto';
import type { SinricProMessage } from './types';

const PAYLOAD_MARKER = '"payload":';
const SIGNATURE_MARKER = ',"signature"';

export class Signature {
  private appSecret: string;

  constructor(appSecret: string) {
    this.appSecret = appSecret;
  }

  /**
   * Calculate HMAC-SHA256 signature and encode as base64
   */
  private hmacBase64(message: string, key: string): string {
    const hmac = createHmac('sha256', key);
    hmac.update(message, 'utf8');
    return hmac.digest('base64');
  }

  /**
   * Extract the payload from a message exactly as it was received.
   *
   * The bytes between `"payload":` and `,"signature"` are taken verbatim: the
   * sender's key order and spacing are its own and re-encoding a parsed object
   * would produce a different byte string and a failed verification.
   */
  private extractPayload(messageStr: string): string {
    const beginPayload = messageStr.indexOf(PAYLOAD_MARKER);
    const endPayload = messageStr.indexOf(SIGNATURE_MARKER, beginPayload);

    if (beginPayload > 0 && endPayload > 0) {
      return messageStr.substring(beginPayload + PAYLOAD_MARKER.length, endPayload);
    }

    return '';
  }

  /**
   * Calculate signature for a payload
   */
  calculateSignature(payload: string): string {
    if (!payload) return '';
    return this.hmacBase64(payload, this.appSecret);
  }

  /**
   * Sign a message object in place.
   */
  sign(message: SinricProMessage): void {
    const signature = this.calculateSignature(JSON.stringify(message.payload));

    if (!message.signature) {
      message.signature = { HMAC: '' };
    }
    message.signature.HMAC = signature;
  }

  /**
   * Sign a message and return the exact bytes to transmit.
   *
   * The payload is serialised once and spliced into the envelope, so the HMAC
   * always covers the bytes that go on the wire. Serialising it a second time
   * for transmission is what silently breaks verification on the peer.
   */
  serialize(message: SinricProMessage): string {
    const payloadStr = JSON.stringify(message.payload);
    const hmac = this.calculateSignature(payloadStr);

    message.signature = { HMAC: hmac };

    return (
      `{"header":${JSON.stringify(message.header)},` +
      `"payload":${payloadStr},` +
      `"signature":{"HMAC":${JSON.stringify(hmac)}}}`
    );
  }

  /**
   * Validate the signature of a message as it arrived on the wire.
   *
   * @param rawMessage - the received bytes, not a re-encoded object
   */
  validate(rawMessage: string): boolean {
    const payload = this.extractPayload(rawMessage);
    if (!payload) return false;

    let claimedSignature = '';
    try {
      const parsed = JSON.parse(rawMessage) as SinricProMessage;
      claimedSignature = parsed?.signature?.HMAC ?? '';
    } catch {
      return false;
    }

    if (!claimedSignature) return false;

    return Signature.constantTimeEquals(this.calculateSignature(payload), claimedSignature);
  }

  /** timingSafeEqual throws on unequal lengths; a length mismatch is never a match anyway. */
  private static constantTimeEquals(a: string, b: string): boolean {
    const bufferA = Buffer.from(a, 'utf8');
    const bufferB = Buffer.from(b, 'utf8');

    if (bufferA.length !== bufferB.length) return false;

    return timingSafeEqual(bufferA, bufferB);
  }
}
