/**
 * PowerLevelController - Adds power level control capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { SinricProRequest } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export type PowerLevelCallback = (
  deviceId: string,
  powerLevel: number
) => Promise<boolean> | boolean;

export type AdjustPowerLevelCallback = (
  deviceId: string,
  powerLevelDelta: number
) => Promise<boolean> | boolean;

export interface IPowerLevelController {
  onPowerLevel(callback: PowerLevelCallback): void;
  onAdjustPowerLevel(callback: AdjustPowerLevelCallback): void;
  sendPowerLevelEvent(powerLevel: number, cause?: string): Promise<boolean>;
}

export function PowerLevelController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IPowerLevelController {
    private powerLevelCallback: PowerLevelCallback | null = null;
    private adjustPowerLevelCallback: AdjustPowerLevelCallback | null = null;
    private powerLevelEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handlePowerLevelRequest.bind(this));
    }

    onPowerLevel(callback: PowerLevelCallback): void {
      this.powerLevelCallback = callback;
    }

    onAdjustPowerLevel(callback: AdjustPowerLevelCallback): void {
      this.adjustPowerLevelCallback = callback;
    }

    async sendPowerLevelEvent(
      powerLevel: number,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.powerLevelEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('setPowerLevel', { powerLevel }, cause);
    }

    private async handlePowerLevelRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action === 'setPowerLevel' && this.powerLevelCallback) {
        const powerLevel = request.requestValue.powerLevel;
        const success = await this.powerLevelCallback(this.getDeviceId(), powerLevel);

        if (success) {
          request.responseValue.powerLevel = powerLevel;
        }

        return success;
      }

      if (request.action === 'adjustPowerLevel' && this.adjustPowerLevelCallback) {
        const powerLevelDelta = request.requestValue.powerLevelDelta;
        const success = await this.adjustPowerLevelCallback(this.getDeviceId(), powerLevelDelta);

        if (success) {
          request.responseValue.powerLevel = powerLevelDelta;
        }

        return success;
      }

      return false;
    }
  };
}
