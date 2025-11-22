/**
 * WebSocket client for SinricPro communication
 */

import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { SinricProSdkLogger } from '../utils/SinricProSdkLogger';
import {
  SINRICPRO_SERVER_SSL_PORT,
  WEBSOCKET_PING_INTERVAL,
  WEBSOCKET_PING_TIMEOUT,
} from './types';
import { version } from '../../package.json';

export interface WebSocketConfig {
  serverUrl: string;
  appKey: string;
  deviceIds: string[];
  restoreDeviceStates: boolean;
  platform?: string;
  sdkVersion?: string;
}

export class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private pingInterval: NodeJS.Timeout | null = null;
  private pongTimeout: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private connected: boolean = false;
  private shouldReconnect: boolean = true;
  private lastPingTime: number = 0;

  constructor(config: WebSocketConfig) {
    super();
    this.config = {
      platform: 'NodeJS',
      sdkVersion: version,
      ...config,
    };
  }

  async connect(): Promise<void> {
    if (this.connected) {
      SinricProSdkLogger.warn('WebSocket already connected');
      return;
    }

    const protocol = 'wss';
    const port = SINRICPRO_SERVER_SSL_PORT;
    const url = `${protocol}://${this.config.serverUrl}:${port}/`;

    const headers: Record<string, string> = {
      appkey: this.config.appKey,
      deviceids: this.config.deviceIds.join(';'),
      restoredevicestates: this.config.restoreDeviceStates.toString(),
      platform: this.config.platform || 'NodeJS',
      SDKVersion: this.config.sdkVersion || version,
    };

    SinricProSdkLogger.info(`Connecting to ${url}`);
    SinricProSdkLogger.debug('WebSocket headers:', headers);

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url, { headers });

      this.ws.on('open', () => {
        this.connected = true;
        this.startHeartbeat();
        SinricProSdkLogger.info('WebSocket connected');
        this.emit('connected');
        resolve();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        const message = data.toString();
        SinricProSdkLogger.debug('WebSocket received:', message);
        this.emit('message', message);
      });

      this.ws.on('close', () => {
        this.connected = false;
        this.stopHeartbeat();
        SinricProSdkLogger.info('WebSocket disconnected');
        this.emit('disconnected');

        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      });

      this.ws.on('error', (error) => {
        SinricProSdkLogger.error('WebSocket error:', error.message);
        this.emit('error', error);
        reject(error);
      });

      this.ws.on('pong', () => {
        // Clear pong timeout - connection is alive
        if (this.pongTimeout) {
          clearTimeout(this.pongTimeout);
          this.pongTimeout = null;
        }

        const latency = Date.now() - this.lastPingTime;
        SinricProSdkLogger.debug(`WebSocket pong received (latency: ${latency}ms)`);
        this.emit('pong', latency);
      });
    });
  }

  send(message: string): void {
    if (!this.ws || !this.connected) {
      const error = new Error('Cannot send message: WebSocket not connected');
      SinricProSdkLogger.error(error.message);
      throw error;
    }

    SinricProSdkLogger.debug('WebSocket sending:', message);
    this.ws.send(message);
  }

  isConnected(): boolean {
    return this.connected;
  }

  private startHeartbeat(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.connected) {
        this.lastPingTime = Date.now();
        this.ws.ping();
        SinricProSdkLogger.debug('WebSocket ping sent');

        // Set timeout for pong response
        this.pongTimeout = setTimeout(() => {
          SinricProSdkLogger.error('WebSocket pong timeout - connection appears dead');
          // Force close the connection
          if (this.ws) {
            this.ws.terminate();
          }
        }, WEBSOCKET_PING_TIMEOUT);
      }
    }, WEBSOCKET_PING_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      SinricProSdkLogger.info('Attempting to reconnect...');
      this.connect().catch((error) => {
        SinricProSdkLogger.error('Reconnection failed:', error.message);
      });
    }, 5000);
  }

  updateDeviceList(deviceIds: string[]): void {
    this.config.deviceIds = deviceIds;
  }

  async disconnect(): Promise<void> {
    this.shouldReconnect = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connected = false;
  }
}
