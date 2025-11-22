/**
 * SinricPro Thermostat Example
 *
 * This example demonstrates:
 * - Creating a thermostat device
 * - Reporting temperature readings
 * - Handling power state
 */

import SinricPro from 'sinricpro-sdk';
import { SinricProThermostat } from 'sinricpro-sdk';
import { SinricProSdkLogger, LogLevel } from 'sinricpro-sdk';

// Configuration - Replace with your credentials
const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

async function main() {
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro Thermostat Example');
  console.log('='.repeat(60));

  // Create thermostat device
  const myThermostat = SinricProThermostat(DEVICE_ID);

  myThermostat.onPowerState(async (deviceId, state) => {
    console.log(`\n[Thermostat] Device ${deviceId} ${state ? 'ON' : 'OFF'}`);
    return true;
  });

  myThermostat.onThermostatMode(async (deviceId, mode) => {
    console.log(`\n[Mode] Device ${deviceId} ${mode}`);
    return true;
  });

  myThermostat.onTargetTemperature(async (deviceId, targetTemperature) => {
    console.log(`\n[Target Temperature] Device ${deviceId} ${targetTemperature}°`);
    return true;
  });

  // Add device to SinricPro
  SinricPro.add(myThermostat);

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
    const temperature = 20 + Math.random() * 5; // 20-25°C
    const humidity = 40 + Math.random() * 20; // 40-60%

    console.log(
      `\n[Sensor] Temperature: ${temperature.toFixed(1)}°C, Humidity: ${humidity.toFixed(1)}%`
    );

    const success = await myThermostat.sendTemperatureEvent(
      parseFloat(temperature.toFixed(1)),
      parseFloat(humidity.toFixed(1))
    );

    if (success) {
      console.log('  ✓ Reading sent to SinricPro');
    }
  }, 60000);

  console.log('\nThermostat started. Reporting temperature every 60 seconds...\n');
}

process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await SinricPro.stop();
  process.exit(0);
});

main().catch(console.error);
