const {
  SinricPro, SinricProActions, raiseEvent, eventNames, SinricProUdp,
} = require('../../index');
const { SinricProActionsObservable } = require('../../lib/sinrcpro');

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

let interval = null;

// emit on connection is synched
SinricProActionsObservable(sinricpro, callbacks).subscribe((emit) => {
  console.log(emit);
  const udp = new SinricProUdp(deviceId, secretKey);

  udp.begin(callbacks);

  interval = setInterval(() => {
    raiseEvent(sinricpro, eventNames.powerState, device1, { state: 'On' });
  }, 2000);
}, (err) => {
  console.error(err);
},
() => {
  if (interval) {
    clearInterval(interval);
    console.log('Disconnected');
  }
});
