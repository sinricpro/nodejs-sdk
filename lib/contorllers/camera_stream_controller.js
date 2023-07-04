/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */
const { UndefinedCallbackError, InvalidResponseError } = require("../errors/errors");

const CameraStreamController = async (payload, callbacks) => {
  if (payload.action === "getWebRTCAnswer" && callbacks.getWebRTCAnswer) {
    const data = await callbacks.getWebRTCAnswer(payload.deviceId, payload.value.offer);

    if (data.answer) {
      return data.answer;
    }
    throw new InvalidResponseError(" error");
  } 
  if (payload.action === "getWebRTCOffer" && callbacks.getWebRTCOffer) {
    const data = await callbacks.getWebRTCOffer(payload.deviceId);

    if (data.offer) {
      return data.offer;
    }
    throw new InvalidResponseError(" error");
  } 
  else if (payload.action === "getCameraStreamUrl" && callbacks.getCameraStreamUrl) {
    const data = await callbacks.getCameraStreamUrl(payload.deviceId, payload.value.protocol);
    if (data.url) {
      return data.url;
    }
    throw new InvalidResponseError("getCameraStreamUrl error");
  } else {
    throw new UndefinedCallbackError("getCameraStreamUrl callback is undefined.");
  }
};

module.exports = {
  CameraStreamController,
};
