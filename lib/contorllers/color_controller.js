/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const sinricProData = require('../storage');
const { UndefinedCallbackError, InvalidResponseError } = require('../errors/errors');

const Color = async (payload, callbacks) => {
  sinricProData.color = payload.value.color;

  if (callbacks.setColor) {
    const resp = await callbacks.setColor(payload.deviceId, payload.value.color);
    if (payload.value.color && resp) return payload.value;
    throw new InvalidResponseError('Colors undefined');
  } else {
    throw new UndefinedCallbackError('setColor callback is undefined');
  }
};

module.exports = { Color };
