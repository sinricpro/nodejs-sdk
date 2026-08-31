# SinricPro SDK for Node.js & TypeScript

[![npm version](https://badge.fury.io/js/sinricpro.svg)](https://www.npmjs.com/package/sinricpro)
[![License](https://img.shields.io/badge/License-CC%20BY--SA%204.0-blue.svg)](LICENSE)

Official SinricPro SDK for Node.js and TypeScript. Control your IoT devices with Alexa and Google Home.

**🎯 Features:**
- ✅ Full TypeScript support with strong typing
- ✅ Modern async/await API
- ✅ WebSocket with automatic reconnection
- ✅ HMAC-SHA256 authentication
- ✅ Local control over the LAN (works while SinricPro is unreachable)
- ✅ Event rate limiting
- ✅ Multiple device types (Switch, Light, Thermostat, etc.)
- ✅ Comprehensive error handling
- ✅ Unit tested

---

## 📦 Installation

```bash
npm install sinricpro
```

Or with yarn:
```bash
yarn add sinricpro
```

---

## 🚀 Quick Start

### 1. Get Your Credentials

1. Sign up at [sinric.pro](https://sinric.pro)
2. Create a new device (e.g., "Switch")
3. Copy your credentials:
   - `APP_KEY`
   - `APP_SECRET`
   - `DEVICE_ID`

### 2. Create a Simple Switch

```typescript
import SinricPro from 'sinricpro';
import { SinricProSwitch } from 'sinricpro/devices';

const config = {
  appKey: 'YOUR-APP-KEY',
  appSecret: 'YOUR-APP-SECRET',
};

async function main() {
  // Create a switch device
  const mySwitch = SinricProSwitch('YOUR-DEVICE-ID');

  // Handle power state changes from Alexa/Google Home
  mySwitch.onPowerState(async (deviceId, state) => {
    console.log(`Device turned ${state ? 'ON' : 'OFF'}`);
    // Control your hardware here
    return true; // Return true if successful
  });

  // Add device to SinricPro
  SinricPro.add(mySwitch);

  // Connection events
  SinricPro.onConnected(() => console.log('Connected!'));
  SinricPro.onDisconnected(() => console.log('Disconnected!'));

  // Initialize SDK
  await SinricPro.begin(config);

  // Send events when state changes locally
  setTimeout(async () => {
    await mySwitch.sendPowerStateEvent(true);
  }, 5000);
}

main().catch(console.error);
```

### 3. Run Your App

```bash
ts-node app.ts
```

### 4. Control with Voice

- "Alexa, turn on Switch"
- "OK Google, turn off Switch"

---

## 🏠 Local Control

Devices also answer signed commands over the local network, so they keep working
while SinricPro is unreachable. It is on by default and needs no application
changes: a LAN request runs the same callbacks as a cloud request. UDP listener on port `3333`, joined to multicast group `224.9.9.9` and answering unicast on the same port. Replies go back to the peer that sent the request, never to the cloud websocket.

The mDNS announcement uses `bonjour-service`, installed with the SDK:

```bash
npm install sinricpro
```

---

## Troubleshooting

### Connection Issues

1. **Check credentials** - Ensure APP_KEY and APP_SECRET are correct
2. **Check device ID** - Verify the device ID is exactly 24 hexadecimal characters
3. **Check network** - Ensure you have internet connectivity
4. **Enable debug logging** -

```js
import { SinricProSdkLogger, LogLevel } from 'sinricpro';
SinricProSdkLogger.setLevel(LogLevel.DEBUG); // DEBUG, INFO, WARN, ERROR, NONE
```


### Local Control Issues

1. **No device found on the LAN** - check the log for
   `Local control listening on UDP 3333`. A failed multicast join leaves nothing
   listening, and the log line says so.
2. **No mDNS record** - install the extra: `pip install sinricpro[mdns]`.
3. **Discovery answers on the wrong network** - set `local_control_interface` to the
   LAN address of the host.
4. **Android clients need a `WifiManager.MulticastLock`**, and iOS clients need
   `_sinricpro._udp` listed in `NSBonjourServices`, or discovery returns nothing.

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

---

## 📄 License

This project is licensed under CC-BY-SA-4.0.

---

## 🔗 Links

- **Website:** [sinric.pro](https://sinric.pro)
- **Documentation:** [help.sinric.pro](https://help.sinric.pro)
- **GitHub:** [github.com/sinricpro](https://github.com/sinricpro)
- **Support:** [community.sinric.pro](https://community.sinric.pro)

---

## 💬 Support

- **Issues:** [GitHub Issues](https://github.com/sinricpro/nodejs-sdk/issues)
- **Community:** [SinricPro Community](https://community.sinric.pro)
- **Email:** support@sinric.pro

---

**Made with ❤️ by the SinricPro team**
