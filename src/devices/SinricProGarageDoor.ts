/**
 * SinricProGarageDoor - Garage door opener device
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { ModeController, IModeController } from '../capabilities/ModeController';
import { SettingController, ISettingController } from '../capabilities/SettingController';
import { PushNotification, IPushNotification } from '../capabilities/PushNotification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProGarageDoorClass extends SettingController(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PushNotification(ModeController(SinricProDevice as any))
) {
  constructor(deviceId: string) {
    super(deviceId, 'GARAGE_DOOR');
  }
}

/**
 * Create a SinricProGarageDoor device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProGarageDoor instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProGarageDoor(
  deviceId: string
): SinricProDevice & IModeController & IPushNotification & ISettingController {
  return new SinricProGarageDoorClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProGarageDoor = SinricProDevice &
  IModeController &
  IPushNotification &
  ISettingController;
