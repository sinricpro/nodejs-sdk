/**
 * InputController - Adds input selection capability (for TV/AV receivers)
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { SinricProRequest, CallbackResult } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export type SelectInputCallback = (
  deviceId: string,
  input: string
) => Promise<CallbackResult> | CallbackResult;

export interface IInputController {
  onSelectInput(callback: SelectInputCallback): void;
  sendInputEvent(input: string, cause?: string): Promise<boolean>;
}

export function InputController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IInputController {
    private selectInputCallback: SelectInputCallback | null = null;
    private inputEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handleInputRequest.bind(this));
    }

    onSelectInput(callback: SelectInputCallback): void {
      this.selectInputCallback = callback;
    }

    async sendInputEvent(input: string, cause: string = PHYSICAL_INTERACTION): Promise<boolean> {
      if (this.inputEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('selectInput', { input }, cause);
    }

    private async handleInputRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action !== 'selectInput' || !this.selectInputCallback) {
        return false;
      }

      const input = request.requestValue.input;
      const result = await this.selectInputCallback(this.getDeviceId(), input);

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
        request.responseValue.input = input;
      }

      return success;
    }
  };
}
