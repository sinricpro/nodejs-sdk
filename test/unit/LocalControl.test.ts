/**
 * Unit tests for local (LAN) control: UDP listener and origin-aware routing
 */

import dgram from 'dgram';
import { SinricPro } from '../../src/core/SinricPro';
import { Signature } from '../../src/core/Signature';
import { UdpListener } from '../../src/core/local/UdpListener';
import { SinricProSwitch } from '../../src/devices/SinricProSwitch';
import { InterfaceType, UDP_MULTICAST_ADDRESS, UDP_MULTICAST_PORT } from '../../src/core/types';
import type { QueuedMessage, UdpOrigin } from '../../src/core/types';

const APP_SECRET = '00000000-1111-2222-3333-444444444444-55555555-6666-7777-8888-999999999999';
const DEVICE_ID = 'abcdef0123456789abcdef01';
const TEST_PORT = 34333;

const UDP_ORIGIN_A: UdpOrigin = {
  transport: InterfaceType.UDP,
  address: '192.168.1.10',
  port: 55001,
};
const UDP_ORIGIN_B: UdpOrigin = {
  transport: InterfaceType.UDP,
  address: '192.168.1.11',
  port: 55002,
};

interface SentDatagram {
  message: string;
  address: string;
  port: number;
}

function request(payload: Record<string, unknown>, hmac: string): string {
  return (
    `{"header":{"payloadVersion":2,"signatureVersion":1},` +
    `"payload":${JSON.stringify(payload)},` +
    `"signature":{"HMAC":${JSON.stringify(hmac)}}}`
  );
}

describe('protocol constants', () => {
  it('should match the wire contract shared with the other SDKs', () => {
    expect(UDP_MULTICAST_ADDRESS).toBe('224.9.9.9');
    expect(UDP_MULTICAST_PORT).toBe(3333);
  });
});

describe('UdpListener', () => {
  let listener: UdpListener;
  let client: dgram.Socket;

  beforeEach(async () => {
    listener = new UdpListener({ port: TEST_PORT });
    await listener.start();

    client = dgram.createSocket('udp4');
    await new Promise<void>((resolve) => client.bind(0, '127.0.0.1', resolve));
  });

  afterEach(() => {
    listener.stop();
    client.close();
  });

  it('should answer unicast requests and report the peer per message', async () => {
    const received = new Promise<{ message: string; origin: UdpOrigin }>((resolve) => {
      listener.on('message', (message: string, origin: UdpOrigin) => resolve({ message, origin }));
    });

    client.send('hello', TEST_PORT, '127.0.0.1');

    const { message, origin } = await received;
    expect(message).toBe('hello');
    expect(origin.transport).toBe(InterfaceType.UDP);
    expect(origin.port).toBe(client.address().port);
  });

  it('should reply on the listening socket', async () => {
    const replied = new Promise<string>((resolve) => {
      client.on('message', (data) => resolve(data.toString('utf8')));
    });

    listener.on('message', (_message: string, origin: UdpOrigin) => {
      listener.send('pong', origin.address, origin.port);
    });

    client.send('ping', TEST_PORT, '127.0.0.1');

    await expect(replied).resolves.toBe('pong');
  });
});

