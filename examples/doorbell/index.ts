/**
 * SinricPro Doorbell Example
 *
 * This example demonstrates:
 * - Connecting to SinricPro
 * - Creating a doorbell device
 * - Sending doorbell press events
 * - Simulating doorbell button presses
 */

import SinricPro from 'sinricpro';
import { SinricProDoorbell } from 'sinricpro';
import { SinricProSdkLogger, LogLevel } from 'sinricpro';

const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

async function main() {
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro Doorbell Example');
  console.log('='.repeat(60));

  // Create doorbell device
  const myDoorbell = SinricProDoorbell(DEVICE_ID);

  // Add device to SinricPro
  SinricPro.add(myDoorbell);

  SinricPro.onConnected(() => {
    console.log('\n✓ Connected to SinricPro!');
    console.log('  Doorbell will send press events to trigger notifications\n');
  });

  SinricPro.onDisconnected(() => {
    console.log('\n✗ Disconnected from SinricPro');
  });

  // Initialize SinricPro
  await SinricPro.begin({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
  });

  // Simulate doorbell button presses every 60 seconds
  setInterval(async () => {
    console.log('\n[Doorbell] Button PRESSED');

    // Send doorbell pressed event
    const success = await myDoorbell.sendDoorbellEvent();

    if (success) {
      console.log('  ✓ Doorbell press event sent to SinricPro');
      console.log('  📱 Notification should be sent to your phone/devices');
    } else {
      console.log('  ✗ Failed to send event (rate limited or not connected)');
    }

    // Optional: Send released event after a short delay
    setTimeout(async () => {
      await myDoorbell.sendDoorbellEvent();
      console.log('  Button RELEASED');
    }, 500);
  }, 60000);

  console.log('\nSimulating doorbell button presses...');
  console.log('Press Ctrl+C to exit\n');
}

process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await SinricPro.stop();
  process.exit(0);
});

main().catch(console.error);
