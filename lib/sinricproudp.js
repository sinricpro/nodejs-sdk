const PORT = 3333;
const MULTICAST_ADDR = '224.9.9.9';

const dgram = require('dgram');
const process = require('process');

const socket = dgram.createSocket({
  type: 'udp4',
  reuseAddr: true,
});

socket.bind(PORT);

function sendMessage() {
  const message = Buffer.from(`Message from process ${process.pid}`);
  socket.send(message, 0, message.length, PORT, MULTICAST_ADDR, () => {
    console.info(`Sending message "${message}"`);
  });
}

socket.on('listening', () => {
  socket.addMembership(MULTICAST_ADDR);
  setInterval(sendMessage, 3000);
  const address = socket.address();
  console.log(
    `UDP socket listening on : ${address}`,
  );
});


socket.on('message', (message, rinfo) => {
  console.info(`Message from: ${rinfo.address}:${rinfo.port} - ${message}`);
});
