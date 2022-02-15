
/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const sinricProData = require('../storage');

const Volume = (payload, callbacks) => {
  sinricProData.volume = payload.value.volume;
  const resp = callbacks.setVolume(payload.deviceId, sinricProData.volume);
  return new Promise((resolve, reject) => {
    if (payload.value.volume && resp) resolve(payload.value);
    else reject(new Error('Volume undefined'));
  });
};

const VolumeAdjust = (payload, callbacks) => {
  sinricProData.volume += payload.value.volume;
  if (sinricProData.volume > 100) sinricProData.volume = 100;
  else if (sinricProData.volume < 0) sinricProData.volume = 0;
  const resp = callbacks.adjustVolume(payload.deviceId, sinricProData.volume);
  return new Promise((resolve, reject) => {
    if (payload.value.volume && resp) resolve({ volume: sinricProData.volume });
    else reject(new Error('Volume undefined'));
  });
};


const Mute = (payload, callbacks) => {
  const resp = callbacks.setMute(payload.deviceId, payload.value.mute);
  return new Promise((resolve, reject) => {
    if ((payload.value.mute === true || payload.value.mute === false) && resp) resolve(payload.value);
    else reject(new Error('Mute undefined'));
  });
};

const Input = (payload, callbacks) => {
  sinricProData.input = payload.value.input;
  const resp = callbacks.selectInput(payload.deviceId, payload.value.input);
  return new Promise((resolve, reject) => {
    if (payload.value.input && resp) resolve(payload.value);
    else reject(new Error('Input undefined'));
  });
};

const Media = (payload, callbacks) => {
  const resp = callbacks.mediaControl(payload.deviceId, payload.value.control);
  return new Promise((resolve, reject) => {
    if (payload.value.control && resp) resolve(payload.value);
    else reject(new Error('Control undefined'));
  });
};

const ChangeChannel = (payload, callbacks) => {
  const channel = payload.value.channel.name || payload.value.channel.number;
  const resp = callbacks.changeChannel(payload.deviceId, channel);
  return new Promise((resolve, reject) => {
    if (channel && resp) resolve(payload.value);
    else reject(new Error('Channel name undefined'));
  });
};

const SkipChannel = (payload, callbacks) => {
  const resp = callbacks.skipChannels(payload.deviceId, payload.value.channelCount);
  return new Promise((resolve, reject) => {
    if (payload.value.channelCount && resp) resolve(payload.value);
    else reject(new Error('Channel count undefined'));
  });
};

module.exports = {
  Volume, VolumeAdjust, Mute, Input, Media, ChangeChannel, SkipChannel,
};
