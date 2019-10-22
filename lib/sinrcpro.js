
/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 *
 */


const Websocket = require('ws');
const callbackHandler = require('./cbhandler');
const { raiseEvent, eventNames } = require('./events/event_handler');

class SinricPro extends Websocket {
  constructor(appkey, deviceids, secretKey) {
    super('ws://ws.sinric.pro', { headers: { appkey, deviceids, platform: 'nodejs' } });
    this.secretKey = secretKey;
  }
}

const SinricProActions = (client, callbacks) => {
  client.on('open', () => {
    console.log('Connected');
  });

  client.on('message', (data) => {
    const parsedData = JSON.parse(data);
    const response = callbackHandler(client, parsedData.payload, parsedData.signature.HMAC, callbacks);
    response.then((res) => {
      client.send(JSON.stringify(res));
    }).catch((err) => {
      console.log(err.message);
    });
  });
};


module.exports = {
  SinricPro, SinricProActions, raiseEvent, eventNames,
};
