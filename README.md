# SinricPro (NodeJs-SDK)

[![](https://img.shields.io/npm/v/sinricpro)](https://www.npmjs.com/package/sinricpro)
[![](https://img.shields.io/npm/dependency-version/sinricpro/dev/eslint)](https://www.npmjs.com/package/sinricpro)
[![](https://img.shields.io/bundlephobia/min/sinricpro)](https://www.npmjs.com/package/sinricpro)
[![](https://img.shields.io/github/languages/code-size/sinricpro/nodejs-sdk)](https://www.npmjs.com/package/sinricpro)

### Installation

```
npm install sinricpro
```

### Dependencies
- [nodejs](https://nodejs.org/en/) v14.17.6 (LTS) or newer

- [websockets](https://www.npmjs.com/package/ws)

- [crypto](https://nodejs.org/api/crypto.html)

- [uuid](https://www.npmjs.com/package/uuid)

- [dgram]()

- [rxjs](https://www.npmjs.com/package/rxjs)

### Basic example

```javascript 1.8
const {
  SinricPro,
  SinricProActions,
  raiseEvent,
  eventNames,
  SinricProUdp
} = require("../index"); // Use require('sinricpro'); if you are using NPM

const appKey = ""; // d89f1***-****-****-****-************
const secretKey = ""; // f44d1d31-1c19-****-****-9bc96c34b5bb-d19f42dd-****-****-****-************
const device1 = ""; // 5d7e7d96069e275ea9******
const device2 = ""; // 5d80ac5713fa175e99******
const deviceId = [device1, device2];

function setPowerState(deviceid, data) {
  console.log(deviceid, data);
  return true;
}

const callbacks = {
  setPowerState
};

const sinricpro = new SinricPro(appKey, deviceId, secretKey, true);

SinricProActions(sinricpro, callbacks);

setInterval(() => {
  raiseEvent(sinricpro, eventNames.powerState, device1, { state: "On" });
}, 2000);

// https://github.com/sinricpro/nodejs-sdk/blob/master/examples/simple-example/simple-example.js
```

### Advanced example

#### Add a credential file into your root folder (credential.js)

```javascript 1.8
const credential = {
  appkey: "",
  secretKey: ""
};

const deviceIds = {
  deviceId1: "",
  deviceId2: "",
  deviceId3: ""
};

// No need to edit the code below

let deviceIdT = [];

for (let key in deviceIds) {
  if (deviceIds.hasOwnProperty(key)) {
    deviceIdT.push(deviceIds[key]);
  }
}

module.exports = {
  appKey: credential.appkey,
  secretKey: credential.secretKey,
  deviceId: deviceIdT
};
```

#### Example (app.js)

```javascript
const { appKey, deviceId, secretKey } = require("../credentials");
const {
  SinricPro,
  SinricProActions,
  raiseEvent,
  eventNames,
  SinricProUdp
} = require("../index");

function setPowerState(deviceid, data) {
  console.log(deviceid, data);
  return true;
}
function setPowerLevel(deviceid, data) {
  console.log(deviceid, data);
  return true;
}

function adjustPowerLevel(deviceid, data) {
  console.log(deviceid, data);
  return true;
}

function setColor(deviceid, data) {
  console.log(deviceid, data);
  return true;
}

function setRangeValue(deviceid, data) {
  console.log(deviceid, data);
  return true;
}
function setLockState(deviceid, data) {
  console.log(deviceid, data);
  return true;
}

function setBrightness(deviceid, data) {
  console.log(deviceid, data);
  return true;
}

function setVolume(deviceid, data) {
  console.log(deviceid, data);
  return true;
}

function adjustVolume(deviceid, data) {
  console.log(deviceid, data);
  return true;
}

function setMute(deviceid, data) {
  console.log(deviceid, data);
  return true;
}

const callbacks = {
  setPowerState,
  setPowerLevel,
  adjustPowerLevel,
  setColor,
  setRangeValue,
  setLockState,
  setBrightness,
  setVolume,
  adjustVolume,
  setMute
};

const sinricpro = new SinricPro(appKey, deviceId, secretKey, true);
SinricProActions(sinricpro, callbacks);

setInterval(() => {
  // raiseEvent(sinricpro, eventNames.powerState, 'deviceId', { state: 'On' });
  // raiseEvent(sinricpro, eventNames.setBrightness, 'deviceId', { brightness: 44 });
  // raiseEvent(sinricpro, eventNames.powerLevel, 'deviceId', { powerLevel: 44 });
  // raiseEvent(sinricpro, eventNames.color, 'DeviceId', { color: { b: 0, g: 0, r: 0 } });
  // raiseEvent(sinricpro, eventNames.colorTemperature, 'Deviceid', { colorTemperature: 8 });
  // raiseEvent(sinricpro, eventNames.doorBell, 'DeviceId', { state: 'pressed' });
  // raiseEvent(sinricpro, eventNames.thermostatMode, 'DeviceId', { thermostatMode: 'AUTO' });
  // raiseEvent(sinricpro, eventNames.rangvalue, 'DeviceId', { rangvalue: 3 });
  // raiseEvent(sinricpro, eventNames.motion, 'DeviceId', { state: 'detected' });
  // raiseEvent(sinricpro, eventNames.contact, 'DeviceId', { state: 'closed' });
  // raiseEvent(sinricpro, eventNames.setVolume, 'DeviceId', { volume: 29 });
  // raiseEvent(sinricpro, eventNames.selectInput, 'DeviceId', { input: 'HDMI' });
  // raiseEvent(sinricpro, eventNames.media, 'DeviceId', { control: 'FastForward' });
  // raiseEvent(sinricpro, eventNames.channel, 'DeviceId', { channel: { name: 'HBO' } });
  // raiseEvent(sinricpro, eventNames.mode, 'DeviceId', { mode: 'MOVIE' });
  // raiseEvent(sinricpro, eventNames.lock, 'DeviceId', { state: 'LOCKED' });
  // raiseEvent(sinricpro, eventNames.mute, 'DeviceId', { mute: true });
}, 2000);
```
