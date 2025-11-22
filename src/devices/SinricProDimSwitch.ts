/**
 * SinricProDimSwitch - Dimmable switch device
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { PowerStateController, IPowerStateController } from '../capabilities/PowerStateController';
import { IPowerLevelController, PowerLevelController } from '../capabilities/PowerLevelController';
import { SettingController, ISettingController } from '../capabilities/SettingController';
import { PushNotification, IPushNotification } from '../capabilities/PushNotification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProDimSwitchClass extends SettingController(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PushNotification(PowerLevelController(PowerStateController(SinricProDevice as any)))
) {
  constructor(deviceId: string) {
    super(deviceId, 'DIMMABLE_SWITCH');
  }
}

/**
 * Create a SinricProDimSwitch device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProDimSwitch instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProDimSwitch(
  deviceId: string
): SinricProDevice &
  IPowerStateController &
  IPowerLevelController &
  IPushNotification &
  ISettingController {
  return new SinricProDimSwitchClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProDimSwitch = SinricProDevice &
  IPowerStateController &
  IPowerLevelController &
  IPushNotification &
  ISettingController;
