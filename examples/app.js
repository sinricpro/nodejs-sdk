const app = require('../index');

function powerState(deviceId,state){
console.log(deviceId,state);
}

callbacks={
setPowerState: powerState
}

app(callbacks);