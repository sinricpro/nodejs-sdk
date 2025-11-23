/**
 * MuteController - Adds mute/unmute capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { SinricProRequest, CallbackResult } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export type MuteCallback = (
  deviceId: string,
  mute: boolean
) => Promise<CallbackResult> | CallbackResult;

export interface IMuteController {
  onMute(callback: MuteCallback): void;
  sendMuteEvent(mute: boolean, cause?: string): Promise<boolean>;
}

export function MuteController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IMuteController {
    private muteCallback: MuteCallback | null = null;
    private muteEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handleMuteRequest.bind(this));
    }

    onMute(callback: MuteCallback): void {
      this.muteCallback = callback;
    }

    async sendMuteEvent(mute: boolean, cause: string = PHYSICAL_INTERACTION): Promise<boolean> {
      if (this.muteEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('setMute', { mute }, cause);
    }

    private async handleMuteRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action !== 'setMute' || !this.muteCallback) {
        return false;
      }

      const mute = request.requestValue.mute;
      const result = await this.muteCallback(this.getDeviceId(), mute);

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
        request.responseValue.mute = mute;
      }

      return success;
    }
  };
}
