const { SinricPro, SinricProActions, raiseEvent, eventNames, SinricProUdp } = require('sinricpro'); // Use require('sinricpro'); if you are using NPM

const appKey = '5e89a277-522e-4fc8-a044-43e8e487aebc'; // d89f1***-****-****-****-************
const secretKey = 'e7de1151-01a6-4e1e-8502-d5cd595cd09d-9c0e4cfe-b066-40bb-ab74-8a3a5b0383b3'; // f44d1d31-1c19-****-****-9bc96c34b5bb-d19f42dd-****-****-****-************
const device1 = '5faac685cef657243fb05657'; // 5d7e7d96069e275ea9******
const device2 = ''; // 5d80ac5713fa175e99******
const deviceId = [device1]


function setBrightness(sinricpro,deviceid,data){
    try{
    raiseEvent(sinricpro, eventNames.setBrightness, deviceid, { brightness: data });
    return true;
    }
    catch(e){
    return false;
    }
}

const callbacks = {
  setPowerState,
};

const sinricpro = new SinricPro(appKey, deviceId, secretKey, true);

SinricProActions(sinricpro, callbacks);
const udp = new SinricProUdp(deviceId, secretKey);
udp.begin(callbacks);

const brightnessValue=30;
setInterval(() => {
  setBrightness(sinricpro,device1,brightnessValue)
}, 2000);
