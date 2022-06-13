//process.env.SR_DEBUG = '1';

const { SinricPro, startSinricPro } = require("sinricpro"); //= require('../../index');

const APPKEY = "";
const APPSECRET = "";
const device1 = "";

const deviceIds = [device1];

function setMode(deviceid, data, instanceId) {
  console.log(deviceid, data, instanceId);
  return true;
}

function setRangeValue(deviceid, data, instanceId) {
  console.log(deviceid, data, instanceId);
  return true;
}

function adjustRangeValue(deviceid, data, instanceId) {
  console.log(deviceid, data, instanceId);
  return true;
}

function setToggleState(deviceid, data, instanceId) {
  console.log(deviceid, data, instanceId);
  return true;
}

const callbacks = {
  adjustRangeValue,
  setMode,
  setRangeValue,
  setToggleState,
};

const sinricpro = new SinricPro(APPKEY, deviceIds, APPSECRET, true);
startSinricPro(sinricpro, callbacks);
