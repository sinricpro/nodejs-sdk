/**
 * SinricPro Motion Sensor Example
 *
 * This example demonstrates:
 * - Connecting to SinricPro
 * - Creating a motion sensor device
 * - Sending motion detection events
 * - Simulating motion detection
 */

import SinricPro from 'sinricpro';
import { SinricProMotionSensor } from 'sinricpro';
import { SinricProSdkLogger, LogLevel } from 'sinricpro';

const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

// Simulated sensor state
let motionDetected = false;

async function main() {
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro Motion Sensor Example');
  console.log('='.repeat(60));

  // Create motion sensor device
  const sensor = SinricProMotionSensor(DEVICE_ID);

  // Add device to SinricPro
  SinricPro.add(sensor);

  SinricPro.onConnected(() => {
    console.log('\n✓ Connected to SinricPro!');
    console.log('  Sensor will report motion detection events\n');
  });

  SinricPro.onDisconnected(() => {
    console.log('\n✗ Disconnected from SinricPro');
  });

  // Initialize SinricPro
  await SinricPro.begin({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
  });

  // Simulate motion detection every 30 seconds
  setInterval(async () => {
    // Toggle motion state
    motionDetected = !motionDetected;

    console.log(`\n[Sensor] Motion ${motionDetected ? 'DETECTED' : 'NOT DETECTED'}`);

    // Send motion event (true = motion detected, false = no motion)
    const success = await sensor.sendMotionEvent(motionDetected);

    if (success) {
      console.log(`  ✓ Motion event sent to SinricPro`);
    } else {
      console.log(`  ✗ Failed to send event (rate limited or not connected)`);
    }
  }, 30000);

  console.log('\nSimulating motion sensor...');
  console.log('Press Ctrl+C to exit\n');
}

process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await SinricPro.stop();
  process.exit(0);
});

main().catch(console.error);
