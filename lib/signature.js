const crypto = require('crypto');

const { secretKey } = require('../credentials');

const getSignature = (message) => crypto.createHmac('sha256', secretKey).update(message).digest('base64');

const verifySignature = (payload, signature) => {
  const localSignature = getSignature(JSON.stringify(payload));
  return new Promise((resolve, reject) => {
    if (signature === localSignature) {
      resolve();
    } else {
      reject(new Error('Signatures didn\'t match'));
    }
  });
};

module.exports = { getSignature, verifySignature };
