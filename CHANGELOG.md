## [6.0.0]

fix: `onAdjustVolume` now receives the relative delta from the request's `volume` field instead of the nonexistent `volumeDelta` field. Its optional third argument exposes `volumeDefault` when supplied. Absolute `setVolume` requests continue to use `onVolume(deviceId, volume)`.

feat: Local control - devices answer signed commands over the LAN, so they keep working while SinricPro is unreachable.

* UDP listener on port 3333, joined to multicast group `224.9.9.9` and answering unicast on the same port. Replies go back to the peer that sent the request, never to the cloud websocket.
* mDNS announcement of `_sinricpro._udp.local.` (host `sinricpro-<mac>`, TXT `deviceIds`, `sdk`, `udp=1`), re-announced only when the device list changes. `bonjour-service` is a required dependency, so a default install announces without extra steps. Local control is on by default; set `localControl: false` to opt out.
* LAN requests are dispatched through the same capability callbacks as cloud requests - no application changes required.
* A request that fails signature verification is answered with a signed "Signature is invalid" response, so a client can tell a wrong app secret from an unreachable device.
* Disable with `localControl: false` (or `SINRICPRO_NO_LOCAL_CONTROL=1`); disable only the announcement with `mdns: false` (or `SINRICPRO_NOMDNS=1`).

fix: Messages are signed over the exact bytes that are transmitted; incoming signatures are verified against the received bytes rather than a re-encoding of the parsed message, and digests are compared in constant time.

fix: `instanceId` was added to the response payload after signing, which invalidated the signature of every response carrying one.

fix: The send queue is no longer gated on the cloud connection as a whole - each message is routed by its own origin, so a LAN reply goes out even when the websocket has never connected. The offline websocket backlog is now bounded.

fix: A websocket error no longer crashes the process when the application registered no `error` listener.

change: `begin()` no longer rejects when the cloud is unreachable. The SDK starts, retries in the background and keeps answering local control; only invalid configuration throws. Call `isConnected()` for cloud state. Callers that relied on `begin()` rejecting to detect an outage must check it instead.


| | |
|---|---|
| Transport | UDP port `3333`, multicast group `224.9.9.9`, unicast to the host on the same port |
| Discovery | mDNS service `_sinricpro._udp.local.`, host `sinricpro-<mac>`, TXT `deviceIds`, `sdk`, `udp=1` |
| Authentication | HMAC-SHA256 over the payload, keyed with your `APP_SECRET` |

### Discovery

Announcing over mDNS needs an optional peer dependency:

```bash
npm install bonjour-service
```

Without it, local control still works for a client that already knows the
device's address; only discovery is unavailable.

Check the announcement with:

```bash
avahi-browse -r _sinricpro._udp     # Linux
dns-sd -B _sinricpro._udp           # macOS / Windows
```

### Turning it off

```typescript
await SinricPro.begin({
  appKey: 'YOUR-APP-KEY',
  appSecret: 'YOUR-APP-SECRET',
  localControl: false, // no UDP listener, no mDNS
  mdns: false,         // keep the UDP listener, do not announce
});
```

The environment variables `SINRICPRO_NO_LOCAL_CONTROL=1` and `SINRICPRO_NOMDNS=1`
do the same without touching code.

### Notes

- A request whose signature does not verify is answered with a signed
  "Signature is invalid" response rather than silence, so a client can tell a
  wrong secret from an unreachable device.
- An Android client needs a `WifiManager.MulticastLock` and an iOS client needs
  `_sinricpro._udp` in `NSBonjourServices`, or mDNS returns nothing at all.
- On a host with several interfaces (Docker, VPN, WSL), the multicast group is
  joined on every non-internal IPv4 interface; the join outcome is logged.


## [5.2.0]

feat: Send a device setting event to SinricPro

## [5.1.0]

feat: Implemented example applications for various device types including Camera, PowerSensor, Device Settings, Module Settings, and Temperature Sensor.

fix: missing mac in Websocket header.

fix: missing settings, push-notification controller in Switch.

fix: missing instance id.

fix: missing scope when responding back to server.

## [5.0.0]

### Features

* BREAKING CHANGE: feat: remove restoreDeviceStates in order to change this at device level from server side instead of fixed value in client
* Camera, PowerSensor, Switch, TemperatureSensor examples added.
* Missing capabilities added.
* instanceId support for Mode and Range

## [4.0.0]

### Features

* feat: Replaced the old sdk with a new sdk