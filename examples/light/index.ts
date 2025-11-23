/**
 * SinricPro Light Example
 *
 * This example demonstrates:
 * - Creating a smart light device
 * - Handling power, brightness, color, and color temperature
 * - Multiple capability callbacks
 */

import SinricPro from 'sinricpro';
import { SinricProLight } from 'sinricpro';
import { SinricProSdkLogger, LogLevel } from 'sinricpro';

// Configuration - Replace with your credentials
const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

// Simulated light state
const lightState = {
  power: false,
  brightness: 100,
  color: { r: 255, g: 255, b: 255 },
  colorTemperature: 2700,
};

function updateLight() {
  console.log('\n[Light State Updated]');
  console.log(`  Power: ${lightState.power ? 'ON' : 'OFF'}`);
  console.log(`  Brightness: ${lightState.brightness}%`);
  console.log(`  Color: RGB(${lightState.color.r}, ${lightState.color.g}, ${lightState.color.b})`);
  console.log(`  Color Temperature: ${lightState.colorTemperature}K`);
  // Here you would control actual LED hardware
}

async function main() {
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro Smart Light Example');
  console.log('='.repeat(60));

  // Create light device
  const myLight = SinricProLight(DEVICE_ID);

  // Power state callback
  myLight.onPowerState(async (deviceId, state) => {
    console.log(`\n[Power] Device ${deviceId} ${state ? 'ON' : 'OFF'}`);
    lightState.power = state;
    updateLight();
    return true;
  });

  // Brightness callback
  myLight.onBrightness(async (deviceId, brightness) => {
    console.log(`\n[Brightness] Device ${deviceId} Set to ${brightness}%`);
    lightState.brightness = brightness;
    updateLight();
    return true;
  });

  // Adjust brightness callback
  myLight.onAdjustBrightness(async (deviceId, delta) => {
    console.log(`\n[Brightness] Device ${deviceId} Adjust by ${delta > 0 ? '+' : ''}${delta}%`);
    lightState.brightness = Math.max(0, Math.min(100, lightState.brightness + delta));
    console.log(`  New brightness: ${lightState.brightness}%`);
    updateLight();
    return true;
  });

  // Color callback
  myLight.onColor(async (deviceId, r, g, b) => {
    console.log(`\n[Color] Device ${deviceId} RGB(${r}, ${g}, ${b})`);
    lightState.color = { r, g, b };
    updateLight();
    return true;
  });

  // Color temperature callback
  myLight.onColorTemperature(async (deviceId, temperature) => {
    console.log(`\n[Color Temperature] Device ${deviceId} ${temperature}K`);
    lightState.colorTemperature = temperature;
    updateLight();
    return true;
  });

  // Add device to SinricPro
  SinricPro.add(myLight);

  // Connection events
  SinricPro.onConnected(() => {
    console.log('\n✓ Connected to SinricPro!');
  });

  SinricPro.onDisconnected(() => {
    console.log('\n✗ Disconnected from SinricPro');
  });

  // Initialize SinricPro
  await SinricPro.begin({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
  });

  console.log('\nWaiting for commands...');
  console.log('Try: "Alexa, set [device name] to red"');
  console.log('     "Alexa, dim [device name]"');
  console.log('     "Alexa, set [device name] brightness to 50%"\n');
}

process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await SinricPro.stop();
  process.exit(0);
});

main().catch(console.error);
