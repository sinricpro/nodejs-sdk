const credential = {
  appkey: '',
  secretKey: '',
};

const deviceIds = {
  deviceId1: '',
  deviceId2: '',
  deviceId3: '',
};
let deviceIdT = [];

for (let key in deviceIds) {
  if (deviceIds.hasOwnProperty(key)) {
    deviceIdT.push(deviceIds[key]);
  }
}

const deviceIdArr = deviceIdT;
module.exports = {
  appKey: credential.appkey, secretKey: credential.secretKey, deviceId: deviceIdArr, deviceId1: deviceIds.deviceId1,
};
