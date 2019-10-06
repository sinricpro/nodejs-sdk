const Websocket = require('ws');

const { appKey, deviceId } = require('../credential');

const client = new Websocket('ws://ws.sinric.pro', {
  headers: {
    appkey: appKey,
    deviceids: deviceId,
    platform: 'nodejs'
  },
});

module.exports = client;
