/**
 * BrightnessController - Adds brightness control capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { BrightnessCallback, AdjustBrightnessCallback, SinricProRequest } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export interface IBrightnessController {
  onBrightness(callback: BrightnessCallback): void;
  onAdjustBrightness(callback: AdjustBrightnessCallback): void;
  sendBrightnessEvent(brightness: number, cause?: string): Promise<boolean>;
}

export function BrightnessController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IBrightnessController {
    private brightnessCallback: BrightnessCallback | null = null;
    private adjustBrightnessCallback: AdjustBrightnessCallback | null = null;
    private brightnessEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handleBrightnessRequest.bind(this));
    }

    onBrightness(callback: BrightnessCallback): void {
      this.brightnessCallback = callback;
    }

    onAdjustBrightness(callback: AdjustBrightnessCallback): void {
      this.adjustBrightnessCallback = callback;
    }

    async sendBrightnessEvent(
      brightness: number,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.brightnessEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent(
        'setBrightness',
        {
          brightness,
        },
        cause
      );
    }

    private async handleBrightnessRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action === 'setBrightness' && this.brightnessCallback) {
        const brightness = request.requestValue.brightness;
        const result = await this.brightnessCallback(this.getDeviceId(), brightness);

        // Handle both boolean and object return types
        let success: boolean;
        if (typeof result === 'boolean') {
          success = result;
        } else {
          success = result.success;
          if (result.message) {
            request.errorMessage = result.message;
          }
        }

        if (success) {
          request.responseValue.brightness = brightness;
        }

        return success;
      }

      if (request.action === 'adjustBrightness' && this.adjustBrightnessCallback) {
        const brightnessDelta = request.requestValue.brightnessDelta;
        const result = await this.adjustBrightnessCallback(this.getDeviceId(), brightnessDelta);

        // Handle both boolean and object return types
        let success: boolean;
        if (typeof result === 'boolean') {
          success = result;
        } else {
          success = result.success;
          if (result.message) {
            request.errorMessage = result.message;
          }
        }

        if (success) {
          request.responseValue.brightness = brightnessDelta;
        }

        return success;
      }

      return false;
    }
  };
}
