/**
 * CameraController - Adds camera control capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export interface ICameraController {
  sendCameraStreamEvent(streamUrl: string, protocol?: string, cause?: string): Promise<boolean>;
  sendSnapshotEvent(imageUrl: string, cause?: string): Promise<boolean>;
}

export function CameraController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements ICameraController {
    private cameraEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    async sendCameraStreamEvent(
      streamUrl: string,
      protocol: string = 'RTSP',
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.cameraEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('setCameraStream', { streamUrl, protocol }, cause);
    }

    async sendSnapshotEvent(
      imageUrl: string,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.cameraEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('snapshot', { imageUrl }, cause);
    }
  };
}
