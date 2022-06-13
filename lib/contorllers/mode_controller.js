/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const sinricData = require('../storage');
 
const Mode = (payload, callbacks) => {
  const resp = callbacks.setMode(payload.deviceId, payload.value.mode, payload.instanceId);
  
  return new Promise((resolve, reject) => {
    if (resp) resolve([payload.value, payload.instanceId]);
    else reject(new Error('Mode undefined'));
  });
};

module.exports = {
  Mode
};
