const sinricProData = require('../storage');

const Color = (payload, callbacks) => {
  sinricProData.color = payload.value.color;
  callbacks.setColor(payload.deviceId, payload.value.color);
  return new Promise((resolve, reject) => {
    if (payload.value.color) resolve(payload.value);
    else reject(new Error('Colors undefined'));
  });
};

module.exports = { Color };
