const sinricProData = require('../storage');

const ThermoStatMode = (payload, callbacks) => {
  sinricProData.thermostat = payload.value.thermostatMode;
  const resp = callbacks.setThermoStatMode(payload.deviceId, sinricProData.thermostat);
  return new Promise((resolve, reject) => {
    if (payload.value.thermostatMode && resp) resolve(payload.value);
    else reject(new Error('Thermostat mode undefined'));
  });
};

const Lock = (payload, callbacks) => {
  const resp = callbacks.setLockState(payload.deviceId, payload.value.state);
  return new Promise((resolve, reject) => {
    if (resp) resolve({ state: `${payload.value.state.toUpperCase()}ED` });
    else reject(new Error('Set lock state error'));
  });
};

module.exports = { ThermoStatMode, Lock };
