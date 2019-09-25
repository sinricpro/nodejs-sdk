const app = require('../index');

function powerState(data){
console.log(data);
}

callbacks={
setPowerState: powerState
}

app(callbacks);