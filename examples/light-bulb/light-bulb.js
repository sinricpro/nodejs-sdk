const {
  SinricPro, startSinricPro, raiseEvent, eventNames,
} = require('sinricpro');

const APPKEY = '';
const APPSECRET = '';
const light = '';
const deviceIds = [light];

const setPowerState = async (deviceid, data) => {
  console.log("Power state: ", deviceid, data);
  return true;
};

const setColorTemperature = async (deviceid, data) => {
  console.log("Color temperature: ", deviceid, data);
  return true;
};

const setColor = async (deviceid, data) => {
  console.log("Color: ", deviceid, data);
  return true;
};

const setBrightness = async (deviceid, data) => {
  console.log("Brightness: ", deviceid, data);
  return true;
};

const onDisconnect = () => {
  console.log("Connection closed");
}

const onConnected = () => {
  console.log("Connected to Sinric Pro");
}
const callbacks = {
  setPowerState,
  setColorTemperature,
  setBrightness,
  setColor,
  onDisconnect,
  onConnected,
};

const sinricpro = new SinricPro(APPKEY, deviceIds, APPSECRET, true);
startSinricPro(sinricpro, callbacks);
