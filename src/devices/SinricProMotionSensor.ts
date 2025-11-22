/**
 * SinricProMotionSensor - Motion sensor device
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { MotionSensor, IMotionSensor } from '../capabilities/MotionSensor';
import { SettingController, ISettingController } from '../capabilities/SettingController';
import { PushNotification, IPushNotification } from '../capabilities/PushNotification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProMotionSensorClass extends SettingController(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PushNotification(MotionSensor(SinricProDevice as any))
) {
  constructor(deviceId: string) {
    super(deviceId, 'MOTION_SENSOR');
  }
}

/**
 * Create a SinricProMotionSensor device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProMotionSensor instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProMotionSensor(
  deviceId: string
): SinricProDevice & IMotionSensor & IPushNotification & ISettingController {
  return new SinricProMotionSensorClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProMotionSensor = SinricProDevice &
  IMotionSensor &
  IPushNotification &
  ISettingController;
