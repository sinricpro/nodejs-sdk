const client = require('./prosocket');
const SinricPro = (callbacks)=>{

client.on('open',()=>{
    console.log('Connected');
});

client.on('message',(data)=>{
callbacks.setPowerState(data);
});


}

module.exports = SinricPro;