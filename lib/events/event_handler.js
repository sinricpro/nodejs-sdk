/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const uuidv4 = require("uuid/v4");
const { RateLimiterMemory, BurstyRateLimiter } = require("rate-limiter-flexible");
const { getSignature } = require("../signature");

/*
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * !!                                                 !!
 * !!             WARNING: DON'T TOUCH !              !!
 * !!             ======================              !!
 * !! PLEASE DO NOT MODIFY ANY OF THESE SETTINGS HERE !!
 * !!     THIS IS FOR INTERNAL CONFIGURATION ONLY     !!
 * !!   SINRIC PRO MIGHT NOT WORK IF YOU MODIFY THIS  !!
 * !!                                                 !!
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */

const burstyLimiter = new BurstyRateLimiter(
  new RateLimiterMemory({
    points: 1,
    duration: 60,
  }),
  new RateLimiterMemory({
    keyPrefix: "burst",
    points: 10,
    duration: 60,
  })
);

// @TODO resteBands

const eventNames = {
  powerState: "setPowerState",
  setBrightness: "setBrightness",
  powerLevel: "setPowerLevel",
  color: "setColor",
  colorTemperature: "setColorTemperature",
  doorBell: "DoorbellPress",
  thermostatMode: "setThermostatMode",
  rangvalue: "setRangeValue",
  motion: "motion",
  contact: "setContactState",
  setVolume: "setVolume",
  selectInput: "selectInput",
  media: "mediaControl",
  channel: "changeChannel",
  mode: "setMode",
  lock: "setLockState",
  mute: "setMute",
  currentTemperature: "currentTemperature",
  pushNotification: "pushNotification",
  targetTemperature: "targetTemperature"
};
 
function isValidEventAction(action) {
  return Object.entries(eventNames).find(i => i[1] === action);
}

const getEvent = (client, action, deviceId, value) => {
  const header = {
    payloadVersion: 2,
    signatureVersion: 1,
  };
  const payload = {
    action,
    cause: {
      type: "PHYSICAL_INTERACTION",
    },
    createdAt: Math.round(new Date() / 1000),
    deviceId,
    replyToken: uuidv4(),
    type: "event",
    value,
  };
  const signature = {
    HMAC: getSignature(client, JSON.stringify(payload)),
  };

  return { header, payload, signature };
};

const raiseEvent = async (client, action, deviceId, value) => {
  if(client.readyState !== 1) {
    console.error("Sending aborted! The connection has not been established yet. Try again later!");
    return;
  }

  if (isValidEventAction(action)) {
    try {
      await burstyLimiter.consume("queue");
      const request = JSON.stringify(getEvent(client, action, deviceId, value));
      if (process.env.SR_DEBUG) console.log(">> %s", request);
      client.send(request);
    } catch (rlRejected) {
      console.error("Too many events!");
    }
  } else {
    console.error(`Invalid Event: ${eventName}`);
  }
};

module.exports = { raiseEvent, eventNames };
