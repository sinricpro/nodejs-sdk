const crypto = require('crypto');

const assert = require('assert');

const { secretKey } = require('../credentials');

const getSignature = (message) => crypto.createHmac('sha256', secretKey).update(message).digest('base64');

const verifySignature = (payload, signature) => {
  const localSignature = getSignature(payload);
  return localSignature === signature;
};

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

const handlePayload = (payload, signature, callbacks) => {
  try {
    assert(verifySignature(JSON.stringify(payload), signature));
    if (payload.action === 'setPowerState') {
      callbacks.setPowerState(payload.deviceId, payload.value.state);
      return jsonResponse(payload, payload.value);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(`Assert error : ${err.message}`);
  }
};

module.exports = handlePayload;
