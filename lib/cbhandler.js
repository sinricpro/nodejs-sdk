const { getSignature, verifySignature } = require('./signature');

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
    callbacks.setPowerState(payload.deviceId, payload.value);
    return jsonResponse(payload, payload.value);
  } else if (action === 'setPowerLevel') {
    sinricData.powerLevel += payload.value.powerLevel;
    if (sinricData.powerLevel < 0) {
      sinricData.powerLevel = 0;
    } else if (sinricData.powerLevel > 100) {
      sinricData.powerLevel = 100;
    }
    callbacks.setPowerLevel(payload.deviceId, sinricData.powerLevel);
    return jsonResponse(payload, payload.value);
  } else if (action === 'adjustPowerLevel') {
    sinricData.powerLevel += payload.value.powerLevelDelta;
    if (sinricData.powerLevel < 0) {
      sinricData.powerLevel = 0;
    } else if (sinricData.powerLevel > 100) {
      sinricData.powerLevel = 100;
    }
    callbacks.adjustPowerLevel(payload.deviceId, sinricData.powerLevel);
    return jsonResponse(payload, { powerLevel: sinricData.powerLevel });
  } else if (action === 'setBrightness') {
    sinricData.brightness = payload.value.brightness;
    callbacks.setBrightness(payload.deviceId, sinricData.brightness);
    return jsonResponse(payload, payload.value);
  } else if (action === 'adjustBrightness') {
    sinricData.brightness += payload.value.brightnessDelta;
    if (sinricData.brightness > 100) {
      sinricData.brightness = 100;
    } else if (sinricData.brightness < 0) {
      sinricData.brightness = 0;
    }
    callbacks.adjustBrightness(payload.deviceId, sinricData.brightness);
    return jsonResponse(payload, { brightness: sinricData.brightness });
  } else if (action === 'setColor') {
    sinricData.color = payload.value.color;
    callbacks.setColor(payload.deviceId, sinricData.color);
    return jsonResponse(payload, payload.value);
  }
  return {};
}).catch((err) => {
  console.log(err.message);
});
module.exports = handlePayload;
