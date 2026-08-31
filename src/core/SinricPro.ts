/**
 * Main SinricPro SDK class
 */

import { EventEmitter } from 'events';
import { WebSocketClient } from './WebSocketClient';
import { MessageQueue } from './MessageQueue';
import { Signature } from './Signature';
import { SinricProDevice, ISinricPro } from './SinricProDevice';
import { SinricProSdkLogger, LogLevel } from '../utils/SinricProSdkLogger';
import { UdpListener } from './local/UdpListener';
import { MdnsAnnouncer } from './local/MdnsAnnouncer';
import type {
  SinricProConfig,
  SinricProMessage,
  SinricProRequest,
  MessageType,
  MessageOrigin,
  QueuedMessage,
  UdpOrigin,
  ConnectedCallback,
  DisconnectedCallback,
  PongCallback,
  ModuleSettingCallback,
} from './types';
import {
  SINRICPRO_SERVER_URL,
  EVENT_LIMIT_STATE,
  PHYSICAL_INTERACTION,
  InterfaceType,
  WEBSOCKET_ORIGIN,
  MAX_QUEUED_WEBSOCKET_MESSAGES,
} from './types';
import { EventLimiter } from './EventLimiter';

// Internal config type with serverUrl
interface InternalConfig extends Required<SinricProConfig> {
  serverUrl: string;
}

export class SinricPro extends EventEmitter implements ISinricPro {
  private static instance: SinricPro;

  private config!: InternalConfig;
  private devices: Map<string, SinricProDevice>;
  private websocket!: WebSocketClient;
  private receiveQueue: MessageQueue;
  private sendQueue: MessageQueue;
  private signature!: Signature;
  private isInitialized: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private moduleSettingCallback: ModuleSettingCallback | null = null;
  private settingEventLimiter: EventLimiter = new EventLimiter(EVENT_LIMIT_STATE);
  private udpListener: UdpListener | null = null;
  private mdnsAnnouncer: MdnsAnnouncer | null = null;

  private constructor() {
    super();
    this.devices = new Map();
    this.receiveQueue = new MessageQueue();
    this.sendQueue = new MessageQueue();
  }

  /**
   * Get the singleton instance of SinricPro
   * @returns The SinricPro singleton instance
   */
  static getInstance(): SinricPro {
    if (!SinricPro.instance) {
      SinricPro.instance = new SinricPro();
    }
    return SinricPro.instance;
  }

  /**
   * Initialize and connect to SinricPro service
   * @param config - Configuration object containing appKey, appSecret, and optional settings
   * @throws {Error} If appKey or appSecret are missing or invalid
   *
   * A cloud connection failure is not fatal: the SDK stays up, retries in the
   * background, and keeps answering local control. Call isConnected() to check
   * cloud state.
   * @example
   * ```typescript
   * await SinricPro.begin({
   *   appKey: 'your-app-key',
   *   appSecret: 'your-app-secret',
   *   debug: false
   * });
   * ```
   */
  async begin(config: SinricProConfig): Promise<void> {
    if (this.isInitialized) {
      SinricProSdkLogger.warn('SinricPro already initialized');
      return;
    }

    // Validate config
    this.validateConfig(config);

    this.config = {
      serverUrl: SINRICPRO_SERVER_URL,
      debug: false,
      localControl: process.env.SINRICPRO_NO_LOCAL_CONTROL !== '1',
      mdns: process.env.SINRICPRO_NOMDNS !== '1',
      ...config,
    };

    // Set log level
    if (this.config.debug) {
      SinricProSdkLogger.setLevel(LogLevel.ERROR);
    }

    SinricProSdkLogger.info('Initializing SinricPro SDK...');

    this.signature = new Signature(this.config.appSecret);

    // Initialize WebSocket
    this.websocket = new WebSocketClient({
      serverUrl: this.config.serverUrl,
      appKey: this.config.appKey,
      deviceIds: Array.from(this.devices.keys()),
    });

    this.setupWebSocketHandlers();

    // Local control is brought up before the cloud on purpose: a host that has
    // never reached SinricPro must still answer signed LAN requests.
    await this.startLocalControl();

    this.isInitialized = true;
    this.startMessageProcessor();

    try {
      await this.websocket.connect();
    } catch (error) {
      // Transport failure is never fatal -- the socket's close handler arms the
      // reconnect timer and local control already answers. Only invalid
      // configuration throws, and validateConfig() has done so above.
      const reason = error instanceof Error ? error.message : String(error);
      SinricProSdkLogger.warn(`Cloud connection failed (${reason}); will keep retrying`);
    }

    SinricProSdkLogger.info('SinricPro SDK initialized successfully');
  }

