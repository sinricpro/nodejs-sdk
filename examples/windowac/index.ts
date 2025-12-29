/**
 * SinricPro Window AC Example
 *
 * Demonstrates:
 * - Power control
 * - Thermostat mode and temperature control
 * - Fan speed control (via range)
 * - Temperature sensor reporting
 */

import SinricPro from 'sinricpro';
import { SinricProWindowAC } from 'sinricpro';
import { SinricProSdkLogger, LogLevel } from 'sinricpro';

// Configuration - Replace with your credentials
const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

// AC state
const acState = {
  power: false,
  mode: 'COOL',
  targetTemperature: 22,
  fanSpeed: 50, // 0-100
  currentTemperature: 25,
  humidity: 60,
};

async function main() {
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro Window AC Example');
  console.log('='.repeat(60));

  // Create Window AC device
  const myAC = SinricProWindowAC(DEVICE_ID);

  // Power control
  myAC.onPowerState(async (deviceId, state) => {
    console.log(`\n[Power] Device ${deviceId} ${state ? 'ON' : 'OFF'}`);
    acState.power = state;
    return true;
  });

  // Thermostat mode control
  myAC.onThermostatMode(async (deviceId, mode) => {
    console.log(`\n[Mode] Device ${deviceId} set to ${mode}`);
    acState.mode = mode;
    return true;
  });

  // Target temperature control
  myAC.onTargetTemperature(async (deviceId, targetTemperature) => {
    console.log(`\n[Target Temperature] Device ${deviceId} set to ${targetTemperature}°`);
    acState.targetTemperature = targetTemperature;
    return true;
  });

  // Fan speed control (range 0-100)
  myAC.onRangeValue(async (deviceId, speed, instanceId) => {
    console.log(`\n[Fan Speed] Device ${deviceId} set to ${speed}%`);
    acState.fanSpeed = speed;
    return true;
  });

  myAC.onAdjustRangeValue(async (deviceId, delta, instanceId) => {
    console.log(`\n[Fan Speed] Device ${deviceId} adjust by ${delta > 0 ? '+' : ''}${delta}%`);
    acState.fanSpeed = Math.max(0, Math.min(100, acState.fanSpeed + delta));
    console.log(`  New fan speed: ${acState.fanSpeed}%`);
    return true;
  });

  // Add device to SinricPro
  SinricPro.add(myAC);

  SinricPro.onConnected(() => {
    console.log('\n✓ Connected to SinricPro!');
  });

  // Initialize SinricPro
  await SinricPro.begin({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
  });

  // Simulate temperature sensor readings every 60 seconds
  setInterval(async () => {
    // Simulate temperature changes
    acState.currentTemperature = 20 + Math.random() * 10; // 20-30°C
    acState.humidity = 40 + Math.random() * 30; // 40-70%

    console.log(
      `\n[Sensor] Temperature: ${acState.currentTemperature.toFixed(1)}°C, Humidity: ${acState.humidity.toFixed(1)}%`
    );

    const success = await myAC.sendTemperatureEvent(
      parseFloat(acState.currentTemperature.toFixed(1)),
      parseFloat(acState.humidity.toFixed(1))
    );

    if (success) {
      console.log('  ✓ Temperature reading sent to SinricPro');
    }
  }, 60000);

  console.log('\nWaiting for commands...');
  console.log('Try: "Alexa, turn on the AC"');
  console.log('     "Alexa, set AC to 22 degrees"');
  console.log('     "Alexa, set AC to cool mode"\n');
}

process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await SinricPro.stop();
  process.exit(0);
});

main().catch(console.error);
