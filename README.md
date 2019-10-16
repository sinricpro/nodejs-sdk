# SinricPro (NodeJs-SDK)

### Installation

```
npm install sinricpro
```

### Dependencies

  [Websockets](https://www.npmjs.com/package/ws)
  [Crypto](https://nodejs.org/api/crypto.html)


### Example

    const { deviceId1, deviceId2 } = require('../credential');
    const { SinricPro, raiseEvent, eventNames } = require('../index');

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
