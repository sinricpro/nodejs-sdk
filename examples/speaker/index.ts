/**
 * SinricPro Speaker Example
 *
 * Demonstrates:
 * - Power control
 * - Volume control
 * - Mute control
 * - Media playback controls
 * - Equalizer settings
 * - Mode selection
 */

import SinricPro from 'sinricpro';
import { SinricProSpeaker } from 'sinricpro';
import { SinricProSdkLogger, LogLevel } from 'sinricpro';

const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

// Speaker state
const speakerState = {
  power: false,
  volume: 50,
  muted: false,
  mode: 'MUSIC',
  equalizer: {
    bass: 0,
    midrange: 0,
    treble: 0,
  },
};

async function main() {
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro Smart Speaker Example');
  console.log('='.repeat(60));

  // Create speaker device
  const mySpeaker = SinricProSpeaker(DEVICE_ID);

  // Power control
  mySpeaker.onPowerState(async (deviceId, state) => {
    console.log(`\n[Power] Device ${deviceId} ${state ? 'ON' : 'OFF'}`);
    speakerState.power = state;
    return true;
  });

  // Volume control
  mySpeaker.onVolume(async (deviceId, volume) => {
    console.log(`\n[Volume] Device ${deviceId} set to ${volume}`);
    speakerState.volume = volume;
    return true;
  });

  mySpeaker.onAdjustVolume(async (deviceId, delta) => {
    console.log(`\n[Volume] Device ${deviceId} adjust by ${delta > 0 ? '+' : ''}${delta}`);
    speakerState.volume = Math.max(0, Math.min(100, speakerState.volume + delta));
    console.log(`  New volume: ${speakerState.volume}`);
    return true;
  });

  // Mute control
  mySpeaker.onMute(async (deviceId, mute) => {
    console.log(`\n[Mute] Device ${deviceId} ${mute ? 'ON' : 'OFF'}`);
    speakerState.muted = mute;
    return true;
  });

  // Media controls
  mySpeaker.onMediaControl(async (deviceId, control) => {
    console.log(`\n[Media] Device ${deviceId} ${control}`);
    // control can be: Play, Pause, Stop, Next, Previous, Rewind, FastForward
    return true;
  });

  // Equalizer control
  mySpeaker.onSetBands(async (deviceId, bands) => {
    console.log(`\n[Equalizer] Device ${deviceId} bands updated: ${bands}`);
    return true;
  });

  mySpeaker.onAdjustBands(async (deviceId, bands) => {
    console.log(`\n[Equalizer] Device ${deviceId} bands adjusted: ${bands}`);
    return true;
  });

  // Mode control
  mySpeaker.onSetMode(async (deviceId, mode) => {
    console.log(`\n[Mode] Device ${deviceId} set to ${mode}`);
    speakerState.mode = mode;
    // Mode can be: MUSIC, MOVIE, NIGHT, SPORT, TV, etc.
    return true;
  });

  // Add device to SinricPro
  SinricPro.add(mySpeaker);

  SinricPro.onConnected(() => {
    console.log('\n✓ Connected to SinricPro!');
  });

  // Initialize SinricPro
  await SinricPro.begin({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
  });

  console.log('\nWaiting for commands...');
  console.log('Try: "Alexa, turn on the speaker"');
  console.log('     "Alexa, increase volume"');
  console.log('     "Alexa, play music"');
  console.log('     "Alexa, increase bass"\n');
}

process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await SinricPro.stop();
  process.exit(0);
});

main().catch(console.error);
