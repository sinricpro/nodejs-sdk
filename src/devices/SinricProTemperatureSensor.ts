/**
 * SinricProTemperatureSensor - Temperature and humidity sensor device
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { TemperatureSensor, ITemperatureSensor } from '../capabilities/TemperatureSensor';
import { SettingController, ISettingController } from '../capabilities/SettingController';
import { PushNotification, IPushNotification } from '../capabilities/PushNotification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProTemperatureSensorClass extends SettingController(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PushNotification(TemperatureSensor(SinricProDevice as any))
) {
  constructor(deviceId: string) {
    super(deviceId, 'TEMPERATURE_SENSOR');
  }
}

/**
 * Create a SinricProTemperatureSensor device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProTemperatureSensor instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProTemperatureSensor(
  deviceId: string
): SinricProDevice & ITemperatureSensor & IPushNotification & ISettingController {
  return new SinricProTemperatureSensorClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProTemperatureSensor = SinricProDevice &
  ITemperatureSensor &
  IPushNotification &
  ISettingController;
