/**
 * SinricProDoorbell - Doorbell device
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { Doorbell, IDoorbell } from '../capabilities/Doorbell';
import { CameraController, ICameraController } from '../capabilities/CameraController';
import { SettingController, ISettingController } from '../capabilities/SettingController';
import { PushNotification, IPushNotification } from '../capabilities/PushNotification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProDoorbellClass extends SettingController(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PushNotification(CameraController(Doorbell(SinricProDevice as any)))
) {
  constructor(deviceId: string) {
    super(deviceId, 'DOORBELL');
  }
}

/**
 * Create a SinricProDoorbell device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProDoorbell instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProDoorbell(
  deviceId: string
): SinricProDevice & IDoorbell & ICameraController & IPushNotification & ISettingController {
  return new SinricProDoorbellClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProDoorbell = SinricProDevice &
  IDoorbell &
  ICameraController &
  IPushNotification &
  ISettingController;
