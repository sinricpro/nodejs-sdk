/**
 * SinricProBlinds - Smart blinds/curtains device
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { PowerStateController, IPowerStateController } from '../capabilities/PowerStateController';
import { OpenCloseController, IOpenCloseController } from '../capabilities/OpenCloseController';
import { SettingController, ISettingController } from '../capabilities/SettingController';
import { PushNotification, IPushNotification } from '../capabilities/PushNotification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProBlindsClass extends SettingController(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PushNotification(PowerStateController(OpenCloseController(SinricProDevice as any)))
) {
  constructor(deviceId: string) {
    super(deviceId, 'BLINDS');
  }
}

/**
 * Create a SinricProBlinds device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProBlinds instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProBlinds(
  deviceId: string
): SinricProDevice &
  IOpenCloseController &
  IPushNotification &
  ISettingController &
  IPowerStateController {
  return new SinricProBlindsClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProBlinds = SinricProDevice &
  IOpenCloseController &
  IPushNotification &
  IPowerStateController &
  ISettingController;
