/**
 * AirQualitySensor - Adds air quality monitoring capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import { EVENT_LIMIT_SENSOR_VALUE, PERIODIC_POLL } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export interface AirQualityValue {
  pm1?: number;
  pm2_5?: number;
  pm10?: number;
  aqi?: number; // Air Quality Index
}

export interface IAirQualitySensor {
  sendAirQualityEvent(value: AirQualityValue, cause?: string): Promise<boolean>;
}

export function AirQualitySensor<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IAirQualitySensor {
    private airQualityEventLimiter = new EventLimiter(EVENT_LIMIT_SENSOR_VALUE);

    async sendAirQualityEvent(
      value: AirQualityValue,
      cause: string = PERIODIC_POLL
    ): Promise<boolean> {
      if (this.airQualityEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('currentAirQuality', value, cause);
    }
  };
}
