const { getSignature, verifySignature } = require('./signature');
const { powerState, powerLevel, powerLevelAdjust } = require('./contorllers/power_controller');
const { Brightness, BrightnessAdjust } = require('./contorllers/brightness_controller');
const {Color} = require('./contorllers/color_controller');
const sinricData = require('./storage');

const jsonResponse = (defaultPayload, dValue) => {
  const header = {
    payloadVersion: 2,
    signatureVersion: 1,
  };

  const payload = {
    action: defaultPayload.action,
    clientId: defaultPayload.clientId,
    createdAt: Math.floor(new Date() / 1000),
    deviceId: defaultPayload.deviceId,
    message: 'OK',
    replyToken: defaultPayload.replyToken,
    success: true,
    type: 'response',
    value: dValue,
  };

  const signature = {
    HMAC: getSignature(JSON.stringify(payload)),
  };
  return { header, payload, signature };
};

const handlePayload = (payload, signature, callbacks) => verifySignature(payload, signature).then((action) => {
  /* eslint no-else-return: ["error", {allowElseIf: true}] */
  if (action === 'setPowerState') {
    return powerState(payload, callbacks).then((value) => jsonResponse(payload, value)).catch((err) => {
      console.log(err.message);
    });
  } else if (action === 'setPowerLevel') {
    return powerLevel(payload, callbacks).then((value) => jsonResponse(payload, value)).catch((err) => {
      console.log(err.message);
    });
  } else if (action === 'adjustPowerLevel') {
    return powerLevelAdjust(payload, callbacks).then((value) => jsonResponse(payload, value)).catch((err) => {
      console.log(err.message);
    });
  } else if (action === 'setBrightness') {
    return Brightness(payload, callbacks).then((value) => jsonResponse(payload, value)).catch((err) => {
      console.log(err.message);
    });
  } else if (action === 'adjustBrightness') {
    return BrightnessAdjust(payload, callbacks).then((value) => jsonResponse(payload, value)).catch((err) => {
      console.log(err.message);
    });
  } else if (action === 'setColor') {
    return Color(payload, callbacks).then((value) => jsonResponse(payload, value)).catch((err) => {
      console.log(err.message);
    });
  } else if (action === 'setThermostatMode') {
    sinricData.color = payload.value.color;
    callbacks.setThermostatMode(payload.deviceId, payload.value.thermostatMode);
    return jsonResponse(payload, payload.value);
  } else if (action === 'setRangeValue') {
    sinricData.rangeValue = payload.value.rangeValue;
    callbacks.setRangeValue(payload.deviceId, sinricData.rangeValue);
    return jsonResponse(payload, payload.value);
  } else if (action === 'adjustRangeValue') {
    sinricData.rangeValue += payload.value.rangeValueDelta;
    if (sinricData.rangeValue > 100) sinricData.rangeValue = 100;
    else if (sinricData.rangeValue < 0) sinricData.rangeValue = 0;
    callbacks.adjustRangeValue(payload.deviceId, payload.value);
    return jsonResponse(payload, { rangeValue: sinricData.rangeValue });
  } else if (action === 'setVolume') {
    sinricData.volume = payload.value.volume;
    callbacks.setVolume(payload.deviceId, payload.value);
    return jsonResponse(payload, payload.value);
  } else if (action === 'adjustVolume') {
    sinricData.volume += payload.value.volume;
    if (sinricData.volume > 100) sinricData.volume = 100;
    else if (sinricData.volume < 0) sinricData.volume = 0;
    callbacks.adjustVolume(payload.deviceId, payload.value.volume);
    return jsonResponse(payload, { volume: sinricData.volume });
  } else if (action === 'selectInput') {
    callbacks.selectInput(payload.deviceId, payload.value.input);
    return jsonResponse(payload, payload.value);
  } else if (action === 'mediaControl') {
    callbacks.mediaControl(payload.deviceId, payload.value);
    return jsonResponse(payload, payload.value);
  } else if (action === 'changeChannel') {
    callbacks.changeChannel(payload.deviceId, payload.value.channel.name);
    return jsonResponse(payload, payload.value);
  } else if (action === 'skipChannels') {
    callbacks.skipChannels(payload.deviceId, payload.value.channelCount);
    return jsonResponse(payload, payload.value);
  } else if (action === 'setBands') {
    sinricData.bands[0].level = payload.value.bands[0].level;
    sinricData.bands[0].name = payload.value.bands[0].name;
    callbacks.setBands(payload.deviceId, payload.value);
    return jsonResponse(payload, payload.value);
  } else if (action === 'adjustBands') {
    if (sinricData.bands[0].levelDirection === 'UP') sinricData.bands[0].level += payload.value.bands[0].levelDelta;
    else if (sinricData.bands[0].levelDirection === 'DOWN') sinricData.bands[0].level -= payload.value.bands[0].levelDelta;
    sinricData.bands[0].name = payload.value.bands[0].name;
    callbacks.adjustBands(payload.deviceId, payload.value);
    return jsonResponse(payload, { bands: [{ level: sinricData.bands[0].level, name: sinricData.bands[0].name }] });
  } else if (action === 'resetBands') {
    callbacks.resetBands(payload.deviceId, payload.value);
    return jsonResponse(payload, payload.value);
  } else if (action === 'setMode') {
    callbacks.setMode(payload.deviceId, payload.value.mode);
    return jsonResponse(payload, payload.value);
  } else if (action === 'setLockState') {
    callbacks.setLockState(payload.deviceId, payload.value.state);
    return jsonResponse(payload, { state: `${payload.value.state.toUpperCase()}ED` });
  } else if (action === 'setMute') {
    callbacks.setMute(payload.deviceId, payload.value.mute);
    return jsonResponse(payload, payload.value);
  }
  return {};
}).catch((err) => {
  console.log(err.message);
});
module.exports = handlePayload;
