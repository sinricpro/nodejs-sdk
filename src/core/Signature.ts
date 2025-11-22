/**
 * HMAC-SHA256 signature implementation for SinricPro authentication
 */

import { createHmac } from 'crypto';
import type { SinricProMessage } from './types';

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
    hmac.update(message);
    return hmac.digest('base64');
  }

  /**
   * Extract payload from JSON message string
   */
  private extractPayload(messageStr: string): string {
    const beginPayload = messageStr.indexOf('"payload":');
    const endPayload = messageStr.indexOf(',"signature"', beginPayload);

    if (beginPayload > 0 && endPayload > 0) {
      return messageStr.substring(beginPayload + 10, endPayload);
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
   * Sign a message object
   */
  sign(message: SinricProMessage): void {
    const payloadStr = JSON.stringify(message.payload);
    const signature = this.calculateSignature(payloadStr);

    if (!message.signature) {
      message.signature = { HMAC: '' };
    }
    message.signature.HMAC = signature;
  }

  /**
   * Validate message signature
   */
  validate(message: SinricProMessage): boolean {
    // Timestamp messages don't have signatures
    if ('timestamp' in message) {
      return true;
    }

    if (!message.signature || !message.signature.HMAC) {
      return false;
    }

    const messageStr = JSON.stringify(message);
    const payload = this.extractPayload(messageStr);
    const calculatedSignature = this.calculateSignature(payload);

    return calculatedSignature === message.signature.HMAC;
  }
}
