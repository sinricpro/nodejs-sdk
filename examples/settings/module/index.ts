/**
 * SinricPro Module Settings Example
 *
 * Demonstrates how to handle module-level configuration settings.
 * Module settings are for the module (dev board) itself, not for individual devices.
 */

import SinricPro from 'sinricpro';
import { SinricProSwitch } from 'sinricpro';
import { SinricProSdkLogger, LogLevel } from 'sinricpro';

// Configuration - Replace with your credentials
const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

// Module configuration values
const moduleConfig: Record<string, unknown> = {
  wifiRetryCount: 3,
};

async function main() {
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro Module Settings Example');
  console.log('='.repeat(60));

  // Create a switch device (module settings work alongside device settings)
  const mySwitch = SinricProSwitch(DEVICE_ID);

  // Device-level power state callback
  mySwitch.onPowerState(async (deviceId, state) => {
    console.log(`\n[Device] ${deviceId} Power: ${state ? 'ON' : 'OFF'}`);
    return true;
  });

  // Add device to SinricPro
  SinricPro.add(mySwitch);

  // Register module-level setting callback
  // This is separate from device-level settings (device.onSetting())
  SinricPro.onSetSetting(async (settingId, value) => {
    console.log(`\n[Module Setting] ${settingId} = ${value}`);

    // Handle different setting types
    if (settingId === 'if_wifiretrycount') {
      if (typeof value === 'number' && value >= 1 && value <= 10) {
        moduleConfig.wifiRetryCount = value;
        console.log(`  WiFi retry count set to ${value}`);
        return true;
      } else {
        console.log(`  Invalid wifi_retry_count value: ${value}`);
        return false;
      }
    }

    console.log(`  Unknown setting: ${settingId}`);
    return false;
  });

  SinricPro.onConnected(() => {
    console.log('\nConnected to SinricPro!');

    // Example: Send a module setting event to SinricPro
    // This can be used to report module-level settings changes
    // setTimeout(async () => {
    //   console.log('\n[Example] Sending module setting event...');
    //   const sent = await SinricPro.sendSettingEvent('if_wifiretrycount', 5);
    //   console.log(`  Module setting event sent: ${sent}`);
    // }, 5000);
  });

  // Initialize SinricPro
  await SinricPro.begin({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
  });

  console.log('\n' + '='.repeat(60));
  console.log('Module Settings vs Device Settings:');
  console.log('='.repeat(60));
  console.log('  Module Settings: Configuration for the module/board itself');
  console.log('    - Receive via: SinricPro.onSetSetting(callback)');
  console.log('    - Send via: SinricPro.sendSettingEvent(settingId, value)');
  console.log('    - Examples: WiFi retry count');
  console.log('');
  console.log('  Device Settings: Configuration for individual devices');
  console.log('    - Receive via: device.onSetting(callback)');
  console.log('    - Send via: device.sendSettingEvent(settingId, value)');
  console.log('');

  console.log('\n' + '='.repeat(60));
  console.log('Current Module Configuration:');
  console.log('='.repeat(60));
  for (const [key, value] of Object.entries(moduleConfig)) {
    console.log(`  ${key}: ${value}`);
  }

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
