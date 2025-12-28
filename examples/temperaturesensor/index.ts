/**
 * SinricPro Temperature Sensor Example
 *
 * This example demonstrates:
 * - Connecting to SinricPro
 * - Creating a temperature device
 * - Handling power state changes
 * - Sending events when state changes locally
 */

import SinricPro from 'sinricpro';
import { TemperatureSensor } from 'sinricpro';
import { SinricProSdkLogger, LogLevel } from 'sinricpro';

// Configuration - Replace with your credentials
const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

async function main() {
  // Enable debug logging
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro Temperature Example');
  console.log('='.repeat(60));

  // Create temperature sensor device
  const sensor = TemperatureSensor(DEVICE_ID);

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
    // Generate random temperature (20.0 to 40.0°C) and humidity (10.0% to 90.0%)
    const temperature = parseFloat((20 + Math.random() * 20).toFixed(1)); // e.g., 32.7
    const humidity = parseFloat((10 + Math.random() * 80).toFixed(1)); // e.g., 64.3

    // Optional: Only send if values changed significantly (uncomment if needed)
    // const tempChanged = Math.abs(temperature - lastTemperature) >= 0.5;
    // const humidityChanged = Math.abs(humidity - lastHumidity) >= 1.0;
    // if (!tempChanged && !humidityChanged) return;

    const success = await sensor.sendTemperatureEvent(temperature, humidity);

    if (success) {
      console.log('  ✓ Temperature Event sent to SinricPro server');
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
