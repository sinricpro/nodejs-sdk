/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 *
 */
const Websocket = require("ws");
const rx = require("rxjs");

const callbackHandler = require('./cbhandler');
const { raiseEvent, eventNames } = require('./events/event_handler');
const SinricProUdp = require('./sinricproudp');
const sdkVersion = require('./../package.json').version;

class SinricPro extends Websocket {
  constructor(appkey, deviceids, secretKey, restoreStates) {
    super("ws://ws.sinric.pro", {
      headers: {
        appkey,
        deviceids: deviceids.join(';'),
        platform: 'nodejs',
        sdkversion: sdkVersion,
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

const startSinricPro = (client, callbacks) => {
  client.on('open', () => {
    console.log('Connected to Sinric Pro');
  });

  client.on("message", (data) => {
    if (process.env.SR_DEBUG) console.log('<< %s', data.toString());

    const parsedData = JSON.parse(data);

    if (parsedData.timestamp) {
      if (Math.floor(new Date() / 1000) - parsedData.timestamp > 60000) {
        if (process.env.SR_DEBUG) console.log("Timestamp is not in sync");
      } else if (process.env.SR_DEBUG) console.log("TimeStamp is in sync");
    } else {
      const response = callbackHandler(
        client,
        parsedData.payload,
        parsedData.signature.HMAC,
        callbacks,
      );
      response
        .then((res) => {
          const reqResponse = JSON.stringify(res);
          if (process.env.SR_DEBUG) console.log('>> %s', reqResponse);
          client.send(reqResponse);
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  });

  client.on("close", () => {
    if (callbacks.onDisconnect) {
      callbacks.onDisconnect();
    }
  });
};

const startSinricProObservable = (client, callbacks) => new rx.Observable((observer) => {
  client.on('open', () => {
    console.log('Connected to Sinric Pro');
  });

  client.on("message", (data) => {
    const parsedData = JSON.parse(data);
    if (parsedData.timestamp) {
      if (Math.floor(new Date() / 1000) - parsedData.timestamp > 60000) {
        if (process.env.SR_DEBUG) console.log("Timestamp is not in sync");
      } else if (process.env.SR_DEBUG) console.log("TimeStamp is in sync");
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
          const reqResponse = JSON.stringify(res);
          if (process.env.SR_DEBUG) console.log('>> %s', reqResponse);
          client.send(reqResponse);
        })
        .catch((err) => {
          observer.error(err.message);
          console.log(err.message);
        });
    }
  });

  client.on("close", () => {
    observer.complete();
    if (callbacks.onDisconnect) {
      callbacks.onDisconnect();
    }
    console.log("Disconnected");
  });
});

module.exports = {
  SinricPro,
  startSinricPro,
  startSinricProObservable,
  raiseEvent,
  eventNames,
  SinricProUdp,
};
