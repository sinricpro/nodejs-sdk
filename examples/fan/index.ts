/**
 * SinricPro Fan Example
 *
 * Demonstrates:
 * - Power control
 * - Speed control (via range)
 */

import SinricPro from 'sinricpro';
import { SinricProFan } from 'sinricpro';
import { SinricProSdkLogger, LogLevel } from 'sinricpro';

const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

async function main() {
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro Smart Fan Example');
  console.log('='.repeat(60));

  // Create fan device
  const myFan = SinricProFan(DEVICE_ID);

  // Power control
  myFan.onPowerState(async (deviceId, state) => {
    console.log(`\n[Fan] Device ${deviceId} ${state ? 'ON' : 'OFF'}`);
    return true;
  });

  // Speed control (0-100)
  myFan.onRangeValue(async (deviceId, speed, instanceId) => {
    console.log(`\n[Fan Speed] Device ${deviceId} Set to ${speed}%`);
    // Map speed to fan levels: 0=off, 1-33=low, 34-66=medium, 67-100=high
    let level;
    if (speed === 0) level = 'OFF';
    else if (speed <= 33) level = 'LOW';
    else if (speed <= 66) level = 'MEDIUM';
    else level = 'HIGH';

    console.log(`  Level: ${level}`);
    return true;
  });

  myFan.onAdjustRangeValue(async (deviceId, delta, instanceId) => {
    console.log(`\n[Fan Speed] Device ${deviceId} Adjust by ${delta > 0 ? '+' : ''}${delta}`);
    return true;
  });

  // Add device to SinricPro
  SinricPro.add(myFan);

  SinricPro.onConnected(() => {
    console.log('\n✓ Connected to SinricPro!');
  });

  // Initialize SinricPro
  await SinricPro.begin({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
  });

  console.log('\nWaiting for commands...');
  console.log('Try: "Alexa, turn on the fan"');
  console.log('     "Alexa, set fan speed to high"\n');
}

process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await SinricPro.stop();
  process.exit(0);
});

main().catch(console.error);
