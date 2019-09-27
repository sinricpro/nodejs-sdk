const app = require('../index');

function powerState(deviceId, state) {
  console.log(deviceId, state);
}

const callbacks = {
  setPowerState: powerState,
};

app(callbacks);
