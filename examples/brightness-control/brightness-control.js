const { SinricPro, startSinricPro, raiseEvent, eventNames } = require('sinricpro'); 

const APPKEY    = '';
const APPSECRET = '';
const light     = '';
const deviceIds = [light]

function setPowerState(deviceid, data) {
  console.log(deviceid, data);
  return true;
}

function setBrightness(sinricpro, deviceId, data) {
    try{
      raiseEvent(sinricpro, eventNames.setBrightness, deviceId, { brightness: data });
      return true;
    }
    catch(e){
      return false;
    }
}

const callbacks = {
  setPowerState,
};

const sinricpro = new SinricPro(APPKEY, deviceIds, APPSECRET, true /* restore device state */);
startSinricPro(sinricpro, callbacks);

// To change  brighness
// const brightnessValue = 30;

// setInterval(() => {
//   setBrightness(sinricpro, light, brightnessValue)
// }, 60000);
