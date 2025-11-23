/**
 * SinricPro DimSwitch Example
 *
 * This example demonstrates:
 * - Connecting to SinricPro
 * - Creating a dimmable switch device
 * - Handling power state and brightness commands
 * - Sending power state and brightness events
 */

import SinricPro from 'sinricpro';
import { SinricProDimSwitch } from 'sinricpro';
import { SinricProSdkLogger, LogLevel } from 'sinricpro';

const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

async function main() {
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro DimSwitch Example');
  console.log('='.repeat(60));

  // Create dimmable switch device
  const myDimSwitch = SinricProDimSwitch(DEVICE_ID);

  // Handle power state commands
  myDimSwitch.onPowerState(async (deviceId: string, state: boolean) => {
    console.log(`\n[Callback] Device ${deviceId} DimSwitch turned ${state ? 'ON' : 'OFF'}`);

    // Here you would control actual hardware
    // For example: GPIO.write(LED_PIN, state);

    return true; // Return true if successful
  });

  // Handle brightness commands
  myDimSwitch.onPowerLevel(async (deviceId: string, powerLevel: number) => {
    console.log(`\n[Callback] Device ${deviceId} power level set to ${powerLevel}%`);

    // Here you would control actual hardware
    // For example: PWM.setDutyCycle(LED_PIN, level);

    return true; // Return true if successful
  });

  // Add device to SinricPro
  SinricPro.add(myDimSwitch);

  SinricPro.onConnected(() => {
    console.log('\n✓ Connected to SinricPro!');
    console.log('  You can now control the dimmer via Alexa or Google Home');
  });

  SinricPro.onDisconnected(() => {
    console.log('\n✗ Disconnected from SinricPro');
  });

  // Initialize SinricPro
  await SinricPro.begin({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
  });

  // Simulate local state changes every 60 seconds
  // setInterval(async () => {
  //   // Simulate user manually adjusting dimmer
  //   brightness = Math.floor(Math.random() * 101); // Random 0-100
  //   console.log(`\n[Local Event] Brightness manually adjusted to ${brightness}%`);

  //   const success = await myDimSwitch.sendBrightnessEvent(brightness);
  //   if (success) {
  //     console.log('  ✓ Brightness event sent to SinricPro');
  //   }
  // }, 60000);

  console.log('\nWaiting for commands...');
  console.log('Press Ctrl+C to exit\n');
}

process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await SinricPro.stop();
  process.exit(0);
});

main().catch(console.error);
