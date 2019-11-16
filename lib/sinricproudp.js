
/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const SocketUdp = require('dgram');

const callbackHandler = require('./cbhandler');

class SinricProUdp {
  constructor(deviceids, secretKey) {
    this._multicastAddress = '224.9.9.9';
    this._multicastPort = 3333;
    this._deviceIds = deviceids;
    this._secretKey = secretKey;
    this._multisocket = SocketUdp.createSocket({
      type: 'udp4',
      reuseAddr: true,
    });
    this._multisocket.bind(this._multicastPort);


    this.begin = (udpClient, callbacks) => {
      this._multisocket.on('listening', () => {
        this._multisocket.addMembership(this._multicastAddress);
        const address = this._multisocket.address();
        console.log(
          `UDP socket listening on : ${address}`,
        );
      });

      this._multisocket.on('message', (message, rinfo) => {
        const response = callbackHandler(udpClient, JSON.parse(message).payload, JSON.parse(message).signature.HMAC, callbacks);
        response.then((res) => {
          this._multisocket.send(JSON.stringify(res), rinfo.port, rinfo.address);
        })
          .catch((err) => {
            console.log(err.message);
          });
      });
    };
  }

  get getSecretKey() {
    return this._secretKey;
  }
}


module.exports = SinricProUdp;
