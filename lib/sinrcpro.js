const client = require('./prosocket');
const callbackHandler = require('./cbhandler');

const SinricPro = (callbacks) => {
  client.on('open', () => {
    console.log('Connected');
  });

  client.on('message', (data) => {
    const parsedData = JSON.parse(data);
    const response = callbackHandler(parsedData.payload, parsedData.signature.HMAC, callbacks);
    response.then((res) => {
      client.send(JSON.stringify(res));
    }).catch((err) => {
      console.log(err.message);
    });
  });
};

module.exports = SinricPro;
