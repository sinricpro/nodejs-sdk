
/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const sinricProData = require('../storage');

const powerState = (payload, callbacks) => {
  const resp = callbacks.setPowerState(payload.deviceId, payload.value.state);
  return new Promise((resolve, reject) => {
    if (payload.value.state && resp) {
      resolve(payload.value);
    } else {
      reject(new Error('State is undefined'));
    }
  });
};

const powerLevel = (payload, callbacks) => {
  sinricProData.powerLevel = payload.value.powerLevel;
  const resp = callbacks.setPowerLevel(payload.deviceId, payload.value.powerLevel);
  return new Promise((resolve, reject) => {
    if (payload.value.powerLevel && resp) {
      resolve(payload.value);
    } else {
      reject(new Error('powerLevel is undefined'));
    }
  });
};

const powerLevelAdjust = (payload, callbacks) => {
  sinricProData.powerLevel += payload.value.powerLevelDelta;
  if (sinricProData.powerLevel < 0) sinricProData.powerLevel = 0;
  else if (sinricProData.powerLevel > 100) sinricProData.powerLevel = 100;
  const resp = callbacks.adjustPowerLevel(payload.deviceId, sinricProData.powerLevel);
  return new Promise((resolve, reject) => {
    if (payload.value.powerLevelDelta && resp) resolve({ powerLevel: sinricProData.powerLevel });
    else reject(new Error('PowerLevelDelta is 0 or undefined'));
  });
};

module.exports = { powerState, powerLevel, powerLevelAdjust };
