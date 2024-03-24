// process.env.SR_DEBUG = 1;

const {
  SinricPro, startSinricPro, raiseEvent, eventNames,
} = require('sinricpro');

const APPKEY = '';
const APPSECRET = '';
const light = '';
const deviceIds = [light];

const setPowerState = async (deviceid, data) => {
  console.log(deviceid, data);
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

function sendBrightness(sinricpro, deviceId, data) {
  try {
    raiseEvent(sinricpro, eventNames.setBrightness, deviceId, { brightness: data });
    return true;
  } catch (e) {
    return false;
  }
}



const callbacks = {
  setPowerState,
  setBrightness,
  onDisconnect,
  onConnected,
};

const sinricpro = new SinricPro(APPKEY, deviceIds, APPSECRET, true /* restore device state */);
startSinricPro(sinricpro, callbacks);

// To change  brighness
// const brightnessValue = 30;

// setInterval(() => {
//   sendBrightness(sinricpro, light, brightnessValue)
// }, 60000);
