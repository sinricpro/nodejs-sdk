/**
 * MotionSensor - Adds motion detection capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import { EVENT_LIMIT_SENSOR_VALUE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export interface IMotionSensor {
  sendMotionEvent(detected: boolean, cause?: string): Promise<boolean>;
}

export function MotionSensor<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IMotionSensor {
    private motionEventLimiter = new EventLimiter(EVENT_LIMIT_SENSOR_VALUE);

    async sendMotionEvent(
      detected: boolean,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.motionEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('motion', { state: detected ? 'detected' : 'notDetected' }, cause);
    }
  };
}