  private async startLocalControl(): Promise<void> {
    if (!this.config.localControl) {
      SinricProSdkLogger.info('Local control disabled by configuration');
      return;
    }

    this.udpListener = new UdpListener();
    this.udpListener.on('message', (message: string, origin: UdpOrigin) => {
      this.receiveQueue.push({ message, origin });
    });

    try {
      await this.udpListener.start();
    } catch {
      // Already logged by the listener; the cloud path is unaffected.
      this.udpListener = null;
      return;
    }

    if (!this.config.mdns) {
      SinricProSdkLogger.info('mDNS announcement disabled by configuration');
      return;
    }

    this.mdnsAnnouncer = new MdnsAnnouncer();
    this.mdnsAnnouncer.start(Array.from(this.devices.keys()));
  }

  /**
   * Add a device to SinricPro
   * @param device - The device instance to add
   * @returns The added device instance
   * @throws {Error} If deviceId is invalid or not in the correct format
   * @example
   * ```typescript
   * const mySwitch = SinricProSwitch('5dc1564130xxxxxxxxxxxxxx');
   * SinricPro.add(mySwitch);
   * ```
   */
  add<T extends SinricProDevice>(device: T): T {
    const deviceId = device.getDeviceId();

    // Validate device ID format (should be 24 hex characters)
    if (!deviceId || typeof deviceId !== 'string') {
      throw new Error('Invalid device: deviceId is required and must be a string');
    }

    if (!/^[a-f0-9]{24}$/i.test(deviceId)) {
      throw new Error(`Invalid deviceId format: ${deviceId}. Expected 24 hexadecimal characters`);
    }

    if (this.devices.has(deviceId)) {
      SinricProSdkLogger.warn(`Device ${deviceId} already exists, returning existing instance`);
      return this.devices.get(deviceId) as T;
    }

    device.setSinricPro(this);
    this.devices.set(deviceId, device);

    SinricProSdkLogger.info(`Device added: ${deviceId} (${device.getProductType()})`);

    // Update WebSocket device list if already connected
    if (this.isInitialized) {
      this.websocket.updateDeviceList(Array.from(this.devices.keys()));
      // Re-announce only because the device list changed.
      this.mdnsAnnouncer?.update(Array.from(this.devices.keys()));
    }

    return device;
  }

  /**
   * Get a device by its ID
   * @param deviceId - The device ID to look up
   * @returns The device instance if found, undefined otherwise
   */
  get(deviceId: string): SinricProDevice | undefined {
    return this.devices.get(deviceId);
  }

  /**
   * Register a callback for when connected to SinricPro
   * @param callback - Function to call when connected
   * @example
   * ```typescript
   * SinricPro.onConnected(() => {
   *   console.log('Connected to SinricPro!');
   * });
   * ```
   */
  onConnected(callback: ConnectedCallback): void {
    this.on('connected', callback);
  }

  /**
   * Register a callback for when disconnected from SinricPro
   * @param callback - Function to call when disconnected
   */
  onDisconnected(callback: DisconnectedCallback): void {
    this.on('disconnected', callback);
  }

  /**
   * Register a callback for heartbeat pong responses
   * @param callback - Function to call with latency in milliseconds
   */
  onPong(callback: PongCallback): void {
    this.on('pong', callback);
  }

