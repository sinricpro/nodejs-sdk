const uuidv4 = require('uuid/v4');
const socket = require('../prosocket');
const { getSignature } = require('../signature');

const eventNames = {
  powerState: 'setPowerState',
};
const header = {
  payloadVersion: 2,
  signatureVersion: 1,
};

const raiseEvent = (eventName, deviceId, value) => {
  if (eventName === eventNames.powerState) {
    const payload = {
      action: eventName,
      cause: {
        type: 'PHYSICAL_INTERACTION',
      },
      createdAt: Math.round(new Date() / 1000),
      deviceId,
      replyToken: uuidv4(),
      type: 'event',
      value: {
        state: value.state || 'Off',
      },
    };
    const signature = {
      HMAC: getSignature(JSON.stringify(payload)),
    };

    socket.send(JSON.stringify({ header, payload, signature }));
  }
};

module.exports = { raiseEvent, eventNames };
