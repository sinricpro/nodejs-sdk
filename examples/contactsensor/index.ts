/**
 * SinricPro Contact Sensor Example
 *
 * This example demonstrates:
 * - Connecting to SinricPro
 * - Creating a contact sensor device
 * - Sending contact state events (open/closed)
 * - Simulating door/window state changes
 */

import SinricPro from 'sinricpro-sdk';
import { SinricProContactSensor } from 'sinricpro-sdk';
import { SinricProSdkLogger, LogLevel } from 'sinricpro-sdk';

const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

// Simulated sensor state
let doorClosed = true;

async function main() {
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro Contact Sensor Example');
  console.log('='.repeat(60));

  // Create contact sensor device
  const sensor = SinricProContactSensor(DEVICE_ID);

  // Add device to SinricPro
  SinricPro.add(sensor);

  SinricPro.onConnected(() => {
    console.log('\n✓ Connected to SinricPro!');
    console.log('  Sensor will report door/window state changes\n');
  });

  SinricPro.onDisconnected(() => {
    console.log('\n✗ Disconnected from SinricPro');
  });

  // Initialize SinricPro
  await SinricPro.begin({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
  });

  // Simulate door/window state changes every 30 seconds
  setInterval(async () => {
    // Toggle door state
    doorClosed = !doorClosed;

    console.log(`\n[Sensor] Door ${doorClosed ? 'CLOSED' : 'OPENED'}`);

    // Send contact event (true = closed, false = open)
    const success = await sensor.sendContactEvent(doorClosed);

    if (success) {
      console.log(`  ✓ Contact event sent to SinricPro`);
    } else {
      console.log(`  ✗ Failed to send event (rate limited or not connected)`);
    }
  }, 30000);

  console.log('\nSimulating contact sensor...');
  console.log('Press Ctrl+C to exit\n');
}

process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await SinricPro.stop();
  process.exit(0);
});

main().catch(console.error);
