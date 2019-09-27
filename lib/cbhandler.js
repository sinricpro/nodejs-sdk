const { getSignature, verifySignature } = require('./signature');

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

const handlePayload = (payload, signature, callbacks) => verifySignature(payload, signature).then(() => {
  if (payload.action === 'setPowerState') {
    callbacks.setPowerState(payload.deviceId, payload.value.state);
    return jsonResponse(payload, payload.value);
  }
  return {};
}).catch((err) => {
  console.log(err.message);
});
module.exports = handlePayload;
