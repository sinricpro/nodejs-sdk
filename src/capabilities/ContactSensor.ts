/**
 * ContactSensor - Adds contact/door sensor capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import { EVENT_LIMIT_SENSOR_VALUE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export interface IContactSensor {
  sendContactEvent(detected: boolean, cause?: string): Promise<boolean>;
}

export function ContactSensor<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IContactSensor {
    private contactEventLimiter = new EventLimiter(EVENT_LIMIT_SENSOR_VALUE);

    async sendContactEvent(
      detected: boolean,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.contactEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('setContactState', { state: detected ? 'closed' : 'open' }, cause);
    }
  };
}
