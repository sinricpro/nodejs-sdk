/**
 * MediaController - Adds media playback control capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { SinricProRequest } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export type MediaControlCallback = (
  deviceId: string,
  control: 'Play' | 'Pause' | 'Stop' | 'StartOver' | 'Previous' | 'Next' | 'Rewind' | 'FastForward'
) => Promise<boolean> | boolean;

export interface IMediaController {
  onMediaControl(callback: MediaControlCallback): void;
  sendMediaControlEvent(control: string, cause?: string): Promise<boolean>;
}

export function MediaController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IMediaController {
    private mediaControlCallback: MediaControlCallback | null = null;
    private mediaEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handleMediaControlRequest.bind(this));
    }

    onMediaControl(callback: MediaControlCallback): void {
      this.mediaControlCallback = callback;
    }

    async sendMediaControlEvent(
      control: string,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.mediaEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('mediaControl', { control }, cause);
    }

    private async handleMediaControlRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action !== 'mediaControl' || !this.mediaControlCallback) {
        return false;
      }

      const control = request.requestValue.control as
        | 'Play'
        | 'Pause'
        | 'Stop'
        | 'StartOver'
        | 'Previous'
        | 'Next'
        | 'Rewind'
        | 'FastForward';
      const success = await this.mediaControlCallback(this.getDeviceId(), control);

      if (success) {
        request.responseValue.control = control;
      }

      return success;
    }
  };
}
