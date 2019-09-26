const app = require('../index');

function powerState(deviceId, state) {
  // eslint-disable-next-line no-console
  console.log(deviceId, state);
}

const callbacks = {
  setPowerState: powerState,
};

app(callbacks);
