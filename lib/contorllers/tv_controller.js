const sinricProData = require('../storage');

const Volume = (payload, callbacks) => {
  sinricProData.volume = payload.value.volume;
  callbacks.setVolume(payload.deviceId, sinricProData.volume);
  return new Promise((resolve, reject) => {
    if (payload.value.volume) resolve(payload.value);
    else reject(new Error('Volume undefined'));
  });
};

const VolumeAdjust = (payload, callbacks) => {
  sinricProData.volume += payload.value.volume;
  if (sinricProData.volume > 100) sinricProData.volume = 100;
  else if (sinricProData.volume < 0) sinricProData.volume = 0;
  callbacks.adjustVolume(payload.deviceId, sinricProData.volume);
  return new Promise((resolve, reject) => {
    if (payload.value.volume) resolve({ volume: sinricProData.volume });
    else reject(new Error('Volume undefined'));
  });
};


const Mute = (payload, callbacks) => {
  callbacks.setMute(payload.deviceId, payload.value.mute);
  return new Promise((resolve, reject) => {
    if (payload.value.mute === true || payload.value.mute === false) resolve(payload.value);
    else reject(new Error('Mute undefined'));
  });
};

const Input = (payload, callbacks) => {
  sinricProData.input = payload.value.input;
  callbacks.selectInput(payload.deviceId, payload.value.input);
  return new Promise((resolve, reject) => {
    if (payload.value.input) resolve(payload.value);
    else reject(new Error('Input undefined'));
  });
};

const Media = (payload, callbacks) => {
  callbacks.mediaControl(payload.deviceId, payload.value.control);
  return new Promise((resolve, reject) => {
    if (payload.value.control) resolve(payload.value);
    else reject(new Error('Control undefined'));
  });
};

const ChangeChannel = (payload, callbacks) => {
  callbacks.changeChannel(payload.deviceId, payload.value.channel.name);
  return new Promise((resolve, reject) => {
    if (payload.value.channel.name) resolve(payload.value);
    else reject(new Error('Channel name undefined'));
  });
};

const SkipChannel = (payload, callbacks) => {
  callbacks.skipChannels(payload.deviceId, payload.value.channelCount);
  return new Promise((resolve, reject) => {
    if (payload.value.channelCount) resolve(payload.value);
    else reject(new Error('Channel count undefined'));
  });
};

module.exports = {
  Volume, VolumeAdjust, Mute, Input, Media, ChangeChannel, SkipChannel,
};
