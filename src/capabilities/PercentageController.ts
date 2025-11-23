/**
 * PercentageController - Adds percentage control capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { SinricProRequest } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export type PercentageCallback = (
  deviceId: string,
  percentage: number
) => Promise<boolean> | boolean;

export type AdjustPercentageCallback = (
  deviceId: string,
  percentageDelta: number
) => Promise<boolean> | boolean;

export interface IPercentageController {
  onPercentage(callback: PercentageCallback): void;
  onAdjustPercentage(callback: AdjustPercentageCallback): void;
  sendPercentageEvent(percentage: number, cause?: string): Promise<boolean>;
}

export function PercentageController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IPercentageController {
    private percentageCallback: PercentageCallback | null = null;
    private adjustPercentageCallback: AdjustPercentageCallback | null = null;
    private percentageEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handlePercentageRequest.bind(this));
    }

    onPercentage(callback: PercentageCallback): void {
      this.percentageCallback = callback;
    }

    onAdjustPercentage(callback: AdjustPercentageCallback): void {
      this.adjustPercentageCallback = callback;
    }

    async sendPercentageEvent(
      percentage: number,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.percentageEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('setPercentage', { percentage }, cause);
    }

    private async handlePercentageRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action === 'setPercentage' && this.percentageCallback) {
        const percentage = request.requestValue.percentage;
        const success = await this.percentageCallback(this.getDeviceId(), percentage);

        if (success) {
          request.responseValue.percentage = percentage;
        }

        return success;
      }

      if (request.action === 'adjustPercentage' && this.adjustPercentageCallback) {
        const percentageDelta = request.requestValue.percentageDelta;
        const success = await this.adjustPercentageCallback(this.getDeviceId(), percentageDelta);

        if (success) {
          request.responseValue.percentage = percentageDelta;
        }

        return success;
      }

      return false;
    }
  };
}
