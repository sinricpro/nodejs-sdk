/**
 * ColorController - Adds RGB color control capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { ColorCallback, SinricProRequest } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export interface IColorController {
  onColor(callback: ColorCallback): void;
  sendColorEvent(r: number, g: number, b: number, cause?: string): Promise<boolean>;
}

export function ColorController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IColorController {
    private colorCallback: ColorCallback | null = null;
    private colorEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handleColorRequest.bind(this));
    }

    onColor(callback: ColorCallback): void {
      this.colorCallback = callback;
    }

    async sendColorEvent(
      r: number,
      g: number,
      b: number,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.colorEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent(
        'setColor',
        {
          color: { r, g, b },
        },
        cause
      );
    }

    private async handleColorRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action !== 'setColor' || !this.colorCallback) {
        return false;
      }

      const { r, g, b } = request.requestValue.color;
      const result = await this.colorCallback(this.getDeviceId(), r, g, b);

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
        request.responseValue.color = { r, g, b };
      }

      return success;
    }
  };
}
