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