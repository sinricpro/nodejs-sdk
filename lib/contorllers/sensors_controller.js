/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const sinricProData = require('../storage');
const { UndefinedCallbackError, InvalidResponseError } = require('../errors/errors');

const ThermoStatMode = async (payload, callbacks) => {
  sinricProData.thermostat.mode = payload.value.thermostatMode;

  if (callbacks.setThermostatMode) {
    const resp = await callbacks.setThermostatMode(payload.deviceId, sinricProData.thermostat.mode);
    if (payload.value.thermostatMode && resp) return payload.value;
    throw new InvalidResponseError('Thermostat mode undefined');
  } else {
    throw new UndefinedCallbackError('setThermostatMode callback is undefined.');
  }
};
const ThermoStatTemperature = async (payload, callbacks) => {
  sinricProData.thermostat.temperature = payload.value.temperature;

  if (callbacks.targetTemperature) {
    const resp = await callbacks.targetTemperature(payload.deviceId, sinricProData.thermostat.temperature);
    if (payload.value.temperature && resp) return payload.value;
    throw new InvalidResponseError('Thermostat temperature undefined');
  } else {
    throw new UndefinedCallbackError('targetTemperature callback is undefined.');
  }
};

const AdjustTargetTemperature = async (payload, callbacks) => {  
  if (callbacks.adjustTargetTemperature) {
    const resp = await callbacks.adjustTargetTemperature(payload.deviceId, payload.value.temperature);
    if (resp.temperature) return resp;
    throw new InvalidResponseError('Thermostat temperature undefined');
  } else {
    throw new UndefinedCallbackError('adjustTargetTemperature callback is undefined.');
  }
};

const Lock = async (payload, callbacks) => {
  if (callbacks.setLockState) {
    const resp = await callbacks.setLockState(payload.deviceId, payload.value.state);
    if (resp) return { state: `${payload.value.state.toUpperCase()}ED` };
    throw new InvalidResponseError('Lock state is undefined');
  } else {
    throw new UndefinedCallbackError('setLockState callback is undefined.');
  }
};

module.exports = { ThermoStatMode, ThermoStatTemperature, Lock, AdjustTargetTemperature };
