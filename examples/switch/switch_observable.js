const { SinricPro, startSinricPro, raiseEvent, eventNames } = require('sinricpro');
const { startSinricProObservable } = require('sinricpro');

const appKey    = '';
const secretKey = '';
const device1   = '';
const device2   = '';
const deviceId  = [device1, device2];

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
startSinricProObservable(sinricpro, callbacks).subscribe((emit) => {
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
