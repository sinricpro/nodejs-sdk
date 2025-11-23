/**
 * SinricPro Garage Door Example
 *
 * This example demonstrates:
 * - Connecting to SinricPro
 * - Creating a garage door device
 * - Handling open/close commands
 * - Sending door state events
 */

import SinricPro from 'sinricpro';
import { SinricProGarageDoor } from 'sinricpro';
import { SinricProSdkLogger, LogLevel } from 'sinricpro';

const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

async function main() {
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro Garage Door Example');
  console.log('='.repeat(60));

  // Create garage door device
  const myGarageDoor = SinricProGarageDoor(DEVICE_ID);

  // Handle door mode commands (OPEN/CLOSED)
  myGarageDoor.onSetMode(async (deviceId: string, mode: string) => {
    console.log(`\n[Callback] Device ${deviceId} Garage door command: ${mode}`);

    // Here you would control actual hardware
    // For example: motorController.setDoorState(mode);
    if (mode === 'OPEN') {
      console.log('  Opening garage door...');
    } else if (mode === 'CLOSED') {
      console.log('  Closing garage door...');
    }

    // Simulate door operation taking time
    setTimeout(() => {
      console.log(`  Garage door is now ${mode}`);
    }, 3000);

    return true; // Return true if successful
  });

  // Add device to SinricPro
  SinricPro.add(myGarageDoor);

  SinricPro.onConnected(() => {
    console.log('\n✓ Connected to SinricPro!');
    console.log('  You can now control the garage door via Alexa or Google Home');
  });

  SinricPro.onDisconnected(() => {
    console.log('\n✗ Disconnected from SinricPro');
  });

  // Initialize SinricPro
  await SinricPro.begin({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
  });

  // Simulate local door state changes (e.g., manual button press)
  // setInterval(async () => {
  //   doorMode = doorMode === 'OPEN' ? 'CLOSED' : 'OPEN';

  //   console.log(`\n[Local Event] Door manually ${doorMode === 'OPEN' ? 'opened' : 'closed'}`);

  //   const success = await myGarageDoor.sendModeEvent(doorMode);

  //   if (success) {
  //     console.log('  ✓ Door mode event sent to SinricPro');
  //   } else {
  //     console.log('  ✗ Failed to send event (rate limited or not connected)');
  //   }
  // }, 90000);

  console.log('\nWaiting for commands...');
  console.log('Press Ctrl+C to exit\n');
}

process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await SinricPro.stop();
  process.exit(0);
});

main().catch(console.error);
