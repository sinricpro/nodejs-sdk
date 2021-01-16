const { SinricPro, SinricProActions, raiseEvent, eventNames, SinricProUdp } = require('../../index'); // Use require('sinricpro'); if you are using NPM

const appKey = ''; // d89f1***-****-****-****-************
const secretKey = ''; // f44d1d31-1c19-****-****-9bc96c34b5bb-d19f42dd-****-****-****-************
const device1 = ''; // 5d7e7d96069e275ea9******
const deviceId = [device1]

setPowerState = (deviceid, data) => {
  console.log("Power state: ", deviceid, data);
  return true;
}

setColorTemperature = (deviceid, data) => {
  console.log("Color temperature: ", deviceid, data);
  return true;
}

setColor = (deviceid, data) => {
  console.log("Color: ", deviceid, data);
  return true;
}

setBrightness = (deviceid, data) => {
  console.log("Brightness: ", deviceid, data);
  return true;
}

const callbacks = {
  setPowerState,
  setColorTemperature,
  setBrightness,
  setColor
};

const sinricpro = new SinricPro(appKey, deviceId, secretKey, true);
SinricProActions(sinricpro, callbacks);

