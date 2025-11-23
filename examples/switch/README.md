# SinricPro Switch Example

This example demonstrates how to create a basic smart switch using the SinricPro SDK.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Get your credentials from [sinric.pro](https://sinric.pro):
   - Sign up / Log in
   - Create a new "Switch" device
   - Copy your APP_KEY, APP_SECRET, and DEVICE_ID

3. Update the configuration in `index.ts`:
   ```typescript
   const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
   const APP_KEY = 'YOUR-APP-KEY'; // UUID format
   const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key
   ```

## Run

with ts-node directly:
```bash
ts-node examples/switch/index.ts
```

## Features

- ✓ Connects to SinricPro WebSocket server
- ✓ Handles power state commands from Alexa/Google Home
- ✓ Sends events when state changes locally
- ✓ Automatic reconnection on connection loss
- ✓ Event rate limiting to prevent spam

## Voice Commands

Once connected, try these voice commands:

- "Alexa, turn on [device name]"
- "Alexa, turn off [device name]"
- "OK Google, turn on [device name]"
- "OK Google, turn off [device name]"

## Logging

   ```typescript
   async function main() {
      // Enable debug logging
      SinricProSdkLogger.setLevel(LogLevel.ERROR);
   }
   ```