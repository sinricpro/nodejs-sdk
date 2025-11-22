/**
 * ToggleController - Adds generic toggle control capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { SinricProRequest, CallbackResult } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export type ToggleStateCallback = (
  deviceId: string,
  state: boolean
) => Promise<CallbackResult> | CallbackResult;

export interface IToggleController {
  onToggleState(callback: ToggleStateCallback): void;
  sendToggleStateEvent(state: boolean, cause?: string): Promise<boolean>;
}

export function ToggleController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IToggleController {
    private toggleStateCallback: ToggleStateCallback | null = null;
    private toggleEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handleToggleRequest.bind(this));
    }

    onToggleState(callback: ToggleStateCallback): void {
      this.toggleStateCallback = callback;
    }

    async sendToggleStateEvent(
      state: boolean,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.toggleEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('setToggleState', { state }, cause);
    }

    private async handleToggleRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action !== 'setToggleState' || !this.toggleStateCallback) {
        return false;
      }

      const state = request.requestValue.state;
      const result = await this.toggleStateCallback(this.getDeviceId(), state);

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
        request.responseValue.state = state;
      }

      return success;
    }
  };
}
