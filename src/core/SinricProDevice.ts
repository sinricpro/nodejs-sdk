/**
 * Base class for all SinricPro devices
 */

import type { SinricProRequest, RequestHandler, MessageType } from './types';
import { SinricProSdkLogger } from '../utils/SinricProSdkLogger';

export interface ISinricPro {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendMessage(message: Record<string, any>): Promise<void>;
  getTimestamp(): number;
  sign(message: string): string;
}

export abstract class SinricProDevice {
  protected deviceId: string;
  protected productType: string;
  protected sinricPro: ISinricPro | null = null;
  protected requestHandlers: RequestHandler[] = [];

  constructor(deviceId: string, productType: string) {
    this.deviceId = deviceId;
    this.productType = productType;
  }

  getDeviceId(): string {
    return this.deviceId;
  }

  getProductType(): string {
    return `sinric.device.type.${this.productType}`;
  }

  setSinricPro(sinricPro: ISinricPro): void {
    this.sinricPro = sinricPro;
  }

  protected registerRequestHandler(handler: RequestHandler): void {
    this.requestHandlers.push(handler);
  }

  async handleRequest(request: SinricProRequest): Promise<boolean> {
    SinricProSdkLogger.debug(`Device ${this.deviceId} handling request: ${request.action}`);

    for (const handler of this.requestHandlers) {
      try {
        const result = await handler(request);
        if (result) {
          SinricProSdkLogger.debug(`Request ${request.action} handled successfully`);
          return true;
        }
      } catch (error) {
        SinricProSdkLogger.error(`Error handling request ${request.action}:`, error);
        return false;
      }
    }

    SinricProSdkLogger.warn(`No handler found for action: ${request.action}`);
    return false;
  }

  protected async sendEvent(
    action: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: Record<string, any>,
    cause: string = 'PHYSICAL_INTERACTION',
    instanceId: string = ''
  ): Promise<boolean> {
    if (!this.sinricPro) {
      SinricProSdkLogger.error('Cannot send event: Device not registered with SinricPro');
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = {
      action,
      deviceId: this.deviceId,
      replyToken: this.generateMessageId(),
      type: 'event' as MessageType,
      createdAt: Math.floor(new Date().getTime() / 1000),
      cause: { type: cause },
      value,
    };

    // Include instanceId if provided
    if (instanceId) {
      payload.instanceId = instanceId;
    }

    const eventMessage = {
      header: {
        payloadVersion: 2,
        signatureVersion: 1,
      },
      payload,
    };

    try {
      await this.sinricPro.sendMessage(eventMessage);
      SinricProSdkLogger.debug(`Event sent: ${action}`, value);
      return true;
    } catch (error) {
      SinricProSdkLogger.error(`Failed to send event ${action}:`, error);
      return false;
    }
  }

  protected generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
