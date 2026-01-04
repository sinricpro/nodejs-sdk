/**
 * SettingController - Adds settings management capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { SinricProRequest } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export type SettingCallback = (
  deviceId: string,
  setting: string,
  value: unknown
) => Promise<boolean> | boolean;

export interface ISettingController {
  onSetting(callback: SettingCallback): void;
  sendSettingEvent(settingId: string, value: unknown, cause?: string): Promise<boolean>;
}

export function SettingController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements ISettingController {
    private settingCallback: SettingCallback | null = null;
    private settingEventLimiter: EventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handleSettingRequest.bind(this));
    }

    onSetting(callback: SettingCallback): void {
      this.settingCallback = callback;
    }

    async sendSettingEvent(
      settingId: string,
      value: unknown,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.settingEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('setSetting', { id: settingId, value }, cause);
    }

    private async handleSettingRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action !== 'setSetting' || !this.settingCallback) {
        return false;
      }

      const settingId = request.requestValue.id;
      const value = request.requestValue.value;
      const success = await this.settingCallback(this.getDeviceId(), settingId, value);

      if (success) {
        request.responseValue.id = settingId;
        request.responseValue.value = value;
      }

      return success;
    }
  };
}