describe('origin-aware message routing', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sinricPro: any;
  let signature: Signature;
  let sent: SentDatagram[];
  let websocketSend: jest.Mock;
  let connected: boolean;

  beforeEach(() => {
    sinricPro = SinricPro.getInstance();
    signature = new Signature(APP_SECRET);
    sent = [];
    websocketSend = jest.fn();
    connected = false;

    sinricPro.devices.clear();
    sinricPro.receiveQueue.clear();
    sinricPro.sendQueue.clear();
    sinricPro.signature = signature;
    sinricPro.config = {
      appKey: '00000000-1111-2222-3333-444444444444',
      appSecret: APP_SECRET,
      serverUrl: 'ws.sinric.pro',
      debug: false,
      localControl: true,
      mdns: false,
    };
    sinricPro.udpListener = {
      send: (message: string, address: string, port: number) =>
        sent.push({ message, address, port }),
    };
    sinricPro.websocket = {
      isConnected: () => connected,
      send: websocketSend,
      updateDeviceList: jest.fn(),
    };
  });

  it('should dispatch a UDP request through the normal device callbacks', async () => {
    const states: boolean[] = [];
    const device = SinricProSwitch(DEVICE_ID);
    device.onPowerState((_deviceId: string, state: boolean) => {
      states.push(state);
      return true;
    });
    sinricPro.add(device);

    const payload = {
      action: 'setPowerState',
      deviceId: DEVICE_ID,
      replyToken: 'token',
      type: 'request',
      createdAt: 1,
      value: { state: 'On' },
    };
    const raw = request(payload, signature.calculateSignature(JSON.stringify(payload)));

    sinricPro.receiveQueue.push({ message: raw, origin: UDP_ORIGIN_A });
    await sinricPro.processReceiveQueue();
    sinricPro.processSendQueue();

    expect(states).toEqual([true]);
    expect(sent).toHaveLength(1);
    expect(sent[0].address).toBe(UDP_ORIGIN_A.address);
    expect(sent[0].port).toBe(UDP_ORIGIN_A.port);
    // Responses are never echoed to the cloud.
    expect(websocketSend).not.toHaveBeenCalled();

    const response = JSON.parse(sent[0].message);
    expect(response.payload.success).toBe(true);
    expect(response.payload.deviceId).toBe(DEVICE_ID);
    expect(signature.validate(sent[0].message)).toBe(true);
  });

  it('should answer an invalid signature with a signed "Signature is invalid" reply', async () => {
    const payload = {
      action: 'setPowerState',
      deviceId: DEVICE_ID,
      replyToken: 'token',
      type: 'request',
      createdAt: 1,
      value: { state: 'On' },
    };
    const raw = request(payload, 'this-is-not-the-right-hmac');

    sinricPro.receiveQueue.push({ message: raw, origin: UDP_ORIGIN_A });
    await sinricPro.processReceiveQueue();
    sinricPro.processSendQueue();

    expect(sent).toHaveLength(1);
    expect(sent[0].address).toBe(UDP_ORIGIN_A.address);
    expect(sent[0].port).toBe(UDP_ORIGIN_A.port);
    expect(websocketSend).not.toHaveBeenCalled();

    const response = JSON.parse(sent[0].message);
    expect(response.payload.success).toBe(false);
    expect(response.payload.message).toBe('Signature is invalid');
    // The rejection is itself signed, so the client can trust it.
    expect(signature.validate(sent[0].message)).toBe(true);
  });

  it('should answer each queued message at its own peer', async () => {
    const payload = {
      action: 'setPowerState',
      deviceId: DEVICE_ID,
      replyToken: 'token',
      type: 'request',
      createdAt: 1,
      value: { state: 'On' },
    };
    const raw = request(payload, 'bad');

    sinricPro.receiveQueue.push({ message: raw, origin: UDP_ORIGIN_A });
    sinricPro.receiveQueue.push({ message: raw, origin: UDP_ORIGIN_B });
    await sinricPro.processReceiveQueue();
    sinricPro.processSendQueue();

    expect(sent.map((datagram) => datagram.port)).toEqual([UDP_ORIGIN_A.port, UDP_ORIGIN_B.port]);
  });

  it('should send UDP replies while the websocket has never connected', () => {
    sinricPro.sendQueue.push({ message: '{"udp":true}', origin: UDP_ORIGIN_A });
    sinricPro.sendQueue.push({
      message: '{"ws":true}',
      origin: { transport: InterfaceType.WebSocket },
    });

    sinricPro.processSendQueue();

    expect(sent.map((datagram) => datagram.message)).toEqual(['{"udp":true}']);
    expect(websocketSend).not.toHaveBeenCalled();
    // The websocket message is held, not dropped, and keeps its place.
    expect(sinricPro.sendQueue.size()).toBe(1);

    connected = true;
    sinricPro.processSendQueue();

    expect(websocketSend).toHaveBeenCalledWith('{"ws":true}');
    expect(sinricPro.sendQueue.isEmpty()).toBe(true);
  });

  it('should preserve the order of deferred websocket messages', () => {
    const messages: QueuedMessage[] = ['a', 'b', 'c'].map((message) => ({
      message,
      origin: { transport: InterfaceType.WebSocket },
    }));
    messages.forEach((entry) => sinricPro.sendQueue.push(entry));

    sinricPro.processSendQueue();
    connected = true;
    sinricPro.processSendQueue();

    expect(websocketSend.mock.calls.map((call) => call[0])).toEqual(['a', 'b', 'c']);
  });
});
