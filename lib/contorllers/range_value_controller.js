const sinricProData = require('../storage');

const RangeValue = (payload, callbacks) => {
  sinricProData.rangeValue = payload.value.rangeValue;
  const resp = callbacks.setRangeValue(payload.deviceId, sinricProData.rangeValue);
  return new Promise((resolve, reject) => {
    if (payload.value.rangeValue && resp) resolve(payload.value);
    else reject(new Error('RangeValue is undefined'));
  });
};

const RangeValueAdjust = (payload, callbacks) => {
  sinricProData.rangeValue += payload.value.rangeValueDelta;
  if (sinricProData.rangeValue < 0) sinricProData.rangeValue = 0;
  else if (sinricProData.rangeValue > 100) sinricProData.rangeValue = 100;
  const resp = callbacks.adjustRangeValue(payload.deviceId, sinricProData.rangeValue);
  return new Promise((resolve, reject) => {
    if (payload.value.rangeValueDelta && resp) resolve({ rangeValue: sinricProData.rangeValue });
    else reject(new Error('RangeValue undefined'));
  });
};


module.exports = { RangeValue, RangeValueAdjust };
