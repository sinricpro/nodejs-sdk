
/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const sinricProData = require('../storage');

const Color = (payload, callbacks) => {
  sinricProData.color = payload.value.color;
  const resp = callbacks.setColor(payload.deviceId, payload.value.color);
  return new Promise((resolve, reject) => {
    if (payload.value.color && resp) resolve(payload.value);
    else reject(new Error('Colors undefined'));
  });
};

module.exports = { Color };
