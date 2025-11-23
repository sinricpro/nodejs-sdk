/**
 * SinricProAirQualitySensor - Air quality sensor device
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { AirQualitySensor, IAirQualitySensor } from '../capabilities/AirQualitySensor';
import { TemperatureSensor, ITemperatureSensor } from '../capabilities/TemperatureSensor';
import { SettingController, ISettingController } from '../capabilities/SettingController';
import { PushNotification, IPushNotification } from '../capabilities/PushNotification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProAirQualitySensorClass extends SettingController(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PushNotification(TemperatureSensor(AirQualitySensor(SinricProDevice as any)))
) {
  constructor(deviceId: string) {
    super(deviceId, 'AIR_QUALITY_SENSOR');
  }
}

/**
 * Create a SinricProAirQualitySensor device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProAirQualitySensor instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProAirQualitySensor(
  deviceId: string
): SinricProDevice &
  IAirQualitySensor &
  ITemperatureSensor &
  IPushNotification &
  ISettingController {
  return new SinricProAirQualitySensorClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProAirQualitySensor = SinricProDevice &
  IAirQualitySensor &
  ITemperatureSensor &
  IPushNotification &
  ISettingController;
