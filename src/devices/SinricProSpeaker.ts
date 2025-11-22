/**
 * SinricProSpeaker - Smart speaker device
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { PowerStateController, IPowerStateController } from '../capabilities/PowerStateController';
import { VolumeController, IVolumeController } from '../capabilities/VolumeController';
import { MuteController, IMuteController } from '../capabilities/MuteController';
import { MediaController, IMediaController } from '../capabilities/MediaController';
import { EqualizerController, IEqualizerController } from '../capabilities/EqualizerController';
import { ModeController, IModeController } from '../capabilities/ModeController';
import { SettingController, ISettingController } from '../capabilities/SettingController';
import { PushNotification, IPushNotification } from '../capabilities/PushNotification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProSpeakerClass extends SettingController(
  PushNotification(
    ModeController(
      EqualizerController(
        MediaController(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          MuteController(VolumeController(PowerStateController(SinricProDevice as any)))
        )
      )
    )
  )
) {
  constructor(deviceId: string) {
    super(deviceId, 'SPEAKER');
  }
}

/**
 * Create a SinricProSpeaker device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProSpeaker instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProSpeaker(
  deviceId: string
): SinricProDevice &
  IPowerStateController &
  IVolumeController &
  IMuteController &
  IMediaController &
  IEqualizerController &
  IModeController &
  IPushNotification &
  ISettingController {
  return new SinricProSpeakerClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProSpeaker = SinricProDevice &
  IPowerStateController &
  IVolumeController &
  IMuteController &
  IMediaController &
  IEqualizerController &
  IModeController &
  IPushNotification &
  ISettingController;
