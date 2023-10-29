//process.env.SR_DEBUG = '1'; // Enable debug logs

const { SinricPro, startSinricPro, eventNames, raiseEvent } = require('sinricpro');

const appKey = "";
const secretKey = "";
const deviceIds = [""];

let globalTemperature = 0;

function setPowerState(deviceid, data) {
  console.log("Power state: ", deviceid, data);
  return true;
}
 
function setThermostatMode(deviceid, data) {
  console.log("Thermostat mode: ", deviceid, data);
  return true;
}

function targetTemperature(deviceid, temperature) {
    console.log("Target temperature: ", deviceid, temperature); 
    globalTemperature = temperature;
    return true;
}

function adjustTargetTemperature(deviceid, temperatureDelta) {
  console.log("Adjust target temperature by ", temperatureDelta); 
  console.log("Current temperature is: ", globalTemperature);
  globalTemperature += temperatureDelta;  // calculate absolut temperature
  console.log("New temperature is: ", globalTemperature);
  return { success: true, temperature: globalTemperature };
}

const callbacks = {
  setPowerState,
  targetTemperature,
  setThermostatMode,
  adjustTargetTemperature
};

const sinricpro = new SinricPro(appKey, deviceIds, secretKey, true);
startSinricPro(sinricpro, callbacks);

// setInterval(() => {
//    // raiseEvent(sinricpro, eventNames.thermostatMode, "65322d740e3e2a75e4c908b4", { thermostatMode: 'AUTO' });
//    // raiseEvent(sinricpro, eventNames.currentTemperature, "65322d740e3e2a75e4c908b4", { "humidity": 75.3, "temperature": 24});
// }, 5000);