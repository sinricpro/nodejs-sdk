/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */
const { UndefinedCallbackError, InvalidResponseError } = require('../errors/errors');

const WebRTC = async (payload, callbacks) => {
  if (callbacks.webRtcOffer) {
    const data = await callbacks.webRtcOffer(payload.deviceId, payload.value.format, payload.value.value);
    if (data) return [payload.value, data.answer];
    throw new InvalidResponseError('WebRTC error');
  } else {
    throw new UndefinedCallbackError('webRtcOffer callback is undefined.');
  }
};

module.exports = {
  WebRTC,
};
