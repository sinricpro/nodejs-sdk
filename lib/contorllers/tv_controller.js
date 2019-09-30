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

module.exports = { Volume, VolumeAdjust, Mute };
