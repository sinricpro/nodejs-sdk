/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const sinricProData = require('../storage');
const { UndefinedCallbackError, InvalidResponseError } = require('../errors/errors');

const ColorTemperature = async (payload, callbacks) => {
  sinricProData.colorTemperature = payload.value.colorTemperature;

  if (callbacks.setColorTemperature) {
    const resp = await callbacks.setColorTemperature(payload.deviceId, payload.value.colorTemperature);
    if (payload.value.colorTemperature && resp) return payload.value;
    throw new InvalidResponseError('color temperature is undefined');
  } else {
    throw new UndefinedCallbackError('setColorTemperature callback is undefined!');
  }
};

module.exports = { ColorTemperature };
