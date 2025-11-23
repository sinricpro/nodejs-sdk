/**
 * Simple logger utility for SinricPro SDK
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export class SinricProSdkLogger {
  private static level: LogLevel = LogLevel.INFO;

  static setLevel(level: LogLevel): void {
    SinricProSdkLogger.level = level;
  }

  static debug(message: string, ...args: unknown[]): void {
    if (SinricProSdkLogger.level <= LogLevel.DEBUG) {
      console.log(`[SinricPro:DEBUG] ${message}`, ...args);
    }
  }

  static info(message: string, ...args: unknown[]): void {
    if (SinricProSdkLogger.level <= LogLevel.INFO) {
      console.log(`[SinricPro:INFO] ${message}`, ...args);
    }
  }

  static warn(message: string, ...args: unknown[]): void {
    if (SinricProSdkLogger.level <= LogLevel.WARN) {
      console.warn(`[SinricPro:WARN] ${message}`, ...args);
    }
  }

  static error(message: string, ...args: unknown[]): void {
    if (SinricProSdkLogger.level <= LogLevel.ERROR) {
      console.error(`[SinricPro:ERROR] ${message}`, ...args);
    }
  }
}
