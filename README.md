# SinricPro (NodeJs-SDK)

### Installation

```
npm install sinricpro
```

### Dependencies

  [Websockets](https://www.npmjs.com/package/ws)
  
  [Crypto](https://nodejs.org/api/crypto.html)

  [uuid](https://www.npmjs.com/package/uuid)



### Add a credential file into your root folder (credential.js)

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

    const deviceIdArr = deviceIdT.join(';');
        module.exports = {
            appKey: credential.appkey, secretKey: credential.secretKey, deviceId: deviceIdArr,
    };


### Example (app.js)

    const { SinricPro, raiseEvent, eventNames } = require('sinricpro');
    const deviceid1 = 'Your Device Id'
    function setPowerState(deviceId, data) {
        console.log(deviceId, data);
        return true;
    }

    const callbacks = {
        setPowerState,
    };

    SinricPro(callbacks);

    setInterval(() => {
         raiseEvent(eventNames.powerState, deviceId1, { state: 'On' });
    }, 2000);
