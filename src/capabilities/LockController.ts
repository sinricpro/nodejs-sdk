/**
 * LockController - Adds lock/unlock capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { SinricProRequest } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export type LockStateCallback = (
  deviceId: string,
  lockState: 'LOCKED' | 'UNLOCKED' | 'JAMMED'
) => Promise<boolean> | boolean;

export interface ILockController {
  onLockState(callback: LockStateCallback): void;
  sendLockStateEvent(lockState: 'LOCKED' | 'UNLOCKED' | 'JAMMED', cause?: string): Promise<boolean>;
}

export function LockController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements ILockController {
    private lockStateCallback: LockStateCallback | null = null;
    private lockEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handleLockRequest.bind(this));
    }

    onLockState(callback: LockStateCallback): void {
      this.lockStateCallback = callback;
    }

    async sendLockStateEvent(
      lockState: 'LOCKED' | 'UNLOCKED' | 'JAMMED',
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.lockEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('setLockState', { state: lockState }, cause);
    }

    private async handleLockRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action !== 'setLockState' || !this.lockStateCallback) {
        return false;
      }

      const lockState = request.requestValue.state;
      const success = await this.lockStateCallback(this.getDeviceId(), lockState);

      if (success) {
        request.responseValue.state = lockState;
      }

      return success;
    }
  };
}
