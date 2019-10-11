const { deviceId1, deviceId2 } = require('../credential');
const { SinricPro, raiseEvent, eventNames } = require('../index');

function setPowerState(deviceId, data) {
  console.log(deviceId, data);
  return true;
}
function setPowerLevel(deviceId, data) {
  console.log(deviceId, data);
  return true;
}

function adjustPowerLevel(deviceId, data) {
  console.log(deviceId, data);
  return true;
}

function setColor(deviceId, data) {
  console.log(deviceId, data);
  return true;
}

function setRangeValue(deviceId, data) {
  console.log(deviceId, data);
  return true;
}
function setLockState(deviceId, data) {
  console.log(deviceId, data);
  return true;
}

function setBrightness(deviceId, data) {
  console.log(deviceId, data);
  return true;
}

function setVolume(deviceId, data) {
  console.log(deviceId, data);
  return true;
}

function adjustVolume(deviceId, data) {
  console.log(deviceId, data);
  return true;
}

function setMute(deviceId, data) {
  console.log(deviceId, data);
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
  setMute,
};

SinricPro(callbacks);

setInterval(() => {
  // raiseEvent(eventNames.powerState, deviceId1, { state: 'On' });
  // raiseEvent(eventNames.setBrightness, 'deviceId', { brightness: 44 });
  // raiseEvent(eventNames.powerLevel, 'deviceId', { powerLevel: 44 });
  // raiseEvent(eventNames.color, 'DeviceId', { color: { b: 0, g: 0, r: 0 } });
  // raiseEvent(eventNames.colorTemperature, 'Deviceid', { colorTemperature: 8 });
  raiseEvent(eventNames.doorBell, 'DeviceId', { state: 'pressed' });
}, 2000);
