const app = require('../index');

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

app(callbacks);
