
/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const uuidv4 = require('uuid/v4');
const { getSignature } = require('../signature');

// @TODO resteBands

const eventNames = {
  powerState: 'setPowerState',
  setBrightness: 'setBrightness',
  powerLevel: 'setPowerLevel',
  color: 'setColor',
  colorTemperature: 'setColorTemperature',
  doorBell: 'DoorbellPress',
  thermostatMode: 'setThermostatMode',
  rangvalue: 'setRangeValue',
  motion: 'motion',
  contact: 'setContactState',
  setVolume: 'setVolume',
  selectInput: 'selectInput',
  media: 'mediaControl',
  channel: 'changeChannel',
  mode: 'setMode',
  lock: 'setLockState',
  mute: 'setMute',
};

const actionArr = ['setPowerState', 'setBrightness', 'setPowerLevel', 'setColor', 'setColorTemperature', 'DoorbellPress'];

const getJson = (client, eventName, deviceId, value) => {
  const header = {
    payloadVersion: 2,
    signatureVersion: 1,
  };
  const payload = {
    action: eventName,
    cause: {
      type: 'PHYSICAL_INTERACTION',
    },
    createdAt: Math.round(new Date() / 1000),
    deviceId,
    replyToken: uuidv4(),
    type: 'event',
    value,
  };
  const signature = {
    HMAC: getSignature(client, JSON.stringify(payload)),
  };

  return ({ header, payload, signature });
};


const raiseEvent = (client, eventName, deviceId, value) => {
  if (actionArr.includes(eventName)) {
    console.log(eventName);
    client.send(JSON.stringify(getJson(client, eventName, deviceId, value)));
  } else {
    console.log('Invalid Event');
  }
};

module.exports = { raiseEvent, eventNames };
