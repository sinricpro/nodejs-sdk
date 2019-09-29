const sinricProData = require('../storage');

const Brightness = (payload, callback) => {
  sinricProData.brightness = payload.value.brightness;
  callback.setBrightness(payload.deviceId, sinricProData.brightness);
  return new Promise((resolve, reject) => {
    if (payload.value.brightness) resolve(payload.value);
    else reject(new Error('brightness is undefined'));
  });
};

const BrightnessAdjust = (payload, callback) => {
  sinricProData.brightness += payload.value.brightnessDelta;
  if (sinricProData.brightness < 0) sinricProData.brightness = 0;
  else if (sinricProData.brightness > 100) sinricProData.brightness = 100;
  callback.adjustBrightness(payload.deviceId, sinricProData.brightness);
  return new Promise((resolve, reject) => {
    if (payload.value.brightness) resolve({ brightness: sinricProData.brightness });
    else reject(new Error('brightness is undefined'));
  });
};

module.exports = { Brightness, BrightnessAdjust };
