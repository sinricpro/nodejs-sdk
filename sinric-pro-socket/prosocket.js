const Websocket = require('ws');
const {appKey,secretKey, deviceId} = require('../credentials');
const client = new Websocket("ws://ws.sinric.pro",{
headers:{
    appkey: appKey,
    deviceids: deviceId
}
});

client.on('open',()=>{
    console.log('Connected to sinric pro')
});

client.on('message',(data)=>{
    console.log(data)
});