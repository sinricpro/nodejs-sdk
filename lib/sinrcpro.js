
/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */
const client = require('./prosocket');
const callbackHandler = require('./cbhandler');
const { raiseEvent, eventNames } = require('./events/event_handler');

const SinricPro = (callbacks) => {
  client.on('open', () => {
    console.log('Connected');
  });

  client.on('message', (data) => {
    const parsedData = JSON.parse(data);
    const response = callbackHandler(parsedData.payload, parsedData.signature.HMAC, callbacks);
    response.then((res) => {
      client.send(JSON.stringify(res));
    }).catch((err) => {
      console.log(err.message);
    });
  });
};


module.exports = { SinricPro, raiseEvent, eventNames };
