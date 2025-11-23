/**
 * SinricPro TV Example
 *
 * Demonstrates:
 * - Power control
 * - Volume control
 * - Mute control
 * - Channel control
 * - Input selection
 * - Media controls
 */

import SinricPro from 'sinricpro';
import { SinricProTV } from 'sinricpro';
import { SinricProSdkLogger, LogLevel } from 'sinricpro';

// Configuration - Replace with your credentials
const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

// TV state
const tvState = {
  power: false,
  volume: 50,
  muted: false,
  channel: { name: 'HBO', number: '501' } as { name?: string; number?: string },
  input: 'HDMI1',
};

async function main() {
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro Smart TV Example');
  console.log('='.repeat(60));

  // Create TV device
  const myTV = SinricProTV(DEVICE_ID);

  // Power control
  myTV.onPowerState(async (deviceId, state) => {
    console.log(`\n[Power] Device ${deviceId} ${state ? 'ON' : 'OFF'}`);
    tvState.power = state;
    return true;
  });

  // Volume control
  myTV.onVolume(async (deviceId, volume) => {
    console.log(`\n[Volume] Device ${deviceId} set to ${volume}`);
    tvState.volume = volume;
    return true;
  });

  myTV.onAdjustVolume(async (deviceId, delta) => {
    console.log(`\n[Volume] Device ${deviceId} adjust by ${delta > 0 ? '+' : ''}${delta}`);
    tvState.volume = Math.max(0, Math.min(100, tvState.volume + delta));
    console.log(`  New volume: ${tvState.volume}`);
    return true;
  });

  // Mute control
  myTV.onMute(async (deviceId, mute) => {
    console.log(`\n[Mute] Device ${deviceId} ${mute ? 'ON' : 'OFF'}`);
    tvState.muted = mute;
    return true;
  });

  // Channel control
  myTV.onChangeChannel(async (deviceId, channel) => {
    console.log(`\n[Channel] Device ${deviceId} changed to: ${channel.name || channel.number}`);
    tvState.channel = channel;
    return true;
  });

  myTV.onSkipChannels(async (deviceId, count) => {
    console.log(
      `\n[Channel] Device ${deviceId} skip ${count > 0 ? 'forward' : 'backward'} ${Math.abs(count)} channels`
    );
    return true;
  });

  // Input selection
  myTV.onSelectInput(async (deviceId, input) => {
    console.log(`\n[Input] Device ${deviceId} switched to: ${input}`);
    tvState.input = input;
    return true;
  });

  // Media controls
  myTV.onMediaControl(async (deviceId, control) => {
    console.log(`\n[Media] Device ${deviceId} ${control}`);
    return true;
  });

  // Add device to SinricPro
  SinricPro.add(myTV);

  SinricPro.onConnected(() => {
    console.log('\n✓ Connected to SinricPro!');
  });

  // Initialize SinricPro
  await SinricPro.begin({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
  });

  console.log('\nWaiting for commands...');
  console.log('Try: "Alexa, turn on the TV"');
  console.log('     "Alexa, change channel to HBO"');
  console.log('     "Alexa, increase volume"\n');
}

process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await SinricPro.stop();
  process.exit(0);
});

main().catch(console.error);
