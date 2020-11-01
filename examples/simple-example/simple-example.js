const {
  SinricPro, SinricProActions, raiseEvent, eventNames, SinricProUdp,
} = require('../../index');

/**
 *  Change to below code if your are using via npm
 *
 * const {SinricPro, SinricProActions, raiseEvent, eventNames,} = require('../index');
 *                                       ||
 *                                       ||
 *                                       ||
 *                                       ||
 *                                       ||
 *                                      \  /
 *                                       \/
 * const { SinricPro, SinricProActions, raiseEvent, eventNames,} = require('sinricpro');
 *
 *
 *
 */

const appKey = ''; // d89f1***-****-****-****-************
const secretKey = ''; // f44d1d31-1c19-****-****-9bc96c34b5bb-d19f42dd-****-****-****-************
const device1 = ''; // 5d7e7d96069e275ea9******
const device2 = ''; // 5d80ac5713fa175e99******
const deviceId = [device1, device2];


function setPowerState(deviceid, data) {
  console.log(deviceid, data);
  return true;
}


const callbacks = {
  setPowerState,
};

const sinricpro = new SinricPro(appKey, deviceId, secretKey, true);

SinricProActions(sinricpro, callbacks);
const udp = new SinricProUdp(deviceId, secretKey);

udp.begin(callbacks);

setInterval(() => {
  raiseEvent(sinricpro, eventNames.powerState, device1, { state: 'On' });
}, 2000);
