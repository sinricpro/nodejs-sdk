# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v3.0.0.html).

## [1.0.0] - 2024-XX-XX

### Added
- Initial release of SinricPro SDK for Node.js and TypeScript
- Core SDK infrastructure with WebSocket communication
- HMAC-SHA256 authentication
- Event rate limiting
- Device types:
  - SinricProSwitch
  - SinricProLight
  - SinricProThermostat
- Capability controllers:
  - PowerStateController
  - BrightnessController
  - ColorController
  - ColorTemperatureController
  - TemperatureSensor
- Full TypeScript support with type definitions
- Async/await API
- Automatic reconnection
- Comprehensive examples (Switch, Light, Thermostat)
- Unit tests with Jest
- Complete documentation
- Migration guide from C++ SDK

### Features
- ✅ WebSocket connection with SSL/TLS
- ✅ Automatic message signing
- ✅ Event-driven architecture
- ✅ EventEmitter-based pub/sub
- ✅ Composable capability mixins
- ✅ Strong typing with TypeScript
- ✅ Error handling and logging
- ✅ Heartbeat/ping-pong
- ✅ Device state restoration

### Documentation
- README with quick start guide
- API documentation
- Migration guide from C++ SDK
- Example applications
- TypeScript type definitions

## [Unreleased]

### Planned
- UDP multicast support
- Additional device types (Fan, TV, Lock, Camera)
- Additional capabilities (Media, Volume, Thermostat modes)
- OTA update support
- Module-level commands
- Health reporting
- Browser compatibility layer
- Performance optimizations
- Additional examples
