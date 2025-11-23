/**
 * PowerSensor - Adds power consumption monitoring capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import { EVENT_LIMIT_SENSOR_VALUE, PERIODIC_POLL } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export interface PowerValue {
  voltage?: number;
  current?: number;
  power?: number;
  apparentPower?: number;
  reactivePower?: number;
}

export interface IPowerSensor {
  sendPowerSensorEvent(value: PowerValue, cause?: string): Promise<boolean>;
}

export function PowerSensor<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IPowerSensor {
    private powerSensorEventLimiter = new EventLimiter(EVENT_LIMIT_SENSOR_VALUE);

    async sendPowerSensorEvent(value: PowerValue, cause: string = PERIODIC_POLL): Promise<boolean> {
      if (this.powerSensorEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('currentPowerConsumption', value, cause);
    }
  };
}
