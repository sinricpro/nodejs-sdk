/**
 * Event rate limiter to prevent excessive event sending
 */

import { SinricProSdkLogger } from '../utils/SinricProSdkLogger';

export class EventLimiter {
  private minimumDistance: number;
  private nextEvent: number = 0;
  private extraDistance: number = 0;
  private failCounter: number = 0;

  constructor(minimumDistance: number = 1000) {
    this.minimumDistance = minimumDistance;
  }

  /**
   * Check if event should be limited
   * @returns true if event should be blocked, false if allowed
   */
  isLimited(): boolean {
    const currentTime = Date.now();
    const failThreshold = Math.floor(this.minimumDistance / 4);

    if (currentTime >= this.nextEvent) {
      if (this.failCounter > failThreshold) {
        this.extraDistance += this.minimumDistance;
        this.failCounter = 0;
        SinricProSdkLogger.warn(
          `Event limiter: Too many events detected. Adding ${this.extraDistance}ms delay.`
        );
      } else {
        this.extraDistance = 0;
      }

      this.nextEvent = currentTime + this.minimumDistance + this.extraDistance;
      return false;
    }

    this.failCounter++;

    if (this.failCounter === failThreshold) {
      SinricProSdkLogger.warn(
        `WARNING: YOUR CODE SENDS EXCESSIVE EVENTS! Events will be limited by an additional ${this.extraDistance / 1000}s delay. Please check your code!`
      );
    }

    return true;
  }

  /**
   * Reset the limiter
   */
  reset(): void {
    this.nextEvent = 0;
    this.extraDistance = 0;
    this.failCounter = 0;
  }
}
