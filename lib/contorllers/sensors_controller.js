const sinricProData = require('../storage');

const ThermoStatMode = (payload, callbacks) => {
  sinricProData.thermostat = payload.value.thermostatMode;
  const resp = callbacks.setThermoStatMode(payload.deviceId, sinricProData.thermostat);
  return new Promise((resolve, reject) => {
    if (payload.value.thermostatMode && resp) resolve(payload.value);
    else reject(new Error('Thermostat mode undefined'));
  });
};


module.exports = { ThermoStatMode };
