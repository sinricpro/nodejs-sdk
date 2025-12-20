/**
 * Main SinricPro SDK class
 */

import { EventEmitter } from 'events';
import { WebSocketClient } from './WebSocketClient';
import { MessageQueue } from './MessageQueue';
import { Signature } from './Signature';
import { SinricProDevice, ISinricPro } from './SinricProDevice';
import { SinricProSdkLogger, LogLevel } from '../utils/SinricProSdkLogger';
import type {
  SinricProConfig,
  SinricProMessage,
  SinricProRequest,
  MessageType,
  ConnectedCallback,
  DisconnectedCallback,
  PongCallback,
} from './types';
import { SINRICPRO_SERVER_URL } from './types';

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
   * @throws {Error} If connection to SinricPro server fails
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

    try {
      await this.websocket.connect();
      this.isInitialized = true;
      this.startMessageProcessor();
      SinricProSdkLogger.info('SinricPro SDK initialized successfully');
    } catch (error) {
      SinricProSdkLogger.error('Failed to initialize SinricPro:', error);
      throw error;
    }
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
    this.signature.sign(message);
    this.sendQueue.push(JSON.stringify(message));
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
      this.receiveQueue.push(msg);
    });

    this.websocket.on('pong', (latency: number) => {
      this.emit('pong', latency);
    });

    this.websocket.on('error', (error: Error) => {
      SinricProSdkLogger.error('WebSocket error:', error);
      this.emit('error', error);
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
      const rawMessage = this.receiveQueue.pop();
      if (!rawMessage) continue;

      try {
        const message: SinricProMessage = JSON.parse(rawMessage);

        // Handle timestamp message
        if ('timestamp' in message) {
          continue;
        }

        // Validate signature
        if (!this.signature.validate(message)) {
          SinricProSdkLogger.error('Invalid message signature');
          this.sendInvalidSignatureResponse(message);
          continue;
        }

        // Route message
        if (message.payload.type === ('request' as MessageType)) {
          await this.handleRequest(message);
        } else if (message.payload.type === ('response' as MessageType)) {
          this.emit('response', message);
        }
      } catch (error) {
        SinricProSdkLogger.error('Error processing received message:', error);
      }
    }
  }

  private processSendQueue(): void {
    if (!this.isConnected()) {
      return;
    }

    while (!this.sendQueue.isEmpty()) {
      const message = this.sendQueue.pop();
      if (message) {
        try {
          this.websocket.send(message);
        } catch (error) {
          // If send fails, put message back in queue and stop processing
          this.sendQueue.push(message);
          SinricProSdkLogger.error('Failed to send message, will retry later:', error);
          break;
        }
      }
    }
  }

  private async handleRequest(message: SinricProMessage): Promise<void> {
    const deviceId = message.payload.deviceId;
    const device = deviceId ? this.devices.get(deviceId) : null;

    if (!device) {
      SinricProSdkLogger.error(`Device not found: ${deviceId}`);
      this.sendErrorResponse(message, `Device ${deviceId} not found`);
      return;
    }

    const request: SinricProRequest = {
      action: message.payload.action,
      instance: message.payload.instanceId || '',
      requestValue: message.payload.value,
      responseValue: {},
    };

    const success = await device.handleRequest(request);
    this.sendResponse(message, success, request.responseValue, request.errorMessage);
  }

  private sendResponse(
    requestMessage: SinricProMessage,
    success: boolean,
    value: Record<string, unknown>,
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
        success,
        type: 'response' as MessageType,
        value,
      },
    };

    this.signature.sign(responseMessage);

    if (requestMessage.payload.instanceId) {
      responseMessage.payload.instanceId = requestMessage.payload.instanceId;
    }

    this.sendQueue.push(JSON.stringify(responseMessage));
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

  private sendErrorResponse(message: SinricProMessage, errorMessage: string): void {
    this.sendResponse(message, false, { error: errorMessage });
  }

  private sendInvalidSignatureResponse(message: SinricProMessage): void {
    this.sendErrorResponse(message, 'Invalid signature');
  }
}

// Export singleton instance
export default SinricPro.getInstance();
