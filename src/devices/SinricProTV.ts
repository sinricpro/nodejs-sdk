/**
 * SinricProTV - Smart TV device
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { PowerStateController, IPowerStateController } from '../capabilities/PowerStateController';
import { VolumeController, IVolumeController } from '../capabilities/VolumeController';
import { MuteController, IMuteController } from '../capabilities/MuteController';
import { MediaController, IMediaController } from '../capabilities/MediaController';
import { ChannelController, IChannelController } from '../capabilities/ChannelController';
import { InputController, IInputController } from '../capabilities/InputController';
import { SettingController, ISettingController } from '../capabilities/SettingController';
import { PushNotification, IPushNotification } from '../capabilities/PushNotification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProTVClass extends SettingController(
  PushNotification(
    InputController(
      ChannelController(
        MediaController(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          MuteController(VolumeController(PowerStateController(SinricProDevice as any)))
        )
      )
    )
  )
) {
  constructor(deviceId: string) {
    super(deviceId, 'TV');
  }
}

/**
 * Create a SinricProTV device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProTV instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProTV(
  deviceId: string
): SinricProDevice &
  IPowerStateController &
  IVolumeController &
  IMuteController &
  IMediaController &
  IChannelController &
  IInputController &
  IPushNotification &
  ISettingController {
  return new SinricProTVClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProTV = SinricProDevice &
  IPowerStateController &
  IVolumeController &
  IMuteController &
  IMediaController &
  IChannelController &
  IInputController &
  IPushNotification &
  ISettingController;
