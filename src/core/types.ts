/**
 * Core type definitions for SinricPro SDK
 */

export interface SinricProConfig {
  appKey: string;
  appSecret: string;
  restoreDeviceStates?: boolean;
  debug?: boolean;
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

export const PHYSICAL_INTERACTION = 'PHYSICAL_INTERACTION';
export const APP_INTERACTION = 'APP_INTERACTION';
export const VOICE_INTERACTION = 'VOICE_INTERACTION';
export const PERIODIC_POLL = 'PERIODIC_POLL';
