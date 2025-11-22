/**
 * PushNotification - Adds push notification capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export interface IPushNotification {
  sendPushNotification(notification: string, cause?: string): Promise<boolean>;
}

export function PushNotification<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IPushNotification {
    private pushNotificationEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    async sendPushNotification(
      notification: string,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.pushNotificationEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('pushNotification', { notification }, cause);
    }
  };
}
