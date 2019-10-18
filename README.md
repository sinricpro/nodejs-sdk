# SinricPro (NodeJs-SDK)

### Installation

```
npm install sinricpro
```

### Dependencies

  * [websockets](https://www.npmjs.com/package/ws)
  
  * [crypto](https://nodejs.org/api/crypto.html)

  * [uuid](https://www.npmjs.com/package/uuid)
  
  * [dgram]()



### Add a credential file into your root folder (credential.js)
```javascript 1.8
    const credential = {
        appkey: '',
        secretKey: '',
    };

    const deviceIds = {
        deviceId1: '',
        deviceId2: '',
        deviceId3: '',
    };
    
    // No need to edit the code below
    
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
```

### Example (app.js)
```javascript
    const { SinricPro, raiseEvent, eventNames } = require('sinricpro');
    
    function setPowerState(deviceId, data) {
      console.log(deviceId, data);
      return true;
    }
    function setPowerLevel(deviceId, data) {
      console.log(deviceId, data);
      return true;
    }
    
    function adjustPowerLevel(deviceId, data) {
      console.log(deviceId, data);
      return true;
    }
    
    function setColor(deviceId, data) {
      console.log(deviceId, data);
      return true;
    }
    
    function setRangeValue(deviceId, data) {
      console.log(deviceId, data);
      return true;
    }
    function setLockState(deviceId, data) {
      console.log(deviceId, data);
      return true;
    }
    
    function setBrightness(deviceId, data) {
      console.log(deviceId, data);
      return true;
    }

    function  adjustBrightness(deviceId, data) {
      console.log(deviceId,data);
      return true;
    }    

    function setVolume(deviceId, data) {
      console.log(deviceId, data);
      return true;
    }
    
    function adjustVolume(deviceId, data) {
      console.log(deviceId, data);
      return true;
    }
    
    function setMute(deviceId, data) {
      console.log(deviceId, data);
      return true;
    }
    
    
    const callbacks = {
      setPowerState,
      setPowerLevel,
      adjustPowerLevel,
      setColor,
      setRangeValue,
      setLockState,
      setBrightness,
      setVolume,
      adjustVolume,
      setMute,
      adjustBrightness,
    };
    
    // Actions
    SinricPro(callbacks);
    
    // Events 
    
    setInterval(() => {
      raiseEvent(eventNames.powerState,'DeviceId', { state: 'On' });
      raiseEvent(eventNames.setBrightness,'DeviceId', { brightness: 44 });
      raiseEvent(eventNames.powerLevel, 'deviceId', { powerLevel: 44 });
      raiseEvent(eventNames.color, 'DeviceId', { color: { b: 0, g: 0, r: 0 } });
      raiseEvent(eventNames.colorTemperature, 'Deviceid', { colorTemperature: 8 });
      raiseEvent(eventNames.doorBell, 'DeviceId', { state: 'pressed' });
      raiseEvent(eventNames.thermostatMode, 'DeviceId', { thermostatMode: 'AUTO' });
      raiseEvent(eventNames.rangvalue, 'DeviceId', { rangvalue: 3 });
      raiseEvent(eventNames.motion, 'DeviceId', { state: 'detected' });
      raiseEvent(eventNames.contact, 'DeviceId', { state: 'closed' });
      raiseEvent(eventNames.setVolume, 'DeviceId', { volume: 29 });
      raiseEvent(eventNames.selectInput, 'DeviceId', { input: 'HDMI' });
      raiseEvent(eventNames.media, 'DeviceId', { control: 'FastForward' });
      raiseEvent(eventNames.channel, 'DeviceId', { channel: { name: 'HBO' } });
      raiseEvent(eventNames.mode, 'DeviceId', { mode: 'MOVIE' });
      raiseEvent(eventNames.lock, 'DeviceId', { state: 'LOCKED' });
      raiseEvent(eventNames.mute, 'DeviceId', { mute: true });
    }, 2000);
```
