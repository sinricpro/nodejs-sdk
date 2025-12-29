/**
 * SinricPro PowerSensor Sensor Example
 *
 * This example demonstrates:
 * - Connecting to SinricPro
 * - Creating a PowerSensor device
 * - Handling power state changes
 * - Sending events when state changes locally
 */

import SinricPro from 'sinricpro';
import { SinricProPowerSensor } from 'sinricpro';
import { SinricProSdkLogger, LogLevel } from 'sinricpro';

// Configuration - Replace with your credentials
const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

async function main() {
  // Enable debug logging
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro PowerSensor Example');
  console.log('='.repeat(60));

  // Create PowerSensor sensor device
  const sensor = SinricProPowerSensor(DEVICE_ID);

  // Add device to SinricPro
  SinricPro.add(sensor);

  // Connection event handlers
  SinricPro.onConnected(() => {
    console.log('\n✓ Connected to SinricPro!');
    console.log('  You can now control the device via Alexa or Google Home');
  });

  SinricPro.onDisconnected(() => {
    console.log('\n✗ Disconnected from SinricPro');
  });

  SinricPro.onPong((latency) => {
    console.log(`\n♥ Heartbeat (latency: ${latency}ms)`);
  });

  // Initialize SinricPro
  await SinricPro.begin({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
  });

  // Simulate local button press every 1 minute
  setInterval(async () => {
    // Generate random reading
    const reading = {
      voltage: 230,
      current: 1,
      power: 230,
      apparentPower: 1,
      reactivePower: 1,
    };

    const success = await sensor.sendPowerSensorEvent(reading);

    if (success) {
      console.log('  ✓ PowerSensor Event sent to SinricPro server');
    } else {
      console.log('  ✗ Failed to send event (rate limited or not connected)');
    }
  }, 60000);

  console.log('\nWaiting for commands ...');
  console.log('Press Ctrl+C to exit\n');
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
