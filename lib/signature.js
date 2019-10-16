
/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */
const crypto = require('crypto');

const { secretKey } = require('../credential');

const getSignature = (message) => crypto.createHmac('sha256', secretKey).update(message).digest('base64');

const verifySignature = (payload, signature) => {
  const localSignature = getSignature(JSON.stringify(payload));
  return new Promise((resolve, reject) => {
    if (signature === localSignature) {
      resolve(payload.action);
    } else {
      reject(new Error('Signatures didn\'t match'));
    }
  });
};

module.exports = { getSignature, verifySignature };
