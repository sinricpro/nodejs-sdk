const { SinricPro, SinricProActions, raiseEvent, eventNames, SinricProUdp } = require('../../index'); // Use require('sinricpro'); if you are using NPM
const appKey = ''; // d89f1***-****-****-****-************
const secretKey = ''; // f44d1d31-1c19-****-****-9bc96c34b5bb-d19f42dd-****-****-****-************
const device1 = ''; // 5d7e7d96069e275ea9******
const deviceId = [device1]

setPowerState = (deviceid, data) => {
  console.log(deviceid, data);
  return true;
}

const sinricpro = new SinricPro(appKey, deviceId, secretKey, true);
const callbacks = { setPowerState };

SinricProActions(sinricpro, callbacks);

setInterval(() => {
  // Send manual change to Sinric Pro
  raiseEvent(sinricpro, eventNames.powerState, device1, { state: 'On' });
}, 2000);
