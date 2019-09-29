const sinricProData = require('../storage');

const powerState = (payload, callbacks) => {
  callbacks.setPowerState(payload.deviceId, payload.value.state);
  return new Promise((resolve, reject) => {
    if (payload.value.state) {
      resolve(payload.value);
    } else {
      reject(new Error('State is undefined'));
    }
  });
};


const powerLevel = (payload, callbacks) => {
  sinricProData.powerLevel = payload.value.powerLevel;
  callbacks.setPowerLevel(payload.deviceId, payload.value.powerLevel);
  return new Promise((resolve, reject) => {
    if (payload.value.powerLevel) {
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
  callbacks.adjustPowerLevel(payload.deviceId, sinricProData.powerLevel);
  return new Promise((resolve, reject) => {
    if (payload.value.powerLevelDelta) resolve({ powerLevel: sinricProData.powerLevel });
    else reject(new Error('PowerLevelDelta is 0 or undefined'));
  });
};

module.exports = { powerState, powerLevel, powerLevelAdjust };
