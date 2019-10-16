
/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const sinricProData = require('../storage');

const Brightness = (payload, callback) => {
  sinricProData.brightness = payload.value.brightness;
  const resp = callback.setBrightness(payload.deviceId, sinricProData.brightness);
  return new Promise((resolve, reject) => {
    if (payload.value.brightness && resp) resolve(payload.value);
    else reject(new Error('brightness is undefined'));
  });
};

const BrightnessAdjust = (payload, callback) => {
  sinricProData.brightness += payload.value.brightnessDelta;
  if (sinricProData.brightness < 0) sinricProData.brightness = 0;
  else if (sinricProData.brightness > 100) sinricProData.brightness = 100;
  const resp = callback.adjustBrightness(payload.deviceId, sinricProData.brightness);
  return new Promise((resolve, reject) => {
    if (payload.value.brightness && resp) resolve({ brightness: sinricProData.brightness });
    else reject(new Error('brightness is undefined'));
  });
};

module.exports = { Brightness, BrightnessAdjust };
