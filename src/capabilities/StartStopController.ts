/**
 * StartStopController - Adds start/stop control capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { SinricProRequest, CallbackResult } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export type StartStopCallback = (
  deviceId: string,
  start: boolean
) => Promise<CallbackResult> | CallbackResult;

export interface IStartStopController {
  onStartStop(callback: StartStopCallback): void;
  sendStartStopEvent(start: boolean, cause?: string): Promise<boolean>;
}

export function StartStopController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IStartStopController {
    private startStopCallback: StartStopCallback | null = null;
    private startStopEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handleStartStopRequest.bind(this));
    }

    onStartStop(callback: StartStopCallback): void {
      this.startStopCallback = callback;
    }

    async sendStartStopEvent(
      start: boolean,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.startStopEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('setStartStop', { state: start }, cause);
    }

    private async handleStartStopRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action !== 'setStartStop' || !this.startStopCallback) {
        return false;
      }

      const start = request.requestValue.state;
      const result = await this.startStopCallback(this.getDeviceId(), start);

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
        request.responseValue.state = start;
      }

      return success;
    }
  };
}
