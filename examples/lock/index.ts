/**
 * SinricPro Smart Lock Example
 *
 * Demonstrates:
 * - Lock/unlock control
 * - Status reporting
 */

import SinricPro from 'sinricpro';
import { SinricProLock } from 'sinricpro';
import { SinricProSdkLogger, LogLevel } from 'sinricpro';

const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

async function main() {
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro Smart Lock Example');
  console.log('='.repeat(60));

  // Create lock device
  const myLock = SinricProLock(DEVICE_ID);

  // Lock state control
  myLock.onLockState(async (deviceId, lockState) => {
    console.log(`\n[Lock] Device ${deviceId} State changed to: ${lockState}`);

    // Simulate lock/unlock operation
    if (lockState === 'LOCKED') {
      console.log('  🔒 Locking door...');
      // Control your physical lock here
    } else if (lockState === 'UNLOCKED') {
      console.log('  🔓 Unlocking door...');
      // Control your physical lock here
    } else if (lockState === 'JAMMED') {
      console.log('  ⚠️  Lock jammed!');
      // Handle jam condition
    }

    return true;
  });

  // Add device to SinricPro
  SinricPro.add(myLock);

  SinricPro.onConnected(() => {
    console.log('\n✓ Connected to SinricPro!');
  });

  // Initialize SinricPro
  await SinricPro.begin({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
  });

  // Simulate physical lock button every 60 seconds
  setInterval(async () => {
    console.log('\n[Physical Button] Toggling lock...');
    // You could send lock state events here
    await myLock.sendLockStateEvent('LOCKED');
  }, 60000);

  console.log('\nWaiting for commands...');
  console.log('Try: "Alexa, lock the door"');
  console.log('     "Alexa, unlock the door"\n');
}

process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await SinricPro.stop();
  process.exit(0);
});

main().catch(console.error);
