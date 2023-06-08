/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const sinricData = require('../storage');
const { UndefinedCallbackError, InvalidResponseError } = require('../errors/errors');

const Bands = async (payload, callbacks) => {
  sinricData.bands[0].level = payload.value.bands[0].level;
  sinricData.bands[0].name = payload.value.bands[0].name;

  if (callbacks.setBands) {
    const resp = await callbacks.setBands(payload.deviceId, payload.value.bands);
    if (resp === true) return payload.value;
    throw new InvalidResponseError('Callback failed');
  } else {
    throw new UndefinedCallbackError('setBands callback is undefined.');
  }
};

const BandReset = async (payload, callbacks) => {
  if (callbacks.resetBands) {
    const resp = await callbacks.resetBands(payload.deviceId, payload.value);
    if (resp === true) return payload.value;
    throw new InvalidResponseError('Callback failed');
  } else {
    throw new UndefinedCallbackError('resetBands callback is undefined.');
  }
};

const AdjustBands = async (payload, callbacks) => {
  if (payload.value.bands[0].levelDelta) {
    if (sinricData.bands[0].levelDirection === 'UP') sinricData.bands[0].level += payload.value.bands[0].levelDelta;
    else if (sinricData.bands[0].levelDirection === 'DOWN') sinricData.bands[0].level -= payload.value.bands[0].levelDelta;
  }

  if (callbacks.adjustBands) {
    const resp = await callbacks.adjustBands(payload.deviceId, payload.value);
    if (resp === true) return [payload.value, { bands: [{ level: sinricData.bands[0].level, name: sinricData.bands[0].name }] }];
    throw new InvalidResponseError('Callback failed');
  } else {
    throw new UndefinedCallbackError('adjustBands callback is undefined.');
  }
};

module.exports = {
  Bands, BandReset, AdjustBands,
};
