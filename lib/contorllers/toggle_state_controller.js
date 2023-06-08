/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */
const { UndefinedCallbackError, InvalidResponseError } = require('../errors/errors');

const ToggleState = async (payload, callbacks) => {
  if (callbacks.setToggleState) {
    const resp = await callbacks.setToggleState(payload.deviceId, payload.value.state, payload.instanceId);
    if (resp === true) return [payload.value, payload.instanceId];
    throw new InvalidResponseError('Callback failed');
  } else {
    throw new UndefinedCallbackError('setToggleState callback is undefined.');
  }
};

module.exports = {
  ToggleState,
};
