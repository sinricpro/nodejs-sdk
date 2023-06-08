/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const sinricProData = require('../storage');
const { UndefinedCallbackError, InvalidResponseError } = require('../errors/errors');

const Volume = async (payload, callbacks) => {
  sinricProData.volume = payload.value.volume;

  if (callbacks.setVolume) {
    const resp = callbacks.setVolume(payload.deviceId, sinricProData.volume);
    if (payload.value.volume && resp) return payload.value;
    throw new InvalidResponseError('Volume undefined');
  } else {
    throw new UndefinedCallbackError('setVolume callback is undefined.');
  }
};

const VolumeAdjust = async (payload, callbacks) => {
  sinricProData.volume += payload.value.volume;
  if (sinricProData.volume > 100) sinricProData.volume = 100;
  else if (sinricProData.volume < 0) sinricProData.volume = 0;

  if (callbacks.adjustVolume) {
    const resp = await callbacks.setVolume(payload.deviceId, sinricProData.volume);
    if (payload.value.volume && resp) return { volume: sinricProData.volume };
    throw new InvalidResponseError('Volume undefined');
  } else {
    throw new UndefinedCallbackError('adjustVolume callback is undefined.');
  }
};

const Mute = async (payload, callbacks) => {
  if (callbacks.setMute) {
    const resp = await callbacks.setMute(payload.deviceId, payload.value.mute);
    if ((payload.value.mute === true || payload.value.mute === false) && resp) return payload.value;
    throw new InvalidResponseError('Mute undefined');
  } else {
    throw new UndefinedCallbackError('setMute callback is undefined.');
  }
};

const Input = async (payload, callbacks) => {
  sinricProData.input = payload.value.input;

  if (callbacks.selectInput) {
    const resp = await callbacks.selectInput(payload.deviceId, payload.value.input);
    if ((payload.value.mute === true || payload.value.mute === false) && resp) return payload.value;
    throw new InvalidResponseError('Input undefined');
  } else {
    throw new UndefinedCallbackError('selectInput callback is undefined.');
  }
};

const Media = async (payload, callbacks) => {
  if (callbacks.selectInput) {
    const resp = await callbacks.mediaControl(payload.deviceId, payload.value.control);
    if (payload.value.control && resp) return payload.value;
    throw new InvalidResponseError('Control undefined');
  } else {
    throw new UndefinedCallbackError('mediaControl callback is undefined.');
  }
};

const ChangeChannel = async (payload, callbacks) => {
  const channel = payload.value.channel.name || payload.value.channel.number;

  if (callbacks.changeChannel) {
    const resp = callbacks.changeChannel(payload.deviceId, channel);
    if (channel && resp) return payload.value;
    throw new InvalidResponseError('Channel name undefined');
  } else {
    throw new UndefinedCallbackError('mediaControl callback is undefined.');
  }
};

const SkipChannel = (payload, callbacks) => {
  if (callbacks.changeChannel) {
    const resp = callbacks.skipChannels(payload.deviceId, payload.value.channelCount);
    if (payload.value.channelCount && resp) return payload.value;
    throw new InvalidResponseError('Channel count undefined');
  } else {
    throw new UndefinedCallbackError('skipChannels callback is undefined.');
  }
};

module.exports = {
  Volume, VolumeAdjust, Mute, Input, Media, ChangeChannel, SkipChannel,
};
