/**
 * mDNS announcement for local (LAN) control
 *
 * Publishes `_sinricpro._udp.local.` so apps on the same network can find this
 * host without going through the cloud.
 *
 * The responder is an optional peer dependency (`bonjour-service`). It is
 * loaded at runtime so the SDK keeps installing with no extra dependencies -
 * without it local control still works for a client that knows the address.
 */

import { SinricProSdkLogger } from '../../utils/SinricProSdkLogger';
import { getMdnsHostName } from '../../utils/network';
import { MDNS_SERVICE_PROTOCOL, MDNS_SERVICE_TYPE, UDP_MULTICAST_PORT } from '../types';
import { version } from '../../../package.json';

const OPTIONAL_MDNS_MODULES = ['bonjour-service', 'bonjour'];

interface MdnsService {
  stop(callback?: () => void): void;
}

interface MdnsResponder {
  publish(config: {
    name: string;
    type: string;
    protocol: 'tcp' | 'udp';
    port: number;
    host?: string;
    txt?: Record<string, string>;
  }): MdnsService;
  destroy(callback?: () => void): void;
}

type MdnsResponderFactory = new () => MdnsResponder;

function loadResponder(): MdnsResponder | null {
  for (const moduleName of OPTIONAL_MDNS_MODULES) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const loaded = require(moduleName);
      const factory: MdnsResponderFactory = loaded?.Bonjour ?? loaded?.default ?? loaded;
      return new factory();
    } catch (error) {
      SinricProSdkLogger.debug(`mDNS: ${moduleName} unavailable:`, (error as Error).message);
    }
  }

  return null;
}

export interface MdnsAnnouncerOptions {
  port?: number;
  hostName?: string;
}

export class MdnsAnnouncer {
  private readonly port: number;
  private readonly hostName: string;
  private responder: MdnsResponder | null = null;
  private service: MdnsService | null = null;
  private deviceIds = '';

  constructor(options: MdnsAnnouncerOptions = {}) {
    this.port = options.port ?? UDP_MULTICAST_PORT;
    this.hostName = options.hostName ?? getMdnsHostName();
  }

  start(deviceIds: string[]): void {
    if (this.responder) return;

    this.responder = loadResponder();

    if (!this.responder) {
      SinricProSdkLogger.warn(
        'mDNS: no responder installed, local control will not be discoverable. ' +
          'Run `npm install bonjour-service` to enable discovery.'
      );
      return;
    }

    this.deviceIds = deviceIds.join(',');
    this.announce();
  }

  /**
   * Re-announce when the device list changes - not on a timer and not on every
   * reconnect.
   */
  update(deviceIds: string[]): void {
    const joined = deviceIds.join(',');
    if (!this.responder || joined === this.deviceIds) return;

    this.deviceIds = joined;

    if (this.service) {
      this.service.stop();
      this.service = null;
    }

    this.announce();
  }

  stop(): void {
    if (this.service) {
      this.service.stop();
      this.service = null;
    }

    if (this.responder) {
      this.responder.destroy();
      this.responder = null;
    }
  }

  isAnnouncing(): boolean {
    return this.service !== null;
  }

  private announce(): void {
    if (!this.responder) return;

    try {
      this.service = this.responder.publish({
        name: this.hostName,
        type: MDNS_SERVICE_TYPE,
        protocol: MDNS_SERVICE_PROTOCOL,
        port: this.port,
        host: `${this.hostName}.local`,
        txt: {
          deviceIds: this.deviceIds,
          sdk: version,
          udp: '1',
        },
      });

      SinricProSdkLogger.info(
        `mDNS: announced _${MDNS_SERVICE_TYPE}._${MDNS_SERVICE_PROTOCOL}.local. ` +
          `host=${this.hostName}.local port=${this.port} deviceIds=${this.deviceIds}`
      );
    } catch (error) {
      SinricProSdkLogger.error('mDNS: failed to announce service:', (error as Error).message);
      this.service = null;
    }
  }
}
