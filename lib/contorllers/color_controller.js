const sinricProData = require('../storage');

const Color = (payload, callbacks) => {
  sinricProData.color = payload.value.color;
  const resp = callbacks.setColor(payload.deviceId, payload.value.color);
  return new Promise((resolve, reject) => {
    if (payload.value.color && resp) resolve(payload.value);
    else reject(new Error('Colors undefined'));
  });
};

module.exports = { Color };
