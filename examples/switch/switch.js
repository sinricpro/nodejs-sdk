const {
  SinricPro, startSinricPro, raiseEvent, eventNames,
} = require('../../index');

const APPKEY = '718bb344-9959-44f3-a5d4-7af919235f80';
const APPSECRET = 'de9b5b1b-b6ac-4efc-b27b-8b9d6d80a19a-e6629020-22f4-4ffd-8839-f77c821a43cb';
const device1 = '6200b0355237d163c30e0112';
const deviceIds = [device1];

const setPowerState = (deviceid, data) => {
  console.log(deviceid, data);
  return true;
};

const sinricpro = new SinricPro(APPKEY, deviceIds, APPSECRET, true);
const callbacks = { setPowerState };

startSinricPro(sinricpro, callbacks);

setInterval(() => {
  // Send manual change to Sinric Pro
  raiseEvent(sinricpro, eventNames.powerState, device1, { state: 'On' });
}, 60000);
