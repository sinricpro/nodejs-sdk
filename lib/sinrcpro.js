const client = require('./prosocket');
const callbackHandler = require('./cbhandler');

const SinricPro = (callbacks) => {
  client.on('open', () => {
    // eslint-disable-next-line no-console
    console.log('Connected');
  });

  client.on('message', (data) => {
    const parsedData = JSON.parse(data);
    // console.log(parsedData);
    const response = callbackHandler(parsedData.payload, parsedData.signature.HMAC, callbacks);
    client.send(JSON.stringify(response));
  });
};

module.exports = SinricPro;
