
/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const sinricProData = require('../storage');

const ColorTemperature = (payload, callbacks) => {
  sinricProData.colorTemperature = payload.value.colorTemperature;
  const resp = callbacks.setColorTemperature(payload.deviceId, payload.value.colorTemperature);

  return new Promise((resolve, reject) => {
    if (payload.value.colorTemperature && resp) resolve(payload.value);
    else reject(new Error('color temperature is undefined'));
  });
};

module.exports = { ColorTemperature };
