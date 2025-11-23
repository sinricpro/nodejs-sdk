/**
 * KeypadController - Adds keypad input capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export interface IKeypadController {
  sendKeystrokeEvent(keystroke: string, cause?: string): Promise<boolean>;
}

export function KeypadController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IKeypadController {
    private keypadEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    async sendKeystrokeEvent(
      keystroke: string,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.keypadEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('keystroke', { keystroke }, cause);
    }
  };
}
