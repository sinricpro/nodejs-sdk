/**
 * SinricProLock - Smart lock device
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { LockController, ILockController } from '../capabilities/LockController';
import { SettingController, ISettingController } from '../capabilities/SettingController';
import { PushNotification, IPushNotification } from '../capabilities/PushNotification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProLockClass extends SettingController(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PushNotification(LockController(SinricProDevice as any))
) {
  constructor(deviceId: string) {
    super(deviceId, 'SMARTLOCK');
  }
}

/**
 * Create a SinricProLock device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProLock instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProLock(
  deviceId: string
): SinricProDevice & ILockController & IPushNotification & ISettingController {
  return new SinricProLockClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProLock = SinricProDevice &
  ILockController &
  IPushNotification &
  ISettingController;
