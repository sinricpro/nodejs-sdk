/**
 * UDP listener for local (LAN) control
 *
 * Listens on the SinricPro multicast group and answers unicast requests sent
 * directly to this host on the same port.
 *
 * Emits `message` with (message: string, origin: UdpOrigin) and `error` with an Error.
 */

import dgram from 'dgram';
import { EventEmitter } from 'events';
import { SinricProSdkLogger } from '../../utils/SinricProSdkLogger';
import { getLocalIPv4Addresses } from '../../utils/network';
import { InterfaceType, UDP_MULTICAST_ADDRESS, UDP_MULTICAST_PORT } from '../types';
import type { UdpOrigin } from '../types';

export interface UdpListenerOptions {
  port?: number;
  multicastAddress?: string;
}

export class UdpListener extends EventEmitter {
  private socket: dgram.Socket | null = null;
  private readonly port: number;
  private readonly multicastAddress: string;
  private listening = false;

  constructor(options: UdpListenerOptions = {}) {
    super();
    this.port = options.port ?? UDP_MULTICAST_PORT;
    this.multicastAddress = options.multicastAddress ?? UDP_MULTICAST_ADDRESS;
  }

  start(): Promise<void> {
    if (this.socket) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
      this.socket = socket;

      socket.on('error', (error: Error) => {
        if (!this.listening) {
          SinricProSdkLogger.error(
            `UDP: could not listen on port ${this.port}, local control unavailable:`,
            error.message
          );
          this.socket = null;
          socket.close();
          reject(error);
          return;
        }

        SinricProSdkLogger.error('UDP socket error:', error.message);
        this.emit('error', error);
      });

      socket.on('listening', () => {
        this.listening = true;
        this.joinMulticastGroup(socket);
        SinricProSdkLogger.info(`UDP: listening on port ${this.port}`);
        resolve();
      });

      socket.on('message', (data: Buffer, rinfo: dgram.RemoteInfo) => {
        const message = data.toString('utf8');
        const origin: UdpOrigin = {
          transport: InterfaceType.UDP,
          address: rinfo.address,
          port: rinfo.port,
        };

        SinricProSdkLogger.debug(`UDP received from ${rinfo.address}:${rinfo.port}:`, message);
        this.emit('message', message, origin);
      });

      socket.bind(this.port);
    });
  }

  /**
   * Send a reply on the *listening* socket.
   *
   * A separate send-only socket is what broke this feature on ESP8266: the send
   * reported success and nothing reached the wire. Reception survives sending
   * from the joined socket.
   */
  send(message: string, address: string, port: number): void {
    if (!this.socket) {
      SinricProSdkLogger.error('UDP: not listening, dropping reply');
      return;
    }

    if (!port) {
      SinricProSdkLogger.error('UDP: message has no peer to answer, dropping');
      return;
    }

    const buffer = Buffer.from(message, 'utf8');

    this.socket.send(buffer, port, address, (error) => {
      if (error) {
        SinricProSdkLogger.error(`UDP: reply to ${address}:${port} failed:`, error.message);
        return;
      }
      SinricProSdkLogger.debug(`UDP sent to ${address}:${port}:`, message);
    });
  }

  isListening(): boolean {
    return this.listening;
  }

  stop(): void {
    if (!this.socket) return;

    try {
      this.socket.close();
    } catch (error) {
      SinricProSdkLogger.debug('UDP: error while closing socket:', error);
    }

    this.socket = null;
    this.listening = false;
  }

  /**
   * A silently failed group join is how local control dies invisibly, so the
   * outcome is logged either way.
   */
  private joinMulticastGroup(socket: dgram.Socket): void {
    const interfaces = getLocalIPv4Addresses();
    const joined: string[] = [];

    for (const address of interfaces) {
      try {
        socket.addMembership(this.multicastAddress, address);
        joined.push(address);
      } catch (error) {
        SinricProSdkLogger.debug(
          `UDP: could not join ${this.multicastAddress} on ${address}:`,
          (error as Error).message
        );
      }
    }

    if (joined.length === 0) {
      // No usable interface address; let the OS pick one.
      try {
        socket.addMembership(this.multicastAddress);
        joined.push('default');
      } catch (error) {
        SinricProSdkLogger.error(
          `UDP: failed to join multicast group ${this.multicastAddress}, discovery will not work:`,
          (error as Error).message
        );
        return;
      }
    }

    SinricProSdkLogger.info(
      `UDP: joined multicast group ${this.multicastAddress} on ${joined.join(', ')}`
    );
  }
}
