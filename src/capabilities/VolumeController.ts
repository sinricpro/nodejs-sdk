/**
 * VolumeController - Adds volume control capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { SinricProRequest, CallbackResult } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export type VolumeCallback = (
  deviceId: string,
  volume: number
) => Promise<CallbackResult> | CallbackResult;

export type AdjustVolumeCallback = (
  deviceId: string,
  volumeDelta: number
) => Promise<CallbackResult> | CallbackResult;

export interface IVolumeController {
  onVolume(callback: VolumeCallback): void;
  onAdjustVolume(callback: AdjustVolumeCallback): void;
  sendVolumeEvent(volume: number, cause?: string): Promise<boolean>;
}

export function VolumeController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IVolumeController {
    private volumeCallback: VolumeCallback | null = null;
    private adjustVolumeCallback: AdjustVolumeCallback | null = null;
    private volumeEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handleVolumeRequest.bind(this));
    }

    onVolume(callback: VolumeCallback): void {
      this.volumeCallback = callback;
    }

    onAdjustVolume(callback: AdjustVolumeCallback): void {
      this.adjustVolumeCallback = callback;
    }

    async sendVolumeEvent(volume: number, cause: string = PHYSICAL_INTERACTION): Promise<boolean> {
      if (this.volumeEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('setVolume', { volume }, cause);
    }

    private async handleVolumeRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action === 'setVolume' && this.volumeCallback) {
        const volume = request.requestValue.volume;
        const result = await this.volumeCallback(this.getDeviceId(), volume);

        // Handle both boolean and object return types
        let success: boolean;
        if (typeof result === 'boolean') {
          success = result;
        } else {
          success = result.success;
          if (result.message) {
            request.errorMessage = result.message;
          }
        }

        if (success) {
          request.responseValue.volume = volume;
        }

        return success;
      }

      if (request.action === 'adjustVolume' && this.adjustVolumeCallback) {
        const volumeDelta = request.requestValue.volumeDelta;
        const result = await this.adjustVolumeCallback(this.getDeviceId(), volumeDelta);

        // Handle both boolean and object return types
        let success: boolean;
        if (typeof result === 'boolean') {
          success = result;
        } else {
          success = result.success;
          if (result.message) {
            request.errorMessage = result.message;
          }
        }

        if (success) {
          request.responseValue.volume = volumeDelta;
        }

        return success;
      }

      return false;
    }
  };
}
