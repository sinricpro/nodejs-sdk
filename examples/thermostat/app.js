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

const onDisconnect = () => {
  console.log("Connection closed");
}

const onConnected = () => {
  console.log("Connected to Sinric Pro");
}

const callbacks = {
  setPowerState,
  targetTemperature,
  setThermostatMode,
  adjustTargetTemperature,
  onDisconnect,
  onConnected,
};

const sinricpro = new SinricPro(appKey, deviceIds, secretKey, true);
startSinricPro(sinricpro, callbacks);

//  setInterval(() => {
//     //raiseEvent(sinricpro, eventNames.powerState, "deviceid", { state: 'On' });
//     //raiseEvent(sinricpro, eventNames.targetTemperature, "deviceid", { temperature: Math.floor(Math.random() * 60) });
//     //raiseEvent(sinricpro, eventNames.thermostatMode, "deviceid", { thermostatMode: 'AUTO' });
//     //raiseEvent(sinricpro, eventNames.currentTemperature, "deviceid", { "humidity": 75.3, "temperature": 24});
//  }, 15000);
 