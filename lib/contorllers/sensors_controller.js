
/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const sinricProData = require('../storage');

const ThermoStatMode = (payload, callbacks) => {
  sinricProData.thermostat.mode = payload.value.thermostatMode;
  const resp = callbacks.setThermostatMode(payload.deviceId, sinricProData.thermostat.mode);
  return new Promise((resolve, reject) => {
    if (payload.value.thermostatMode && resp) resolve(payload.value);
    else reject(new Error('Thermostat mode undefined'));
  });
};
const ThermoStatTemperature = (payload, callbacks) => {
  sinricProData.thermostat.temperature = payload.value.temperature;
  const resp = callbacks.targetTemperature(payload.deviceId, sinricProData.thermostat.temperature);
  return new Promise((resolve, reject) => {
    if (payload.value.temperature && resp) resolve(payload.value);
    else reject(new Error('Thermostat temperature undefined'));
  });
};

const Lock = (payload, callbacks) => {
  const resp = callbacks.setLockState(payload.deviceId, payload.value.state);
  return new Promise((resolve, reject) => {
    if (resp) resolve({ state: `${payload.value.state.toUpperCase()}ED` });
    else reject(new Error('Set lock state error'));
  });
};

module.exports = { ThermoStatMode, ThermoStatTemperature, Lock };
