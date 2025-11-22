/**
 * SinricProPowerSensor - Power consumption sensor device
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { PowerSensor, IPowerSensor } from '../capabilities/PowerSensor';
import { SettingController, ISettingController } from '../capabilities/SettingController';
import { PushNotification, IPushNotification } from '../capabilities/PushNotification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProPowerSensorClass extends SettingController(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PushNotification(PowerSensor(SinricProDevice as any))
) {
  constructor(deviceId: string) {
    super(deviceId, 'POWER_SENSOR');
  }
}

/**
 * Create a SinricProPowerSensor device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProPowerSensor instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProPowerSensor(
  deviceId: string
): SinricProDevice & IPowerSensor & IPushNotification & ISettingController {
  return new SinricProPowerSensorClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProPowerSensor = SinricProDevice &
  IPowerSensor &
  IPushNotification &
  ISettingController;
