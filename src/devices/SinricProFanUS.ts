/**
 * SinricProFanUS - US-style smart fan device
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { PowerStateController, IPowerStateController } from '../capabilities/PowerStateController';
import { PowerLevelController, IPowerLevelController } from '../capabilities/PowerLevelController';
import { SettingController, ISettingController } from '../capabilities/SettingController';
import { PushNotification, IPushNotification } from '../capabilities/PushNotification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProFanUSClass extends SettingController(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PushNotification(PowerLevelController(PowerStateController(SinricProDevice as any)))
) {
  constructor(deviceId: string) {
    super(deviceId, 'FAN');
  }
}

/**
 * Create a SinricProFanUS device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProFanUS instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProFanUS(
  deviceId: string
): SinricProDevice &
  IPowerStateController &
  IPowerLevelController &
  IPushNotification &
  ISettingController {
  return new SinricProFanUSClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProFanUS = SinricProDevice &
  IPowerStateController &
  IPowerLevelController &
  IPushNotification &
  ISettingController;
