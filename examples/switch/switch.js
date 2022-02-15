const { SinricPro, startSinricPro, raiseEvent, eventNames } = require('sinricpro'); // require('../../index');
const APPKEY     = '';
const APPSECRET  = '';
const device1    = '';
const deviceIds  = [device1]

const setPowerState = (deviceid, data) => {
  console.log(deviceid, data);
  return true;
}

const sinricpro = new SinricPro(APPKEY, deviceIds, APPSECRET, true);
const callbacks = { setPowerState };

startSinricPro(sinricpro, callbacks);

setInterval(() => {
  // Send manual change to Sinric Pro
  raiseEvent(sinricpro, eventNames.powerState, device1, { state: 'On' });
}, 60000);
