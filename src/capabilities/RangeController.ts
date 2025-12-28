/**
 * RangeController - Adds generic range control capability
 * Supports optional instanceId for multi-instance range control
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { SinricProRequest } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export type RangeValueCallback = (
  deviceId: string,
  rangeValue: number,
  instanceId: string
) => Promise<boolean> | boolean;

export type AdjustRangeValueCallback = (
  deviceId: string,
  rangeValueDelta: number,
  instanceId: string
) => Promise<boolean> | boolean;

export interface IRangeController {
  onRangeValue(callback: RangeValueCallback): void;
  onAdjustRangeValue(callback: AdjustRangeValueCallback): void;
  sendRangeValueEvent(rangeValue: number, instanceId?: string, cause?: string): Promise<boolean>;
}

export function RangeController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IRangeController {
    private rangeValueCallback: RangeValueCallback | null = null;
    private adjustRangeValueCallback: AdjustRangeValueCallback | null = null;
    private rangeEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handleRangeRequest.bind(this));
    }

    onRangeValue(callback: RangeValueCallback): void {
      this.rangeValueCallback = callback;
    }

    onAdjustRangeValue(callback: AdjustRangeValueCallback): void {
      this.adjustRangeValueCallback = callback;
    }

    async sendRangeValueEvent(
      rangeValue: number,
      instanceId: string = '',
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.rangeEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('setRangeValue', { rangeValue }, cause, instanceId);
    }

    private async handleRangeRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action === 'setRangeValue' && this.rangeValueCallback) {
        const rangeValue = request.requestValue.rangeValue;
        const instanceId = request.instance || '';
        const success = await this.rangeValueCallback(this.getDeviceId(), rangeValue, instanceId);

        if (success) {
          request.responseValue.rangeValue = rangeValue;
        }

        return success;
      }

      if (request.action === 'adjustRangeValue' && this.adjustRangeValueCallback) {
        const rangeValueDelta = request.requestValue.rangeValueDelta;
        const instanceId = request.instance || '';
        const success = await this.adjustRangeValueCallback(
          this.getDeviceId(),
          rangeValueDelta,
          instanceId
        );

        if (success) {
          request.responseValue.rangeValue = rangeValueDelta;
        }

        return success;
      }

      return false;
    }
  };
}
