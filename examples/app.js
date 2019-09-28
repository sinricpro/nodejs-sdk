const app = require('../index');

function setPowerState(deviceId, data) {
  console.log(deviceId, data);
}
function setPowerLevel(deviceId, data) {
  console.log(deviceId, data);
}

function adjustPowerLevel(deviceId, data) {
  console.log(deviceId, data);
}

function setColor(deviceId, data) {
  console.log(deviceId, data);
}

const callbacks = {
  setPowerState,
  setPowerLevel,
  adjustPowerLevel,
  setColor,
};

app(callbacks);
