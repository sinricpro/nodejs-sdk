
/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const Websocket = require('ws');

const { appKey, deviceId } = require('../credential');

const client = new Websocket('ws://ws.sinric.pro', {
  headers: {
    appkey: appKey,
    deviceids: deviceId,
    platform: 'nodejs',
  },
});

module.exports = client;
