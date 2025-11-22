/**
 * ColorTemperatureController - Adds color temperature control capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { ColorTemperatureCallback, SinricProRequest } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export interface IColorTemperatureController {
  onColorTemperature(callback: ColorTemperatureCallback): void;
  sendColorTemperatureEvent(colorTemperature: number, cause?: string): Promise<boolean>;
}

export function ColorTemperatureController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IColorTemperatureController {
    private colorTemperatureCallback: ColorTemperatureCallback | null = null;
    private colorTemperatureEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handleColorTemperatureRequest.bind(this));
    }

    onColorTemperature(callback: ColorTemperatureCallback): void {
      this.colorTemperatureCallback = callback;
    }

    async sendColorTemperatureEvent(
      colorTemperature: number,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.colorTemperatureEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent(
        'setColorTemperature',
        {
          colorTemperature,
        },
        cause
      );
    }

    private async handleColorTemperatureRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action !== 'setColorTemperature' || !this.colorTemperatureCallback) {
        return false;
      }

      const colorTemperature = request.requestValue.colorTemperature;
      const result = await this.colorTemperatureCallback(this.getDeviceId(), colorTemperature);

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
        request.responseValue.colorTemperature = colorTemperature;
      }

      return success;
    }
  };
}
