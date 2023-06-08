// process.env.SR_DEBUG = '1'; // Enable debug logs
const {
  SinricPro, startSinricPro, raiseEvent, eventNames,
} = require('sinricpro'); // require('../../index');

const APPKEY = '';
const APPSECRET = '';
const device1 = '';
const deviceIds = [device1];

const setPowerState = async (deviceid, data) => {
  console.log(deviceid, data);
  return true;
};

const sinricpro = new SinricPro(APPKEY, deviceIds, APPSECRET, true);
const callbacks = { setPowerState };

startSinricPro(sinricpro, callbacks);

// setInterval(() => {
//   // Send manual change the state in Sinric Pro
//   //raiseEvent(sinricpro, eventNames.powerState, device1, { state: 'On' });
//   //raiseEvent(sinricpro, eventNames.pushNotification, device1, { alert: "Hello there" });
// }, 10000);
