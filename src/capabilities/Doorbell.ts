/**
 * Doorbell - Adds doorbell press capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export interface IDoorbell {
  sendDoorbellEvent(cause?: string): Promise<boolean>;
}

export function Doorbell<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IDoorbell {
    private doorbellEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    async sendDoorbellEvent(cause: string = PHYSICAL_INTERACTION): Promise<boolean> {
      if (this.doorbellEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('DoorbellPress', { state: 'pressed' }, cause);
    }
  };
}
