# SinricPro Switch Example (JavaScript)

A simple JavaScript example showing how to create and control a smart switch with SinricPro.

## Features

- **Power Control**: Turn the switch ON/OFF via Alexa or Google Home
- **Local Events**: Send state updates when physical button is pressed
- **Connection Status**: Monitor connection to SinricPro servers
- **Heartbeat**: Track connection latency

## Prerequisites

1. **Node.js** 16.0.0 or higher
2. **SinricPro Account** at [https://portal.sinric.pro](https://portal.sinric.pro)
3. **Device Setup**:
   - Create a "Switch" device in the SinricPro portal
   - Note your Device ID, App Key, and App Secret

## Installation

### Option 1: Using Published Package (Recommended)

```bash
npm install
```

### Option 2: Using Local SDK (Development)

If you're working with the SDK source code:

```bash
# From the SDK root directory, build first
cd ../..
npm install
npm run build

# Link the SDK locally
npm link

# Then in this example directory
cd examples/switch-js
npm link sinricpro
npm install
```

## Configuration

Edit `index.js` and replace these values with your credentials from the SinricPro portal:

```javascript
const DEVICE_ID = 'YOUR-DEVICE-ID';     // 24-character hex
const APP_KEY = 'YOUR-APP-KEY';         // UUID format
const APP_SECRET = 'YOUR-APP-SECRET';   // Long secret key
```

## Usage

### Run the Example

```bash
npm start
```

Or directly with Node:

```bash
node index.js
```

### Expected Output

```
============================================================
SinricPro Switch Example (JavaScript)
============================================================

✓ Connected to SinricPro!
  You can now control the device via Alexa or Google Home
  Try saying: "Alexa, turn on my device"

Waiting for commands from Alexa/Google Home...
Press Ctrl+C to exit

♥ Heartbeat (latency: 45ms)

[Callback] Device 5f5f5f5f5f5f5f5f5f5f5f5f turned ON
    Source: Alexa/Google Home/SinricPro App
    Action: Simulated hardware is now ON

[Local Event] Button pressed - turning OFF
  ✓ Event sent to SinricPro server
  Device state synced with Alexa/Google Home
```

## Voice Commands

Once running, you can control the device with:

- **Alexa**:
  - "Alexa, turn on [device name]"
  - "Alexa, turn off [device name]"

- **Google Home**:
  - "Hey Google, turn on [device name]"
  - "Hey Google, turn off [device name]"

## Code Structure

### 1. Import the SDK

The SDK uses ES6 modules compiled to CommonJS, so you need to access the `.default` export:

```javascript
// Recommended: Destructure with default rename
const { default: SinricPro, SinricProSwitch, SinricProSdkLogger, LogLevel } = require('sinricpro');

// Alternative: Access .default property
const SinricPro = require('sinricpro').default;
const { SinricProSwitch } = require('sinricpro');
```

### 2. Initialize Device

```javascript
const mySwitch = SinricProSwitch(DEVICE_ID);
```

### 3. Handle Commands

```javascript
mySwitch.onPowerState(async (deviceId, state) => {
  console.log(`Device ${deviceId} turned ${state ? 'ON' : 'OFF'}`);

  // Control your hardware here
  // GPIO.write(LED_PIN, state);

  return true; // Success
});
```

### 4. Connect to SinricPro

```javascript
SinricPro.add(mySwitch);

await SinricPro.begin({
  appKey: APP_KEY,
  appSecret: APP_SECRET,
});
```

### 5. Send Local Events

```javascript
// When physical button is pressed
const success = await mySwitch.sendPowerStateEvent(true, 'PHYSICAL_INTERACTION');
```

## Hardware Integration

Replace the simulated hardware control with your actual implementation:

### GPIO (Raspberry Pi)

```javascript
const { Gpio } = require('onoff');
const relay = new Gpio(17, 'out');

mySwitch.onPowerState(async (deviceId, state) => {
  relay.writeSync(state ? 1 : 0);
  return true;
});
```

### HTTP API

```javascript
const axios = require('axios');

mySwitch.onPowerState(async (deviceId, state) => {
  try {
    await axios.post('http://192.168.1.100/switch', { state });
    return true;
  } catch (error) {
    console.error('Failed to control device:', error);
    return false;
  }
});
```

### Serial/USB Device

```javascript
const { SerialPort } = require('serialport');
const port = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 });

mySwitch.onPowerState(async (deviceId, state) => {
  port.write(state ? 'ON\n' : 'OFF\n');
  return true;
});
```

## Troubleshooting

### Connection Failed

- Verify your App Key and App Secret are correct
- Check your internet connection
- Ensure Device ID matches the one in the portal

### Commands Not Working

- Make sure the device is linked to Alexa/Google Home
- Check the device name in the SinricPro portal
- Verify the device is online in the portal

### Events Not Sending

- Events are rate-limited (max 1 per second per device)
- Wait for connection before sending events
- Check return value of `sendPowerStateEvent()`

## Debug Logging

Enable detailed logging to troubleshoot issues:

```javascript
SinricProSdkLogger.setLevel(LogLevel.DEBUG);
```

Log levels:
- `LogLevel.ERROR` - Errors only (default)
- `LogLevel.WARN` - Warnings and errors
- `LogLevel.INFO` - General information
- `LogLevel.DEBUG` - Detailed debug output

## Next Steps

- Try other device types: Light, Fan, Thermostat, etc.
- Explore multi-device setups
- Add sensors (temperature, motion, etc.)
- Create automation routines

## Resources

- **SinricPro Portal**: https://portal.sinric.pro
- **Documentation**: https://sinric.pro/docs
- **GitHub**: https://github.com/sinricpro/nodejs-sdk
- **Support**: https://github.com/sinricpro/nodejs-sdk/issues

## License

CC-BY-SA-4.0
