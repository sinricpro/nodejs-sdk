/**
 * Unit tests for PowerStateController
 */

import { SinricProDevice } from '../../src/core/SinricProDevice';
import { PowerStateController } from '../../src/capabilities/PowerStateController';
import type { SinricProRequest } from '../../src/core/types';

// Create test device class
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class TestSwitch extends PowerStateController(SinricProDevice as any) {
  constructor(deviceId: string) {
    super(deviceId, 'TEST_SWITCH');
  }
}

describe('PowerStateController', () => {
  let device: TestSwitch;

  beforeEach(() => {
    device = new TestSwitch('test-device-123');
  });

  describe('handleRequest', () => {
    it('should handle setPowerState request with On', async () => {
      let receivedState = false;

      device.onPowerState((deviceId: string, state: boolean) => {
        expect(deviceId).toBe('test-device-123');
        receivedState = state;
        return true;
      });

      const request: SinricProRequest = {
        action: 'setPowerState',
        instance: '',
        requestValue: { state: 'On' },
        responseValue: {},
      };

      const result = await device.handleRequest(request);

      expect(result).toBe(true);
      expect(receivedState).toBe(true);
      expect(request.responseValue.state).toBe('On');
    });

    it('should handle setPowerState request with Off', async () => {
      let receivedState = true;

      device.onPowerState((_deviceId: string, state: boolean) => {
        receivedState = state;
        return true;
      });

      const request: SinricProRequest = {
        action: 'setPowerState',
        instance: '',
        requestValue: { state: 'Off' },
        responseValue: {},
      };

      const result = await device.handleRequest(request);

      expect(result).toBe(true);
      expect(receivedState).toBe(false);
      expect(request.responseValue.state).toBe('Off');
    });

    it('should return false when callback is not set', async () => {
      const request: SinricProRequest = {
        action: 'setPowerState',
        instance: '',
        requestValue: { state: 'On' },
        responseValue: {},
      };

      const result = await device.handleRequest(request);

      expect(result).toBe(false);
    });

    it('should return false for unknown action', async () => {
      device.onPowerState(() => true);

      const request: SinricProRequest = {
        action: 'unknownAction',
        instance: '',
        requestValue: {},
        responseValue: {},
      };

      const result = await device.handleRequest(request);

      expect(result).toBe(false);
    });

    it('should handle async callbacks', async () => {
      device.onPowerState(async (_deviceId: string, _state: boolean) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return true;
      });

      const request: SinricProRequest = {
        action: 'setPowerState',
        instance: '',
        requestValue: { state: 'On' },
        responseValue: {},
      };

      const result = await device.handleRequest(request);

      expect(result).toBe(true);
    });
  });

  describe('getDeviceId', () => {
    it('should return correct device ID', () => {
      expect(device.getDeviceId()).toBe('test-device-123');
    });
  });

  describe('getProductType', () => {
    it('should return correct product type', () => {
      expect(device.getProductType()).toBe('sinric.device.type.TEST_SWITCH');
    });
  });
});
