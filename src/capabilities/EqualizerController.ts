/**
 * EqualizerController - Adds equalizer control capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { SinricProRequest, CallbackResult } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';
import type { SetModeCallback } from './ModeController';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export interface EqualizerBands {
  [key: string]: number; // bass, midrange, treble
}

export type SetBandsCallback = (
  deviceId: string,
  bands: EqualizerBands
) => Promise<CallbackResult> | CallbackResult;

export type AdjustBandsCallback = (
  deviceId: string,
  bands: EqualizerBands
) => Promise<CallbackResult> | CallbackResult;

export interface IEqualizerController {
  onSetBands(callback: SetBandsCallback): void;
  onAdjustBands(callback: AdjustBandsCallback): void;
  onSetMode(callback: SetModeCallback): void;
  sendBandsEvent(bands: EqualizerBands, cause?: string): Promise<boolean>;
  sendModeEvent(mode: string, cause?: string): Promise<boolean>;
}

export function EqualizerController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IEqualizerController {
    private setBandsCallback: SetBandsCallback | null = null;
    private adjustBandsCallback: AdjustBandsCallback | null = null;
    private setModeCallback: SetModeCallback | null = null;
    private equalizerEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handleEqualizerRequest.bind(this));
    }

    onSetBands(callback: SetBandsCallback): void {
      this.setBandsCallback = callback;
    }

    onAdjustBands(callback: AdjustBandsCallback): void {
      this.adjustBandsCallback = callback;
    }

    onSetMode(callback: SetModeCallback): void {
      this.setModeCallback = callback;
    }

    async sendBandsEvent(
      bands: EqualizerBands,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.equalizerEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('setBands', { bands }, cause);
    }

    async sendModeEvent(mode: string, cause: string = PHYSICAL_INTERACTION): Promise<boolean> {
      if (this.equalizerEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('setMode', { mode }, cause);
    }

    private async handleEqualizerRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action === 'setBands' && this.setBandsCallback) {
        const bands = request.requestValue.bands;
        const result = await this.setBandsCallback(this.getDeviceId(), bands);

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
          request.responseValue.bands = bands;
        }

        return success;
      }

      if (request.action === 'adjustBands' && this.adjustBandsCallback) {
        const bands = request.requestValue.bands;
        const result = await this.adjustBandsCallback(this.getDeviceId(), bands);

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
          request.responseValue.bands = bands;
        }

        return success;
      }

      if (request.action === 'setMode' && this.setModeCallback) {
        const mode = request.requestValue.mode;
        const result = await this.setModeCallback(this.getDeviceId(), mode);

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
          request.responseValue.mode = mode;
        }

        return success;
      }

      return false;
    }
  };
}
