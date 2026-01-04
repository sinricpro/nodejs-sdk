/**
 * SinricPro Device Settings Example
 *
 * Demonstrates how to handle device-level configuration settings.
 * Device settings are specific to individual devices, such as tilt angle,
 * movement speed, or device-specific preferences.
 */

import SinricPro from 'sinricpro';
import { SinricProBlinds } from 'sinricpro';
import { SinricProSdkLogger, LogLevel } from 'sinricpro';

// Configuration - Replace with your credentials
const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

async function main() {
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro Device Settings Example');
  console.log('='.repeat(60));

  // Create a blinds device
  const myBlinds = SinricProBlinds(DEVICE_ID);

  // Power state callback
  myBlinds.onPowerState(async (deviceId, state) => {
    console.log(`\n[Callback] Device ${deviceId} Power: ${state ? 'ON' : 'OFF'}`);
    return true;
  });

  // Device-level setting callback
  // This handles settings specific to this device
  myBlinds.onSetting(async (deviceId, settingId, value) => {
    console.log(`\n[Device Setting] ${settingId} = ${value} (type: ${typeof value})`);

    // Handle tilt setting
    if (settingId === 'id_tilt') {
      if (typeof value === 'number' && value >= 0 && value <= 100) {
        return true;
      } else {
        console.log(`  Invalid tilt value: ${value} (must be 0-100)`);
        return false;
      }
    }

    console.log(`  Unknown setting: ${settingId}`);
    return false;
  });

  // Example: Send a device setting event to SinricPro
  // This can be used to report setting changes made locally (e.g., via physical button)
  // setTimeout(async () => {
  //   console.log('\n[Example] Sending device setting event...');
  //   const sent = await myBlinds.sendSettingEvent('id_tilt', 75);
  //   console.log(`  Setting event sent: ${sent}`);
  // }, 5000);

  // Add device to SinricPro
  SinricPro.add(myBlinds);

  SinricPro.onConnected(() => {
    console.log('\nConnected to SinricPro!');
  });

  // Initialize SinricPro
  await SinricPro.begin({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
  });

  console.log('\n' + '='.repeat(60));
  console.log('Device Settings vs Module Settings:');
  console.log('='.repeat(60));
  console.log('  Device Settings: Configuration for THIS specific device');
  console.log('    - Receive via: device.onSetting(callback)');
  console.log('    - Send via: device.sendSettingEvent(settingId, value)');
  console.log('    - Examples: Tilt angle');
  console.log('    - Callback receives: (deviceId, settingId, value)');
  console.log('');
  console.log('  Module Settings: Configuration for the module/board');
  console.log('    - Receive via: SinricPro.onSetSetting(callback)');
  console.log('    - Send via: SinricPro.sendSettingEvent(settingId, value)');
  console.log('    - Examples: WiFi retry count, log level');

  console.log('\n' + '='.repeat(60));

  console.log('\n' + '='.repeat(60));
  console.log('Voice Commands:');
  console.log('='.repeat(60));
  console.log("  'Alexa, turn on [device name]'");
  console.log('  (Device settings are configured via SinricPro portal)');

  console.log('\n' + '='.repeat(60));
  console.log('Waiting for commands...');
  console.log('Press Ctrl+C to exit');
  console.log('='.repeat(60) + '\n');
}

process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await SinricPro.stop();
  process.exit(0);
});

main().catch(console.error);
