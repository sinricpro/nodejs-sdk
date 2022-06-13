
/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const sinricData = require('../storage');

const Bands = (payload, callbacks) => {
  sinricData.bands[0].level = payload.value.bands[0].level;
  sinricData.bands[0].name = payload.value.bands[0].name;
  const resp = callbacks.setBands(payload.deviceId, payload.value.bands);
  return new Promise((resolve, reject) => {
    if (resp === true) resolve(payload.value);
    else reject(new Error('Callback failed'));
  });
};

const BandReset = (payload, callbacks) => {
  const resp = callbacks.resetBands(payload.deviceId, payload.value);
  return new Promise((resolve, reject) => {
    if (resp) resolve(payload.value);
    else reject(new Error('Rest Bands Failed'));
  });
};

const AdjustBands = (payload, callbacks) => {
  if (payload.value.bands[0].levelDelta) {
    if (sinricData.bands[0].levelDirection === 'UP') sinricData.bands[0].level += payload.value.bands[0].levelDelta;
    else if (sinricData.bands[0].levelDirection === 'DOWN') sinricData.bands[0].level -= payload.value.bands[0].levelDelta;
  }
  const resp = callbacks.adjustBands(payload.deviceId, sinricData.bands);
  return new Promise((resolve, reject) => {
    if (resp) resolve(payload.value, { bands: [{ level: sinricData.bands[0].level, name: sinricData.bands[0].name }] });
    else reject(new Error('Rest Bands Failed'));
  });
};

module.exports = {
  Bands, BandReset, AdjustBands,
};
