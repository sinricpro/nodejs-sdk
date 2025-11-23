/**
 * Integration tests for SinricPro connection
 * Note: These tests require valid credentials and will connect to the actual server
 */

import SinricPro from '../../src/core/SinricPro';
import { SinricProSwitch } from '../../src/devices/SinricProSwitch';

describe('SinricPro Connection (Integration)', () => {
  // Skip these tests by default - they require real credentials
  describe.skip('Real connection tests', () => {
    const config = {
      appKey: process.env.SINRIC_APP_KEY || 'test-key',
      appSecret: process.env.SINRIC_APP_SECRET || 'test-secret',
      deviceId: process.env.SINRIC_DEVICE_ID || 'test-device',
    };

    afterEach(async () => {
      await SinricPro.stop();
    });

    it('should connect to SinricPro server', async () => {
      const connectedPromise = new Promise<void>((resolve) => {
        SinricPro.onConnected(() => resolve());
      });

      await SinricPro.begin(config);

      await expect(connectedPromise).resolves.toBeUndefined();
      expect(SinricPro.isConnected()).toBe(true);
    }, 15000);

    it('should handle device addition', async () => {
      await SinricPro.begin(config);

      const device = SinricPro.add(SinricProSwitch(config.deviceId));

      expect(device).toBeDefined();
      expect(device.getDeviceId()).toBe(config.deviceId);
    });
  });

  describe('Mock tests', () => {
    it('should initialize without connecting when credentials are invalid', async () => {
      const config = {
        appKey: 'invalid',
        appSecret: 'invalid',
      };

      await expect(SinricPro.begin(config)).rejects.toThrow();
    });
  });
});
