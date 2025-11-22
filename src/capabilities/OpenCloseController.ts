/**
 * OpenCloseController - Adds open/close capability (for blinds, curtains)
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { SinricProRequest } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export type OpenCloseCallback = (
  deviceId: string,
  position: number // 0-100 (0=closed, 100=open)
) => Promise<boolean> | boolean;

export interface IOpenCloseController {
  onOpenClose(callback: OpenCloseCallback): void;
  sendOpenCloseEvent(position: number, cause?: string): Promise<boolean>;
}

export function OpenCloseController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IOpenCloseController {
    private openCloseCallback: OpenCloseCallback | null = null;
    private openCloseEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handleOpenCloseRequest.bind(this));
    }

    onOpenClose(callback: OpenCloseCallback): void {
      this.openCloseCallback = callback;
    }

    async sendOpenCloseEvent(
      position: number,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.openCloseEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('setRangeValue', { rangeValue: position }, cause);
    }

    private async handleOpenCloseRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action !== 'setRangeValue' || !this.openCloseCallback) {
        return false;
      }

      const position = request.requestValue.rangeValue;
      const success = await this.openCloseCallback(this.getDeviceId(), position);

      if (success) {
        request.responseValue.rangeValue = position;
      }

      return success;
    }
  };
}
