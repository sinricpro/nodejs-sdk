# SinricPro SDK for Node.js & TypeScript

[![npm version](https://badge.fury.io/js/sinricpro.svg)](https://www.npmjs.com/package/sinricpro)
[![License](https://img.shields.io/badge/License-CC%20BY--SA%204.0-blue.svg)](LICENSE)

Official SinricPro SDK for Node.js and TypeScript. Control your IoT devices with Alexa and Google Home.

**🎯 Features:**
- ✅ Full TypeScript support with strong typing
- ✅ Modern async/await API
- ✅ WebSocket with automatic reconnection
- ✅ HMAC-SHA256 authentication
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
