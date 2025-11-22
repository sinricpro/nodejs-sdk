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

      // Should still be limited due to extra delay
      const isLimited = limiter.isLimited();
      expect(isLimited).toBe(true);
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
