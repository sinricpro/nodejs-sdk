const sinricData = require('../storage');

const Bands = (payload, callbacks) => {
  sinricData.bands[0].level = payload.value.bands[0].level;
  sinricData.bands[0].name = payload.value.bands[0].name;
  const resp = callbacks.setBands(payload.deviceId, payload.value.bands);
  return new Promise((resolve, reject) => {
    if (resp === true) resolve(payload.value);
    else reject(new Error('Callback failed'));
  });
};

module.exports = { Bands };
