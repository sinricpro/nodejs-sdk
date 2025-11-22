/**
 * SinricPro Blinds Example
 *
 * This example demonstrates:
 * - Connecting to SinricPro
 * - Creating a blinds device
 * - Handling open/close/position commands
 * - Sending position change events
 */

import SinricPro from 'sinricpro-sdk';
import { SinricProBlinds } from 'sinricpro-sdk';
import { SinricProSdkLogger, LogLevel } from 'sinricpro-sdk';

const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

// Simulated device state
let currentPosition = 0; // 0 = closed, 100 = open

async function main() {
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro Blinds Example');
  console.log('='.repeat(60));

  // Create blinds device
  const myBlinds = SinricProBlinds(DEVICE_ID);

  // Handle power state commands
  myBlinds.onPowerState(async (deviceId: string, state: boolean) => {
    console.log(`\n[Callback] Device ${deviceId} Blinds turned ${state ? 'ON' : 'OFF'}`);

    // Here you would control actual hardware
    // For example: GPIO.write(LED_PIN, state);

    return true; // Return true if successful
  });

  // Handle open/close position commands
  myBlinds.onOpenClose(async (deviceId: string, position: number) => {
    console.log(
      `\n[Callback] Device ${deviceId} Blinds position requested: ${position}% (0=closed, 100=open)`
    );

    // Update local state
    currentPosition = position;

    // Here you would control actual hardware
    // For example: motorController.setPosition(position);
    console.log(`  Moving blinds to ${position}%...`);

    return true; // Return true if successful
  });

  // Add device to SinricPro
  SinricPro.add(myBlinds);

  SinricPro.onConnected(() => {
    console.log('\n✓ Connected to SinricPro!');
    console.log('  You can now control the blinds via Alexa or Google Home');
  });

  SinricPro.onDisconnected(() => {
    console.log('\n✗ Disconnected from SinricPro');
  });

  // Initialize SinricPro
  await SinricPro.begin({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
  });

  // Simulate local position changes every 60 seconds
  setInterval(async () => {
    // Simulate user manually adjusting blinds
    currentPosition = currentPosition === 100 ? 0 : 100;

    console.log(`\n[Local Event] Blinds manually adjusted to ${currentPosition}%`);

    const success = await myBlinds.sendOpenCloseEvent(currentPosition);

    if (success) {
      console.log('  ✓ Position event sent to SinricPro');
    } else {
      console.log('  ✗ Failed to send event (rate limited or not connected)');
    }
  }, 60000);

  console.log('\nWaiting for commands...');
  console.log('Press Ctrl+C to exit\n');
}

process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await SinricPro.stop();
  process.exit(0);
});

main().catch(console.error);
