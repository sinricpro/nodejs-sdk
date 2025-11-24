/**
 * SinricPro Switch Example (JavaScript)
 *
 * This example demonstrates:
 * - Connecting to SinricPro
 * - Creating a switch device
 * - Handling power state changes
 * - Sending events when state changes locally
 */

// Import SDK - note the .default for the singleton instance
const { default: SinricPro, SinricProSwitch, SinricProSdkLogger, LogLevel } = require('sinricpro');

// Configuration - Replace with your credentials from https://portal.sinric.pro
const DEVICE_ID = 'DEVICE_ID'; // 24-character hex (e.g., '5f5f5f5f5f5f5f5f5f5f5f5f')
const APP_KEY = 'APP_KEY'; // UUID format (e.g., '12345678-1234-1234-1234-123456789012')
const APP_SECRET = 'APP_SECRET'; // Long secret key

// Simulated device state
let devicePowerState = false;

async function main() {
  // Enable debug logging (options: ERROR, WARN, INFO, DEBUG)
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro Switch Example (JavaScript)');
  console.log('='.repeat(60));

  // Create switch device
  const mySwitch = SinricProSwitch(DEVICE_ID);

  // Set up power state callback
  // This is called when Alexa/Google Home sends a command
  mySwitch.onPowerState(async (deviceId, state) => {
    console.log(`\n[Callback] Device ${deviceId} turned ${state ? 'ON' : 'OFF'}`);
    console.log('    Source: Alexa/Google Home/SinricPro App');

    // Update local state
    devicePowerState = state;

    // Here you would control actual hardware
    // Examples:
    // - GPIO.write(LED_PIN, state);
    // - relay.setState(state);
    // - httpRequest('http://192.168.1.100/switch', { state });

    console.log(`    Action: Simulated hardware is now ${state ? 'ON' : 'OFF'}`);

    return true; // Return true if successful, false if failed
  });

  // Add device to SinricPro
  SinricPro.add(mySwitch);

  // Connection event handlers
  SinricPro.onConnected(() => {
    console.log('\n✓ Connected to SinricPro!');
    console.log('  You can now control the device via Alexa or Google Home');
    console.log('  Try saying: "Alexa, turn on my device"');
  });

  SinricPro.onDisconnected(() => {
    console.log('\n✗ Disconnected from SinricPro');
    console.log('  Will attempt to reconnect...');
  });
 
  // Initialize SinricPro connection
  try {
    await SinricPro.begin({
      appKey: APP_KEY,
      appSecret: APP_SECRET,
    });
  } catch (error) {
    console.error('Failed to connect:', error.message);
    process.exit(1);
  }

  // Simulate local button press every 60 seconds
  // This demonstrates sending events TO SinricPro when hardware changes locally
  setInterval(async () => {
    devicePowerState = !devicePowerState;
    console.log(`\n[Local Event] Button pressed - turning ${devicePowerState ? 'ON' : 'OFF'}`);

    const success = await mySwitch.sendPowerStateEvent(devicePowerState, 'PHYSICAL_INTERACTION');

    if (success) {
      console.log('  ✓ Event sent to SinricPro server');
      console.log('  Device state synced with Alexa/Google Home');
    } else {
      console.log('  ✗ Failed to send event (rate limited or not connected)');
    }
  }, 60000);

  console.log('\nWaiting for commands from Alexa/Google Home...');
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
