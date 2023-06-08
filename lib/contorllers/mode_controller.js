/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const { UndefinedCallbackError, InvalidResponseError } = require('../errors/errors');

const Mode = async (payload, callbacks) => {
  if (callbacks.setMode) {
    const resp = await callbacks.setMode(payload.deviceId, payload.value.mode, payload.instanceId);
    if (resp) return [payload.value, payload.instanceId];
    throw new InvalidResponseError('Mode undefined');
  } else {
    throw new UndefinedCallbackError('setMode callback is undefined!');
  }
};

module.exports = {
  Mode,
};