  /**
   * Register a callback for module-level setting changes
   *
   * Module settings are configuration values for the module (dev board) itself,
   * not for individual devices. Use this to handle settings like WiFi retry count,
   * logging level, or other module-wide configurations.
   *
   * @param callback - Function that receives settingId and value, returns boolean or Promise<boolean>
   * @example
   * ```typescript
   * SinricPro.onSetSetting(async (settingId, value) => {
   *   if (settingId === 'wifi_retry_count') {
   *     setWifiRetryCount(value);
   *   }
   *   return true;
   * });
   * ```
   */
  onSetSetting(callback: ModuleSettingCallback): void {
    this.moduleSettingCallback = callback;
  }

  /**
   * Send a module-level setting event to SinricPro server
   *
   * Module settings are configuration values for the module (dev board) itself.
   * Use this to report setting changes like WiFi configuration, logging level,
   * or other module-wide settings.
   *
   * @param settingId - The setting identifier
   * @param value - The setting value (can be any JSON-serializable type)
   * @param cause - (optional) Reason for the event (default: 'PHYSICAL_INTERACTION')
   * @returns Promise<boolean> - true if event was sent, false if rate limited
   * @example
   * ```typescript
   * await SinricPro.sendSettingEvent('wifi_retry_count', 5);
   * await SinricPro.sendSettingEvent('debug_mode', true);
   * ```
   */
  async sendSettingEvent(
    settingId: string,
    value: unknown,
    cause: string = PHYSICAL_INTERACTION
  ): Promise<boolean> {
    if (this.settingEventLimiter.isLimited()) {
      return false;
    }

    if (!this.isConnected()) {
      SinricProSdkLogger.error('Cannot send setting event: Not connected to SinricPro');
      return false;
    }

    const eventMessage: SinricProMessage = {
      header: {
        payloadVersion: 2,
        signatureVersion: 1,
      },
      payload: {
        action: 'setSetting',
        replyToken: this.generateMessageId(),
        type: 'event' as MessageType,
        createdAt: this.getTimestamp(),
        cause: { type: cause },
        scope: 'module',
        value: { id: settingId, value },
      },
    };

    try {
      await this.sendMessage(eventMessage);
      SinricProSdkLogger.debug(`Module setting event sent: ${settingId}`, value);
      return true;
    } catch (error) {
      SinricProSdkLogger.error(`Failed to send module setting event ${settingId}:`, error);
      return false;
    }
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Stop the SinricPro SDK and disconnect from the server
   * @example
   * ```typescript
   * await SinricPro.stop();
   * ```
   */
  async stop(): Promise<void> {
    SinricProSdkLogger.info('Stopping SinricPro SDK...');
    this.isInitialized = false;

    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    this.mdnsAnnouncer?.stop();
    this.mdnsAnnouncer = null;
    this.udpListener?.stop();
    this.udpListener = null;

    await this.websocket.disconnect();
    this.receiveQueue.clear();
    this.sendQueue.clear();

    SinricProSdkLogger.info('SinricPro SDK stopped');
  }

  /**
   * Check if currently connected to SinricPro
   * @returns true if connected, false otherwise
   */
  isConnected(): boolean {
    return this.websocket?.isConnected() || false;
  }

  // ISinricPro interface methods
  async sendMessage(message: SinricProMessage): Promise<void> {
    message.payload.createdAt = this.getTimestamp();
    this.sendQueue.push({ message: this.signature.serialize(message), origin: WEBSOCKET_ORIGIN });
  }

  getTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  sign(message: string): string {
    return this.signature.calculateSignature(message);
  }

  // Private methods
  private setupWebSocketHandlers(): void {
    this.websocket.on('connected', () => {
      SinricProSdkLogger.info('Connected to SinricPro server');
      this.emit('connected');
    });

    this.websocket.on('disconnected', () => {
      SinricProSdkLogger.info('Disconnected from SinricPro server');
      this.emit('disconnected');
    });

    this.websocket.on('message', (msg: string) => {
      this.receiveQueue.push({ message: msg, origin: WEBSOCKET_ORIGIN });
    });

    this.websocket.on('pong', (latency: number) => {
      this.emit('pong', latency);
    });

    this.websocket.on('error', (error: Error) => {
      SinricProSdkLogger.error('WebSocket error:', error);
      // EventEmitter throws on an unhandled 'error' event; a cloud outage must
      // not take down a process that is still serving local control.
      if (this.listenerCount('error') > 0) this.emit('error', error);
    });
  }

  private startMessageProcessor(): void {
    this.processingInterval = setInterval(() => {
      this.processReceiveQueue();
      this.processSendQueue();
    }, 10); // Process every 10ms
  }

  private async processReceiveQueue(): Promise<void> {
    while (!this.receiveQueue.isEmpty()) {
      const entry = this.receiveQueue.pop();
      if (!entry) continue;

      const { message: rawMessage, origin } = entry;

      try {
        const message: SinricProMessage = JSON.parse(rawMessage);

        // Handle timestamp message
        if ('timestamp' in message) {
          continue;
        }

        // Verified against the received bytes, never a re-encoded object.
        if (!this.signature.validate(rawMessage)) {
          SinricProSdkLogger.error('Invalid message signature');
          this.sendInvalidSignatureResponse(message, origin);
          continue;
        }

        // Route message
        if (message.payload.type === ('request' as MessageType)) {
          // Check scope to determine if this is a module or device request
          const scope = message.payload.scope || 'device';
          if (scope === 'module') {
            await this.handleModuleRequest(message, origin);
          } else {
            await this.handleRequest(message, origin);
          }
        } else if (message.payload.type === ('response' as MessageType)) {
          this.emit('response', message);
        }
      } catch (error) {
        SinricProSdkLogger.error('Error processing received message:', error);
      }
    }
  }

  /**
   * Route each queued message by its own origin.
   *
   * The queue as a whole is never gated on the cloud - a UDP reply must go out
   * even when the websocket has never connected.
   */
  private processSendQueue(): void {
    const deferred: QueuedMessage[] = [];

    while (!this.sendQueue.isEmpty()) {
      const entry = this.sendQueue.pop();
      if (!entry) continue;

      if (entry.origin.transport === InterfaceType.UDP) {
        this.udpListener?.send(entry.message, entry.origin.address, entry.origin.port);
        continue;
      }

      if (!this.isConnected()) {
        deferred.push(entry);
        continue;
      }

      try {
        this.websocket.send(entry.message);
      } catch (error) {
        SinricProSdkLogger.error('Failed to send message, will retry later:', error);
        deferred.push(entry);
        break;
      }
    }

    if (deferred.length === 0) return;

    // An unreachable cloud must not grow the queue without bound.
    const dropped = Math.max(0, deferred.length - MAX_QUEUED_WEBSOCKET_MESSAGES);
    if (dropped > 0) {
      SinricProSdkLogger.warn(
        `Dropping ${dropped} websocket message(s): offline backlog exceeded ` +
          `${MAX_QUEUED_WEBSOCKET_MESSAGES}`
      );
    }

    for (const entry of deferred.slice(dropped).reverse()) {
      this.sendQueue.pushFront(entry);
    }
  }

  private async handleRequest(message: SinricProMessage, origin: MessageOrigin): Promise<void> {
    const deviceId = message.payload.deviceId;
    const device = deviceId ? this.devices.get(deviceId) : null;

    if (!device) {
      SinricProSdkLogger.error(`Device not found: ${deviceId}`);
      this.sendErrorResponse(message, `Device ${deviceId} not found`, origin);
      return;
    }

    const request: SinricProRequest = {
      action: message.payload.action,
      instance: message.payload.instanceId || '',
      requestValue: message.payload.value,
      responseValue: {},
    };

    const success = await device.handleRequest(request);
    this.sendResponse(message, success, request.responseValue, origin, request.errorMessage);
  }

  private async handleModuleRequest(
    message: SinricProMessage,
    origin: MessageOrigin
  ): Promise<void> {
    const action = message.payload.action;
    const requestValue = message.payload.value || {};

    if (action === 'setSetting') {
      if (!this.moduleSettingCallback) {
        SinricProSdkLogger.error('No module setting callback registered');
        this.sendModuleResponse(
          message,
          false,
          {},
          origin,
          'No module setting callback registered'
        );
        return;
      }

      const settingId = requestValue.id || '';
      const value = requestValue.value;

      try {
        const success = await this.moduleSettingCallback(settingId, value);
        const responseValue = success ? { id: settingId, value } : {};
        this.sendModuleResponse(message, success, responseValue, origin);
      } catch (error) {
        SinricProSdkLogger.error('Error in module setting callback:', error);
        this.sendModuleResponse(message, false, {}, origin, String(error));
      }
    } else {
      SinricProSdkLogger.error(`Unknown module action: ${action}`);
      this.sendModuleResponse(message, false, {}, origin, `Unknown module action: ${action}`);
    }
  }

  private sendModuleResponse(
    requestMessage: SinricProMessage,
    success: boolean,
    value: Record<string, unknown>,
    origin: MessageOrigin,
    errorMessage?: string
  ): void {
    // Module response does NOT include deviceId
    const responseMessage: SinricProMessage = {
      header: {
        payloadVersion: 2,
        signatureVersion: 1,
      },
      payload: {
        action: requestMessage.payload.action,
        clientId: requestMessage.payload.clientId,
        createdAt: Math.floor(new Date().getTime() / 1000),
        message: errorMessage || (success ? 'OK' : 'Request failed'),
        replyToken: requestMessage.payload.replyToken,
        scope: 'module',
        success,
        type: 'response' as MessageType,
        value,
      },
    };

    this.sendQueue.push({ message: this.signature.serialize(responseMessage), origin });
  }

  private sendResponse(
    requestMessage: SinricProMessage,
    success: boolean,
    value: Record<string, unknown>,
    origin: MessageOrigin,
    errorMessage?: string
  ): void {
    const responseMessage: SinricProMessage = {
      header: {
        payloadVersion: 2,
        signatureVersion: 1,
      },
      payload: {
        action: requestMessage.payload.action,
        clientId: requestMessage.payload.clientId,
        createdAt: Math.floor(new Date().getTime() / 1000),
        deviceId: requestMessage.payload.deviceId,
        message: errorMessage || (success ? 'OK' : 'Request failed'),
        replyToken: requestMessage.payload.replyToken,
        scope: 'device',
        success,
        type: 'response' as MessageType,
        value,
      },
    };

    // instanceId belongs to the payload, so it has to be set before signing.
    if (requestMessage.payload.instanceId) {
      responseMessage.payload.instanceId = requestMessage.payload.instanceId;
    }

    this.sendQueue.push({ message: this.signature.serialize(responseMessage), origin });
  }

  private validateConfig(config: SinricProConfig): void {
    // Validate required fields
    if (!config.appKey || !config.appSecret) {
      throw new Error('appKey and appSecret are required');
    }

    // Validate appKey format (should be UUID-like: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    if (!uuidRegex.test(config.appKey)) {
      throw new Error(
        'Invalid appKey format. Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
      );
    }

    // Validate appSecret format (longer UUID-like with dashes and alphanumeric)
    if (config.appSecret.length < 32) {
      throw new Error('Invalid appSecret: must be at least 32 characters long');
    }
  }

  private sendErrorResponse(
    message: SinricProMessage,
    errorMessage: string,
    origin: MessageOrigin
  ): void {
    this.sendResponse(message, false, { error: errorMessage }, origin);
  }

  /**
   * A request that fails verification is answered rather than dropped, so a
   * client can tell a wrong app secret from an unreachable device.
   */
  private sendInvalidSignatureResponse(message: SinricProMessage, origin: MessageOrigin): void {
    this.sendResponse(message, false, {}, origin, 'Signature is invalid');
  }
}

// Export singleton instance
export default SinricPro.getInstance();
