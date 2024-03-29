//process.env.SR_DEBUG = '1';

const { SinricPro, startSinricPro } = require("sinricpro"); //= require('../../index');

const APPKEY = "";
const APPSECRET = "";
const device1 = "";

const deviceIds = [device1];

async function setMode(deviceid, data, instanceId) {
  console.log(deviceid, data, instanceId);
  return true;
}

async function setRangeValue(deviceid, data, instanceId) {
  console.log(deviceid, data, instanceId);
  return true;
}

async function adjustRangeValue(deviceid, data, instanceId) {
  console.log(deviceid, data, instanceId);
  return true;
}

async function setToggleState(deviceid, data, instanceId) {
  console.log(deviceid, data, instanceId);
  return true;
}

const onDisconnect = () => {
  console.log("Connection closed");
}

const onConnected = () => {
  console.log("Connected to Sinric Pro");
}

const callbacks = {
  adjustRangeValue,
  setMode,
  setRangeValue,
  setToggleState,
  onDisconnect,
  onConnected,
};

const sinricpro = new SinricPro(APPKEY, deviceIds, APPSECRET, true);
startSinricPro(sinricpro, callbacks);
