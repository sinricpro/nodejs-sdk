/**
 * TemperatureSensor - Adds temperature reporting capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import { EVENT_LIMIT_SENSOR_VALUE, PERIODIC_POLL } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export interface ITemperatureSensor {
  sendTemperatureEvent(temperature: number, humidity?: number, cause?: string): Promise<boolean>;
}

export function TemperatureSensor<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements ITemperatureSensor {
    private temperatureEventLimiter = new EventLimiter(EVENT_LIMIT_SENSOR_VALUE);

    async sendTemperatureEvent(
      temperature: number,
      humidity?: number,
      cause: string = PERIODIC_POLL
    ): Promise<boolean> {
      if (this.temperatureEventLimiter.isLimited()) {
        return false;
      }

      const value: Record<string, unknown> = {
        temperature,
      };

      if (humidity !== undefined) {
        value.humidity = humidity;
      }

      return this.sendEvent('currentTemperature', value, cause);
    }
  };
}
