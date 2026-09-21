import { SinricProTV } from '../../src/devices/SinricProTV';
import { SinricProSpeaker } from '../../src/devices/SinricProSpeaker';
import type { SinricProRequest } from '../../src/core/types';

function volumeRequest(action: string, volume: number, volumeDefault?: boolean): SinricProRequest {
  return {
    action,
    instance: '',
    requestValue: { volume, ...(volumeDefault === undefined ? {} : { volumeDefault }) },
    responseValue: {},
  };
}

describe.each([
  ['TV', SinricProTV],
  ['Speaker', SinricProSpeaker],
] as const)('VolumeController on %s', (_name, createDevice) => {
  it.each([0, 50, 100])('dispatches absolute volume %s only to onVolume', async (volume) => {
    const device = createDevice('test-device');
    const absolute = jest.fn(() => true);
    const relative = jest.fn(() => true);
    device.onVolume(absolute);
    device.onAdjustVolume(relative);
    const request = volumeRequest('setVolume', volume);

    expect(await device.handleRequest(request)).toBe(true);
    expect(absolute).toHaveBeenCalledTimes(1);
    expect(absolute).toHaveBeenCalledWith('test-device', volume);
    expect(relative).not.toHaveBeenCalled();
    expect(request.responseValue).toEqual({ volume });
  });

  it.each([-5, 0, 5])('dispatches relative volume %s only to onAdjustVolume', async (delta) => {
    const device = createDevice('test-device');
    const absolute = jest.fn(() => true);
    let currentVolume = 50;
    const relative = jest.fn(async (_deviceId: string, volumeDelta: number) => {
      currentVolume += volumeDelta;
      return { success: true, volume: currentVolume };
    });
    device.onVolume(absolute);
    device.onAdjustVolume(relative);
    const request = volumeRequest('adjustVolume', delta, false);

    expect(await device.handleRequest(request)).toBe(true);
    expect(relative).toHaveBeenCalledTimes(1);
    expect(relative).toHaveBeenCalledWith('test-device', delta, false);
    expect(currentVolume).toBe(50 + delta);
    expect(absolute).not.toHaveBeenCalled();
    // The server stores this as the device's absolute level, not the delta.
    expect(request.responseValue).toEqual({ volume: 50 + delta });
  });

  it.each([-5, 0, 5])('echoes the %s delta when no volume is reported', async (delta) => {
    const device = createDevice('test-device');
    const request = volumeRequest('adjustVolume', delta, false);
    device.onAdjustVolume(() => true);

    expect(await device.handleRequest(request)).toBe(true);
    expect(request.responseValue).toEqual({ volume: delta });
  });

  it('reports volume 0 rather than falling back to the delta', async () => {
    const device = createDevice('test-device');
    const request = volumeRequest('adjustVolume', -50, false);
    device.onAdjustVolume(() => ({ success: true, volume: 0 }));

    expect(await device.handleRequest(request)).toBe(true);
    expect(request.responseValue).toEqual({ volume: 0 });
  });

  it('ignores a reported volume when the callback fails', async () => {
    const device = createDevice('test-device');
    const request = volumeRequest('adjustVolume', 5, false);
    device.onAdjustVolume(() => ({ success: false, message: 'Amp offline', volume: 55 }));

    expect(await device.handleRequest(request)).toBe(false);
    expect(request.errorMessage).toBe('Amp offline');
    expect(request.responseValue).toEqual({});
  });

  it.each([true, false, undefined])('preserves volumeDefault=%s', async (volumeDefault) => {
    const device = createDevice('test-device');
    const callback = jest.fn(() => true);
    device.onAdjustVolume(callback);

    expect(await device.handleRequest(volumeRequest('adjustVolume', -5, volumeDefault))).toBe(true);
    expect(callback).toHaveBeenCalledWith('test-device', -5, volumeDefault);
  });

  it.each(['setVolume', 'adjustVolume'])('preserves callback errors for %s', async (action) => {
    const device = createDevice('test-device');
    const callback = jest.fn(async () => ({ success: false, message: 'Receiver unavailable' }));
    device.onVolume(callback);
    device.onAdjustVolume(callback);
    const request = volumeRequest(action, 5);

    expect(await device.handleRequest(request)).toBe(false);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(request.errorMessage).toBe('Receiver unavailable');
    expect(request.responseValue).toEqual({});
  });

  it.each(['setVolume', 'adjustVolume'])(
    'returns false without a callback for %s',
    async (action) => {
      const device = createDevice('test-device');
      expect(await device.handleRequest(volumeRequest(action, 5))).toBe(false);
    }
  );
});
