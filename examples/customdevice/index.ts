/**
 * SinricPro Custom Device Example
 *
 * Demonstrates how to use SinricProCustomDevice to create flexible devices
 * with any combination of capabilities you need.
 */

import SinricPro from 'sinricpro';
import { SinricProCustomDevice } from 'sinricpro';
import { SinricProSdkLogger, LogLevel } from 'sinricpro';

// Configuration - Replace with your credentials
const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

// Device state
const deviceState = {
  power: false,
  brightness: 0,
  temperature: 22.0,
  color: { r: 255, g: 255, b: 255 },
};

async function main() {
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(70));
  console.log('SinricPro Custom Device Example');
  console.log('='.repeat(70));
  console.log('\nThis example demonstrates a custom device that combines:');
  console.log('  - Power control (on/off)');
  console.log('  - Brightness control (0-100%)');
  console.log('  - Color control (RGB)');
  console.log('  - Color temperature control');
  console.log('  - Range control (generic values)');
  console.log('  - Mode control');
  console.log('  - Temperature sensor (reporting)');
  console.log('  - Thermostat control');
  console.log('  - Lock control');
  console.log('  - Settings control');
  console.log('\nYou can mix and match any capabilities you need!');
  console.log('='.repeat(70));

  // Create custom device
  // You can use any product_type from your SinricPro portal
  const customDevice = SinricProCustomDevice(DEVICE_ID, 'CUSTOM_DEVICE');

  // Register callbacks for capabilities you want to use
  // You only need to register the ones you'll actually use!

  // Power control
  customDevice.onPowerState(async (deviceId, state) => {
    deviceState.power = state;
    console.log(`\n[Power] Device ${deviceId} turned ${state ? 'ON' : 'OFF'}`);
    return true;
  });

  // Brightness control
  customDevice.onBrightness(async (deviceId, brightness) => {
    deviceState.brightness = brightness;
    console.log(`\n[Brightness] Set to ${brightness}%`);
    return true;
  });

  customDevice.onAdjustBrightness(async (deviceId, brightnessDelta) => {
    const newBrightness = Math.max(0, Math.min(100, deviceState.brightness + brightnessDelta));
    deviceState.brightness = newBrightness;
    console.log(`\n[Brightness] Adjusted by ${brightnessDelta} to ${newBrightness}%`);
    return true;
  });

  // Color control
  customDevice.onColor(async (deviceId, r, g, b) => {
    deviceState.color = { r, g, b };
    console.log(`\n[Color] Set to RGB(${r}, ${g}, ${b})`);
    return true;
  });

  // Color temperature control
  customDevice.onColorTemperature(async (deviceId, colorTemperature) => {
    console.log(`\n[Color Temperature] Set to ${colorTemperature}K`);
    return true;
  });

  // Range control (generic)
  customDevice.onRangeValue(async (deviceId, rangeValue, instanceId) => {
    if (instanceId) {
      console.log(`\n[Range] Instance '${instanceId}' set to ${rangeValue}`);
    } else {
      console.log(`\n[Range] Set to ${rangeValue}`);
    }
    return true;
  });

  customDevice.onAdjustRangeValue(async (deviceId, rangeValueDelta, instanceId) => {
    if (instanceId) {
      console.log(`\n[Range] Instance '${instanceId}' adjusted by ${rangeValueDelta}`);
    } else {
      console.log(`\n[Range] Adjusted by ${rangeValueDelta}`);
    }
    return true;
  });

  // Mode control
  customDevice.onSetMode(async (deviceId, mode, instanceId) => {
    if (instanceId) {
      console.log(`\n[Mode] Instance '${instanceId}' set to '${mode}'`);
    } else {
      console.log(`\n[Mode] Set to '${mode}'`);
    }
    return true;
  });

  // Thermostat control
  customDevice.onTargetTemperature(async (deviceId, temperature) => {
    deviceState.temperature = temperature;
    console.log(`\n[Thermostat] Target temperature set to ${temperature}°C`);
    return true;
  });

  customDevice.onThermostatMode(async (deviceId, mode) => {
    console.log(`\n[Thermostat] Mode set to ${mode}`);
    return true;
  });

  // Lock control
  customDevice.onLockState(async (deviceId, state) => {
    console.log(`\n[Lock] State set to ${state}`);
    return true;
  });

  // Settings control
  customDevice.onSetting(async (deviceId, settingId, value) => {
    console.log(`\n[Setting] ${settingId} = ${JSON.stringify(value)}`);
    return true;
  });

  // Add device to SinricPro
  SinricPro.add(customDevice);

  // Connection event handlers
  SinricPro.onConnected(() => {
    console.log('\n✓ Connected to SinricPro!');
    console.log('  Custom device is ready.');
  });

  SinricPro.onDisconnected(() => {
    console.log('\n✗ Disconnected from SinricPro');
  });

  // Initialize SinricPro
  await SinricPro.begin({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
  });

  console.log('\n' + '='.repeat(70));
  console.log('Waiting for commands...');
  console.log('Press Ctrl+C to exit');
  console.log('='.repeat(70) + '\n');
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await SinricPro.stop();
  console.log('Goodbye!\n');
  process.exit(0);
});

// Handle unhandled errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

// Run the example
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
