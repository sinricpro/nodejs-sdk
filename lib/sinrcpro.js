/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 *
 */
const Websocket = require('ws');
const rx = require('rxjs');

const callbackHandler = require('./cbhandler');
const { raiseEvent, eventNames } = require('./events/event_handler');
const SinricProUdp = require('./sinricproudp');

const VERSION = '2.2.2';

class SinricPro extends Websocket {
  constructor(appkey, deviceids, secretKey, restoreStates) {
    super('ws://ws.sinric.pro', {
      headers: {
        appkey,
        deviceids: deviceids.join(';'),
        platform: 'nodejs',
        version: VERSION,
        restoredevicestates: restoreStates,
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
    console.log('Connected to Sinric Pro');
  });

  client.on('message', (data) => {
    const parsedData = JSON.parse(data);
    
    if (parsedData.timestamp) {
      if (Math.floor(new Date() / 1000) - parsedData.timestamp > 60000) console.log('Timestamp is not in sync');
      else console.log('TimeStamp is in sync');
    } else {
      const response = callbackHandler(
        client,
        parsedData.payload,
        parsedData.signature.HMAC,
        callbacks,
      );
      response
        .then((res) => {
          client.send(JSON.stringify(res));
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  });
};

const SinricProActionsObservable = (client, callbacks) => new rx.Observable((observer) => {
  client.on('open', () => {
    console.log('Connected');
  });

  client.on('message', (data) => {
    const parsedData = JSON.parse(data);
    if (parsedData.timestamp) {
      if (Math.floor(new Date() / 1000) - parsedData.timestamp > 60000) console.log('Timestamp is not in sync');
      else console.log('TimeStamp is in sync');
    } else {
      const response = callbackHandler(
        client,
        parsedData.payload,
        parsedData.signature.HMAC,
        callbacks,
      );
      response
        .then((res) => {
          observer.next(res);
          client.send(JSON.stringify(res));
        })
        .catch((err) => {
          observer.error(err.message);
          console.log(err.message);
        });
    }
  });

  client.on('close', () => {
    observer.complete();
    console.log('Disconnected');
  });
});

module.exports = {
  SinricPro,
  SinricProActions,
  SinricProActionsObservable,
  raiseEvent,
  eventNames,
  SinricProUdp,
};
