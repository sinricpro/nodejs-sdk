/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const sinricProData = require('../storage');
const { UndefinedCallbackError, InvalidResponseError } = require('../errors/errors');

const powerState = async (payload, callbacks) => {
  if (callbacks.setPowerState) {
    const resp = await callbacks.setPowerState(payload.deviceId, payload.value.state);
    if (payload.value.state && resp) {
      return payload.value;
    }
    throw new InvalidResponseError('State is undefined');
  } else {
    throw new UndefinedCallbackError('setPowerState callback is undefined.');
  }
};

const powerLevel = async (payload, callbacks) => {
  sinricProData.powerLevel = payload.value.powerLevel;

  if (callbacks.setPowerLevel) {
    const resp = await callbacks.setPowerLevel(payload.deviceId, payload.value.powerLevel);
    if (payload.value.powerLevel && resp) {
      return payload.value;
    }
    throw new InvalidResponseError('powerLevel is undefined');
  } else {
    throw new UndefinedCallbackError('setPowerLevel callback is undefined.');
  }
};

const powerLevelAdjust = async (payload, callbacks) => {
  sinricProData.powerLevel += payload.value.powerLevelDelta;

  if (sinricProData.powerLevel < 0) sinricProData.powerLevel = 0;
  else if (sinricProData.powerLevel > 100) sinricProData.powerLevel = 100;

  if (callbacks.adjustPowerLevel) {
    const resp = await callbacks.adjustPowerLevel(payload.deviceId, sinricProData.powerLevel);

    if (payload.value.powerLevelDelta && resp) return { powerLevel: sinricProData.powerLevel };
    throw new InvalidResponseError('PowerLevelDelta is 0 or undefined');
  } else {
    throw new UndefinedCallbackError('adjustPowerLevel callback is undefined.');
  }
};

module.exports = { powerState, powerLevel, powerLevelAdjust };
