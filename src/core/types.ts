/**
 * Core type definitions for SinricPro SDK
 */

export interface SinricProConfig {
  appKey: string;
  appSecret: string;
  debug?: boolean;
  /** Answer signed commands over the LAN (UDP 3333). Default: true. */
  localControl?: boolean;
  /** Announce the device over mDNS so apps can discover it. Ignored when localControl is false. Default: true. */
  mdns?: boolean;
}

export interface DeviceConfig {
  deviceId: string;
  productType: string;
}

export enum MessageType {
  Request = 'request',
  Response = 'response',
  Event = 'event',
}

export enum InterfaceType {
  WebSocket = 'websocket',
  UDP = 'udp',
}

export interface WebSocketOrigin {
  transport: InterfaceType.WebSocket;
}

export interface UdpOrigin {
  transport: InterfaceType.UDP;
  address: string;
  port: number;
}

/** Where a message came from, and therefore where its response must go back to. */
export type MessageOrigin = WebSocketOrigin | UdpOrigin;

export const WEBSOCKET_ORIGIN: WebSocketOrigin = { transport: InterfaceType.WebSocket };

/**
 * A queued message keeps its own origin. A response can be sent several loop
 * iterations after it was queued, by which time another peer may have written.
 */
export interface QueuedMessage {
  message: string;
  origin: MessageOrigin;
}

export interface MessageHeader {
  payloadVersion: number;
  signatureVersion: number;
}

export interface MessagePayload {
  action: string;
  deviceId?: string;
  replyToken: string;
  type: MessageType;
  createdAt: number;
  clientId?: string;
  scope?: 'device' | 'module';
  instanceId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: Record<string, any>;
  success?: boolean;
  message?: string;
  cause?: {
    type: string;
  };
}

export interface SinricProMessage {
  header: MessageHeader;
  payload: MessagePayload;
  signature?: {
    HMAC: string;
  };
  timestamp?: number;
}

export interface SinricProRequest {
  action: string;
  instance: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestValue: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responseValue: Record<string, any>;
  errorMessage?: string; // Optional error message from callback
}

export type RequestHandler = (request: SinricProRequest) => Promise<boolean> | boolean;

export type ConnectedCallback = () => void;
export type DisconnectedCallback = () => void;
export type PongCallback = (latency: number) => void;

// Module-level setting callback: (settingId, value) -> boolean
export type ModuleSettingCallback = (
  settingId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
) => Promise<boolean> | boolean;

// Callback result type - supports simple boolean or detailed error response
export type CallbackResult = boolean | { success: boolean; message?: string };

// Capability-specific callback types
export type PowerStateCallback = (
  deviceId: string,
  state: boolean
) => Promise<CallbackResult> | CallbackResult;

export type BrightnessCallback = (
  deviceId: string,
  brightness: number
) => Promise<CallbackResult> | CallbackResult;

export type AdjustBrightnessCallback = (
  deviceId: string,
  brightnessDelta: number
) => Promise<CallbackResult> | CallbackResult;

export type ColorCallback = (
  deviceId: string,
  r: number,
  g: number,
  b: number
) => Promise<CallbackResult> | CallbackResult;

export type ColorTemperatureCallback = (
  deviceId: string,
  colorTemperature: number
) => Promise<CallbackResult> | CallbackResult;

export type TemperatureCallback = (
  deviceId: string,
  temperature: number,
  humidity?: number
) => Promise<CallbackResult> | CallbackResult;

// Constants
export const SINRICPRO_SERVER_URL = 'ws.sinric.pro';
export const SINRICPRO_SERVER_PORT = 80;
export const SINRICPRO_SERVER_SSL_PORT = 443;
export const WEBSOCKET_PING_INTERVAL = 300000; // 5 minutes
export const WEBSOCKET_PING_TIMEOUT = 10000; // 10 seconds
export const EVENT_LIMIT_STATE = 1000; // 1 second
export const EVENT_LIMIT_SENSOR_VALUE = 60000; // 60 seconds

// Local control (LAN) configuration - must match the other SinricPro SDKs
export const UDP_MULTICAST_ADDRESS = '224.9.9.9';
export const UDP_MULTICAST_PORT = 3333;
export const MDNS_SERVICE_TYPE = 'sinricpro';
export const MDNS_SERVICE_PROTOCOL = 'udp';
/** Websocket messages queued while offline are capped so an unreachable cloud cannot exhaust memory. */
export const MAX_QUEUED_WEBSOCKET_MESSAGES = 100;

export const PHYSICAL_INTERACTION = 'PHYSICAL_INTERACTION';
export const APP_INTERACTION = 'APP_INTERACTION';
export const VOICE_INTERACTION = 'VOICE_INTERACTION';
export const PERIODIC_POLL = 'PERIODIC_POLL';
