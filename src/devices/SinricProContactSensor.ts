/**
 * SinricProContactSensor - Contact/door sensor device
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { ContactSensor, IContactSensor } from '../capabilities/ContactSensor';
import { SettingController, ISettingController } from '../capabilities/SettingController';
import { PushNotification, IPushNotification } from '../capabilities/PushNotification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProContactSensorClass extends SettingController(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PushNotification(ContactSensor(SinricProDevice as any))
) {
  constructor(deviceId: string) {
    super(deviceId, 'CONTACT_SENSOR');
  }
}

/**
 * Create a SinricProContactSensor device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProContactSensor instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProContactSensor(
  deviceId: string
): SinricProDevice & IContactSensor & IPushNotification & ISettingController {
  return new SinricProContactSensorClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProContactSensor = SinricProDevice &
  IContactSensor &
  IPushNotification &
  ISettingController;
