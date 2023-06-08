/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const sinricProData = require('../storage');
const { UndefinedCallbackError, InvalidResponseError } = require('../errors/errors');

const RangeValue = async (payload, callbacks) => {
  sinricProData.rangeValue = payload.value.rangeValue;

  if (callbacks.setRangeValue) {
    const resp = await callbacks.setRangeValue(payload.deviceId, sinricProData.rangeValue, payload.instanceId);
    if (payload.value.rangeValue !== undefined && resp) return [payload.value, payload.instanceId];
    throw new InvalidResponseError('RangeValue is undefined');
  } else {
    throw new UndefinedCallbackError('setRangeValue callback is undefined.');
  }
};

const RangeValueAdjust = async (payload, callbacks) => {
  sinricProData.rangeValue += payload.value.rangeValueDelta;

  if (sinricProData.rangeValue < 0) sinricProData.rangeValue = 0;
  else if (sinricProData.rangeValue > 100) sinricProData.rangeValue = 100;

  if (callbacks.adjustRangeValue) {
    const resp = await callbacks.adjustRangeValue(payload.deviceId, sinricProData.rangeValue, payload.instanceId);
    if (payload.value.rangeValueDelta && resp) return [{ rangeValue: sinricProData.rangeValue }, payload.instanceId];
    throw new InvalidResponseError('RangeValue is undefined');
  } else {
    throw new UndefinedCallbackError('adjustRangeValue callback is undefined.');
  }
};

module.exports = { RangeValue, RangeValueAdjust };
