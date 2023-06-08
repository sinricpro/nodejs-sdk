/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const sinricProData = require('../storage');
const { UndefinedCallbackError, InvalidResponseError } = require('../errors/errors');

const Brightness = async (payload, callback) => {
  sinricProData.brightness = payload.value.brightness;

  if (callback.setBrightness) {
    const resp = await callback.setBrightness(payload.deviceId, sinricProData.brightness);
    if (payload.value.brightness && resp) return payload.value;
    throw new InvalidResponseError('brightness is undefined');
  } else {
    throw new UndefinedCallbackError('setBrightness callback is undefined.');
  }
};

const BrightnessAdjust = async (payload, callback) => {
  sinricProData.brightness += payload.value.brightnessDelta;
  if (sinricProData.brightness < 0) {
    sinricProData.brightness = 0;
  } else if (sinricProData.brightness > 100) {
    sinricProData.brightness = 100;
  }

  if (callback.adjustBrightness) {
    const resp = await callback.adjustBrightness(payload.deviceId, sinricProData.brightness);
    if (payload.value.brightness && resp) return { brightness: sinricProData.brightness };
    throw new InvalidResponseError('brightness is undefined');
  } else {
    throw new UndefinedCallbackError('setBrightness callback is undefined');
  }
};

module.exports = { Brightness, BrightnessAdjust };
