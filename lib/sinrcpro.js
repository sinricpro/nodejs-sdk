
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

const VERSION = '1.0.2';

class SinricPro extends Websocket {
  constructor(appkey, deviceids, secretKey) {
    super('ws://ws.sinric.pro', {
      headers: {
        appkey, deviceids, platform: 'nodejs', version: VERSION,
      },
    });
    this._secretKey = secretKey;
  }

  get getSecretKey() {
    return this._secretKey;
  }

  set setSecretKey(key) {
    this._secretKey = key;
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
