const sinricProData = require('../storage');

const ThermoStatMode = (payload, callbacks) => {
  sinricProData.thermostat = payload.value.thermostatMode;
  callbacks.setThermoStatMode(payload.deviceId, sinricProData.thermostat);
  return new Promise((resolve, reject) => {
    if (payload.value.thermostatMode) resolve(payload.value);
    else reject(new Error('Thermostat mode undefined'));
  });
};


module.exports = { ThermoStatMode };
