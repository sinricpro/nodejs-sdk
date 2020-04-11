const { SinricPro, SinricProActions, raiseEvent, eventNames, SinricProUdp } = require('../../index');

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

const appKey = ''; // bd1bd374-5b14-44eb-aca3-1db3df20cf17

bd1bd374-5b14-44eb-aca3-1db3df20cf17

const device1 = ''; //5e9170a60d202b3258095fa3


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
