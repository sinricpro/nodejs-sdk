const { SinricPro, SinricProActions, raiseEvent, eventNames, SinricProUdp } = require('../../index'); // Use require('sinricpro'); if you are using NPM

const appKey = '718bb344-9959-44f3-a5d4-7af919235f80'; // d89f1***-****-****-****-************
const secretKey = 'de9b5b1b-b6ac-4efc-b27b-8b9d6d80a19a-e6629020-22f4-4ffd-8839-f77c821a43cb'; // f44d1d31-1c19-****-****-9bc96c34b5bb-d19f42dd-****-****-****-************
const device1 = '5fd64432b762536f94b13210'; // 5d7e7d96069e275ea9******
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

