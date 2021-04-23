const {
  SinricPro, SinricProActions, raiseEvent, eventNames, SinricProUdp,
} = require('../../index'); // Use require('sinricpro'); if you are using NPM

const appKey = ''; // d89f1***-****-****-****-************
const secretKey = ''; // f44d1d31-1c19-****-****-9bc96c34b5bb-d19f42dd-****-****-****-************
const device1 = ''; // 5d7e7d96069e275ea9******
const deviceId = [device1];


function setPowerState(deviceid, data) {
  console.log(deviceid, data);
  return true;
}

function setBrightness(sinricpro, deviceid, data) {
  try {
    raiseEvent(sinricpro, eventNames.setBrightness, deviceid, { brightness: data });
    return true;
  } catch (e) {
    return false;
  }
}

const callbacks = {
  setPowerState,
};

const sinricpro = new SinricPro(appKey, deviceId, secretKey, true);

SinricProActions(sinricpro, callbacks);
const udp = new SinricProUdp(deviceId, secretKey);
udp.begin(callbacks);

// change brighness value here
const brightnessValue = 30;
setInterval(() => {
  setBrightness(sinricpro, device1, brightnessValue);
}, 2000);
