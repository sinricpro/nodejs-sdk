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

const Mode = (payload, callbacks) => {
  const resp = callbacks.setMode(payload.deviceId, payload.value.mode);
  return new Promise((resolve, reject) => {
    if (resp) resolve(payload.value);
    else reject(new Error('Mode undefined'));
  });
};

const BandReset = (payload, callbacks) => {
  const resp = callbacks.resetBands(payload.deviceId, payload.value);
  return new Promise((resolve, reject) => {
    if (resp) resolve(payload.value);
    else reject(new Error('Rest Bands Failed'));
  });
};


module.exports = { Bands, Mode, BandReset };
