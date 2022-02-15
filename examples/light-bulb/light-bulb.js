const { SinricPro, startSinricPro, raiseEvent, eventNames } = require('sinricpro'); 
const APPKEY    = '';
const APPSECRET = '';
const light     = '';
const deviceIds = [light]

const setPowerState = (deviceid, data) => {
  console.log("Power state: ", deviceid, data);
  return true;
}

const setColorTemperature = (deviceid, data) => {
  console.log("Color temperature: ", deviceid, data);
  return true;
}

const setColor = (deviceid, data) => {
  console.log("Color: ", deviceid, data);
  return true;
}

const setBrightness = (deviceid, data) => {
  console.log("Brightness: ", deviceid, data);
  return true;
}

const callbacks = {
  setPowerState,
  setColorTemperature,
  setBrightness,
  setColor
};

const sinricpro = new SinricPro(APPKEY, deviceIds, APPSECRET, true);
startSinricPro(sinricpro, callbacks); 