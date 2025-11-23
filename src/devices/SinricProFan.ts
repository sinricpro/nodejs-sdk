/**
 * SinricProFan - Smart fan device
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { PowerStateController, IPowerStateController } from '../capabilities/PowerStateController';
import { RangeController, IRangeController } from '../capabilities/RangeController';
import { SettingController, ISettingController } from '../capabilities/SettingController';
import { PushNotification, IPushNotification } from '../capabilities/PushNotification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProFanClass extends SettingController(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PushNotification(RangeController(PowerStateController(SinricProDevice as any)))
) {
  constructor(deviceId: string) {
    super(deviceId, 'FAN');
  }
}

/**
 * Create a SinricProFan device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProFan instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProFan(
  deviceId: string
): SinricProDevice &
  IPowerStateController &
  IRangeController &
  IPushNotification &
  ISettingController {
  return new SinricProFanClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProFan = SinricProDevice &
  IPowerStateController &
  IRangeController &
  IPushNotification &
  ISettingController;
