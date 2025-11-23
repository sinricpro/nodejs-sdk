/**
 * ChannelController - Adds TV channel control capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { SinricProRequest } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export interface ChannelInfo {
  name?: string;
  number?: string;
}

export type ChangeChannelCallback = (
  deviceId: string,
  channel: ChannelInfo
) => Promise<boolean> | boolean;

export type SkipChannelsCallback = (
  deviceId: string,
  channelCount: number
) => Promise<boolean> | boolean;

export interface IChannelController {
  onChangeChannel(callback: ChangeChannelCallback): void;
  onSkipChannels(callback: SkipChannelsCallback): void;
  sendChannelEvent(channel: ChannelInfo, cause?: string): Promise<boolean>;
}

export function ChannelController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IChannelController {
    private changeChannelCallback: ChangeChannelCallback | null = null;
    private skipChannelsCallback: SkipChannelsCallback | null = null;
    private channelEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handleChannelRequest.bind(this));
    }

    onChangeChannel(callback: ChangeChannelCallback): void {
      this.changeChannelCallback = callback;
    }

    onSkipChannels(callback: SkipChannelsCallback): void {
      this.skipChannelsCallback = callback;
    }

    async sendChannelEvent(
      channel: ChannelInfo,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.channelEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('changeChannel', { channel }, cause);
    }

    private async handleChannelRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action === 'changeChannel' && this.changeChannelCallback) {
        const channel = request.requestValue.channel;
        const success = await this.changeChannelCallback(this.getDeviceId(), channel);

        if (success) {
          request.responseValue.channel = channel;
        }

        return success;
      }

      if (request.action === 'skipChannels' && this.skipChannelsCallback) {
        const channelCount = request.requestValue.channelCount;
        const success = await this.skipChannelsCallback(this.getDeviceId(), channelCount);

        if (success) {
          request.responseValue.channelCount = channelCount;
        }

        return success;
      }

      return false;
    }
  };
}
