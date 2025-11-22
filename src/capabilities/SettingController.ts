/**
 * SettingController - Adds settings management capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import type { SinricProRequest } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export type SettingCallback = (
  deviceId: string,
  setting: string,
  value: unknown
) => Promise<boolean> | boolean;

export interface ISettingController {
  onSetting(callback: SettingCallback): void;
}

export function SettingController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements ISettingController {
    private settingCallback: SettingCallback | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handleSettingRequest.bind(this));
    }

    onSetting(callback: SettingCallback): void {
      this.settingCallback = callback;
    }

    private async handleSettingRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action !== 'setSetting' || !this.settingCallback) {
        return false;
      }

      const setting = request.requestValue.setting;
      const value = request.requestValue.value;
      const success = await this.settingCallback(this.getDeviceId(), setting, value);

      if (success) {
        request.responseValue.setting = setting;
        request.responseValue.value = value;
      }

      return success;
    }
  };
}
