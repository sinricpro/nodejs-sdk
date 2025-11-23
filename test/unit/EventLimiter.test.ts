/**
 * Unit tests for EventLimiter
 */

import { EventLimiter } from '../../src/core/EventLimiter';

describe('EventLimiter', () => {
  let limiter: EventLimiter;

  beforeEach(() => {
    limiter = new EventLimiter(100); // 100ms minimum distance
  });

  describe('isLimited', () => {
    it('should allow first event', () => {
      const isLimited = limiter.isLimited();
      expect(isLimited).toBe(false);
    });

    it('should block rapid subsequent events', () => {
      limiter.isLimited(); // First event
      const isLimited = limiter.isLimited(); // Immediate second event
      expect(isLimited).toBe(true);
    });

    it('should allow event after minimum distance', async () => {
      limiter.isLimited(); // First event

      // Wait for minimum distance
      await new Promise((resolve) => setTimeout(resolve, 110));

      const isLimited = limiter.isLimited();
      expect(isLimited).toBe(false);
    });

    it('should add extra delay after threshold exceeded', async () => {
      const threshold = 25; // 100ms / 4

      // Exceed threshold
      limiter.isLimited(); // First event (allowed)
      for (let i = 0; i < threshold + 1; i++) {
        limiter.isLimited(); // Blocked events
      }

      // Wait for original minimum distance
      await new Promise((resolve) => setTimeout(resolve, 110));

      // First event after waiting is allowed (but sets extra delay)
      const isAllowed = limiter.isLimited();
      expect(isAllowed).toBe(false);

      // Immediately after, should be limited due to extra delay
      const isLimited = limiter.isLimited();
      expect(isLimited).toBe(true);

      // Should still be limited after waiting just the minimum distance (100ms)
      // Extra delay is 100ms, so total delay needed is 200ms
      // Wait only 95ms to stay well within the limit
      await new Promise((resolve) => setTimeout(resolve, 95));
      const stillLimited = limiter.isLimited();
      expect(stillLimited).toBe(true);

      // After waiting the full extra distance (total > 200ms), should be allowed
      await new Promise((resolve) => setTimeout(resolve, 120));
      const nowAllowed = limiter.isLimited();
      expect(nowAllowed).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset the limiter', () => {
      limiter.isLimited(); // Trigger limiter
      limiter.reset();

      const isLimited = limiter.isLimited();
      expect(isLimited).toBe(false);
    });
  });
});
