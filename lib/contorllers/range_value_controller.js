/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const sinricProData = require('../storage');

const RangeValue = (payload, callbacks) => {
  sinricProData.rangeValue = payload.value.rangeValue;
  
  const resp = callbacks.setRangeValue(payload.deviceId, sinricProData.rangeValue, payload.instanceId);

  return new Promise((resolve, reject) => {
    if (payload.value.rangeValue !== undefined && resp) resolve([payload.value, payload.instanceId]);
    else reject(new Error('RangeValue is undefined'));
  });
};

const RangeValueAdjust = (payload, callbacks) => {
  sinricProData.rangeValue += payload.value.rangeValueDelta; 

  if (sinricProData.rangeValue < 0) sinricProData.rangeValue = 0;
  else if (sinricProData.rangeValue > 100) sinricProData.rangeValue = 100;

  const resp = callbacks.adjustRangeValue(payload.deviceId, sinricProData.rangeValue, payload.instanceId);

  return new Promise((resolve, reject) => {
    if (payload.value.rangeValueDelta && resp) resolve([{ rangeValue: sinricProData.rangeValue }, payload.instanceId]);
    else reject(new Error('RangeValue undefined'));
  });
};


module.exports = { RangeValue, RangeValueAdjust };
