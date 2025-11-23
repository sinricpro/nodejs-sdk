/**
 * ModeController - Adds generic mode control capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { SinricProRequest, CallbackResult } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export type SetModeCallback = (
  deviceId: string,
  mode: string
) => Promise<CallbackResult> | CallbackResult;

export interface IModeController {
  onSetMode(callback: SetModeCallback): void;
  sendModeEvent(mode: string, cause?: string): Promise<boolean>;
}

export function ModeController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IModeController {
    private setModeCallback: SetModeCallback | null = null;
    private modeEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handleModeRequest.bind(this));
    }

    onSetMode(callback: SetModeCallback): void {
      this.setModeCallback = callback;
    }

    async sendModeEvent(mode: string, cause: string = PHYSICAL_INTERACTION): Promise<boolean> {
      if (this.modeEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('setMode', { mode }, cause);
    }

    private async handleModeRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action !== 'setMode' || !this.setModeCallback) {
        return false;
      }

      const mode = request.requestValue.mode;
      const result = await this.setModeCallback(this.getDeviceId(), mode);

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
        request.responseValue.mode = mode;
      }

      return success;
    }
  };
}
