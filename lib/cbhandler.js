/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const { getSignature, verifySignature } = require('./signature');
const { powerState, powerLevel, powerLevelAdjust } = require('./contorllers/power_controller');
const { Brightness, BrightnessAdjust } = require('./contorllers/brightness_controller');
const { Color } = require('./contorllers/color_controller');
const { ColorTemperature } = require('./contorllers/color_temperature');
const { ThermoStatMode, ThermoStatTemperature, Lock } = require('./contorllers/sensors_controller');
const { RangeValue, RangeValueAdjust } = require('./contorllers/range_value_controller');
const { Volume, VolumeAdjust, Mute } = require('./contorllers/tv_controller');
const { ChangeChannel, SkipChannel, Media } = require('./contorllers/tv_controller');
const { Input } = require('./contorllers/tv_controller');
const { Bands, BandReset } = require('./contorllers/speaker_controller');
const { AdjustBands } = require('./contorllers/speaker_controller');
const { ToggleState } = require('./contorllers/toggle_state_controller');
const { Mode } = require('./contorllers/mode_controller');

const jsonResponse = (client, defaultPayload, payloadValue, instanceId) => {
  const header = {
    payloadVersion: 2,
    signatureVersion: 1,
  };

  let payload = {
    action: defaultPayload.action,
    clientId: defaultPayload.clientId,
    createdAt: Math.floor(new Date() / 1000),
    deviceId: defaultPayload.deviceId,
    message: 'OK',
    replyToken: defaultPayload.replyToken,
    success: true,
    type: 'response',
    value: payloadValue,
  };

  if(instanceId) payload.instanceId = instanceId;
 
  const signature = {
    HMAC: getSignature(client, JSON.stringify(payload)),
  };
  return { header, payload, signature };
};

const handlePayload = (client, payload, signature, callbacks) => verifySignature(client, payload, signature)
  .then((action) => {
    /* eslint no-else-return: ["error", {allowElseIf: true}] */
    if (action === 'setPowerState') {
      return powerState(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'setPowerLevel') {
      return powerLevel(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'adjustPowerLevel') {
      return powerLevelAdjust(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'setBrightness') {
      return Brightness(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'adjustBrightness') {
      return BrightnessAdjust(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'setColor') {
      return Color(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'setColorTemperature') {
      return ColorTemperature(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'setThermostatMode') {
      return ThermoStatMode(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'targetTemperature') {
      return ThermoStatTemperature(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'setRangeValue') {
      return RangeValue(payload, callbacks)
        .then(([value, instanceId]) => jsonResponse(client, payload, value, instanceId))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'adjustRangeValue') {
      return RangeValueAdjust(payload, callbacks)
        .then(([value, instanceId]) => jsonResponse(client, payload, value, instanceId))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'setVolume') {
      return Volume(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'adjustVolume') {
      return VolumeAdjust(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'selectInput') {
      return Input(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'mediaControl') {
      return Media(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'changeChannel') {
      return ChangeChannel(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'skipChannels') {
      return SkipChannel(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'setBands') {
      return Bands(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'adjustBands') {
      return AdjustBands(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'resetBands') {
      return BandReset(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'setMode') {
      return Mode(payload, callbacks)
        .then(([value, instanceId]) => jsonResponse(client, payload, value, instanceId))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'setLockState') {
      return Lock(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'setMute') {
      return Mute(payload, callbacks)
        .then((value) => jsonResponse(client, payload, value))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    } else if (action === 'setToggleState') {
      return ToggleState(payload, callbacks)
        .then(([value, instanceId]) => jsonResponse(client, payload, value, instanceId))
        .catch((err) => {
          if (process.env.SR_DEBUG) console.log(err.message);
        });
    }
    return {};
  })
  .catch((err) => {
    console.error(err.message);
  });
module.exports = handlePayload;
