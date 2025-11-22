/**
 * PowerStateController - Adds on/off capability to devices
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { PowerStateCallback, SinricProRequest } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export interface IPowerStateController {
  onPowerState(callback: PowerStateCallback): void;
  sendPowerStateEvent(state: boolean, cause?: string): Promise<boolean>;
}

export function PowerStateController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IPowerStateController {
    private powerStateCallback: PowerStateCallback | null = null;
    private powerStateEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handlePowerStateRequest.bind(this));
    }

    onPowerState(callback: PowerStateCallback): void {
      this.powerStateCallback = callback;
    }

    async sendPowerStateEvent(
      state: boolean,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.powerStateEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent(
        'setPowerState',
        {
          state: state ? 'On' : 'Off',
        },
        cause
      );
    }

    private async handlePowerStateRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action !== 'setPowerState' || !this.powerStateCallback) {
        return false;
      }

      const state = request.requestValue.state === 'On';
      const result = await this.powerStateCallback(this.getDeviceId(), state);

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
        request.responseValue.state = state ? 'On' : 'Off';
      }

      return success;
    }
  };
}
