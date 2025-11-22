/**
 * SinricProCamera - Smart camera device
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { PowerStateController, IPowerStateController } from '../capabilities/PowerStateController';
import { CameraController, ICameraController } from '../capabilities/CameraController';
import { SettingController, ISettingController } from '../capabilities/SettingController';
import { PushNotification, IPushNotification } from '../capabilities/PushNotification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProCameraClass extends SettingController(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PushNotification(CameraController(PowerStateController(SinricProDevice as any)))
) {
  constructor(deviceId: string) {
    super(deviceId, 'CAMERA');
  }
}

/**
 * Create a SinricProCamera device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProCamera instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProCamera(
  deviceId: string
): SinricProDevice &
  IPowerStateController &
  ICameraController &
  IPushNotification &
  ISettingController {
  return new SinricProCameraClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProCamera = SinricProDevice &
  IPowerStateController &
  ICameraController &
  IPushNotification &
  ISettingController;
