# SinricPro Node.js/TypeScript SDK

## Project Overview

This is a complete Node.js/TypeScript SDK for SinricPro - a smart home IoT platform. The SDK provides a modern, type-safe interface for creating and managing smart home devices.

## Architecture

### Core Design Pattern

The SDK uses a **factory function pattern** with **TypeScript mixins** for composable capabilities:

```typescript
// Factory function creates device instances
const mySwitch = SinricProSwitch(deviceId);

// Capabilities are composed via mixins
class SinricProSwitchClass extends PowerStateController(SinricProDevice) { }

// Return type is intersection of all interfaces
type SinricProSwitch = SinricProDevice & IPowerStateController;
```

### Key Technical Decisions

1. **Factory Functions over Classes**
   - User-friendly API (no `new` keyword)
   - Returns properly typed instances with all capabilities
   - Type: `SinricProDevice & ICapability1 & ICapability2 ...`

2. **TypeScript Mixins**
   - Composable capabilities (DRY principle)
   - Each capability is a separate mixin function
   - Uses `Constructor<T>` type with `any[]` args (required by TS)

3. **Type Safety Workarounds**
   - Abstract `SinricProDevice` cast as `any` in device class definitions
   - Factory functions cast return to proper intersection types
   - All `as any` casts are documented with eslint-disable comments

4. **Declaration Files Disabled**
   - TypeScript config: `"declaration": false`
   - Avoids TS4094 errors with mixin pattern and private properties
   - Type information still available through source files

## Directory Structure

```
sinricpro-nodejs-sdk/
├── src/
│   ├── core/              # Core SDK functionality
│   │   ├── SinricPro.ts          # Main singleton class
│   │   ├── SinricProDevice.ts    # Abstract base device
│   │   ├── WebSocketClient.ts    # WebSocket connection
│   │   ├── types.ts              # TypeScript type definitions
│   │   └── EventLimiter.ts       # Rate limiting
│   │
│   ├── devices/           # 18 device implementations
│   │   ├── SinricProSwitch.ts
│   │   ├── SinricProLight.ts
│   │   ├── SinricProThermostat.ts
│   │   └── ...
│   │
│   ├── capabilities/      # 30 capability mixins
│   │   ├── PowerStateController.ts
│   │   ├── BrightnessController.ts
│   │   ├── TemperatureSensor.ts
│   │   └── ...
│   │
│   └── utils/             # Utility functions
│       ├── Logger.ts
│       └── Crypto.ts
│
├── examples/              # 6 working examples
│   ├── switch/
│   ├── light/
│   ├── fan/
│   ├── lock/
│   ├── thermostat/
│   └── tv/
│
├── dist/                  # Compiled JavaScript (gitignored)
├── node_modules/          # Dependencies (gitignored)
│
├── package.json           # NPM configuration
├── tsconfig.json          # TypeScript configuration
├── .eslintrc.json        # ESLint rules
├── .prettierrc.json      # Prettier formatting
└── README.md             # Main documentation
```

## Devices (18 Total)

### Smart Home
- **SinricProSwitch** - Basic on/off switch
- **SinricProDimSwitch** - Dimmable switch (brightness control)
- **SinricProLight** - Full-featured smart light (color, brightness, temperature)
- **SinricProLock** - Smart lock with lock/unlock
- **SinricProBlinds** - Window blinds/curtains (open/close/position)
- **SinricProGarageDoor** - Garage door opener

### Climate Control
- **SinricProThermostat** - Full thermostat (heat/cool/auto modes, target temp)
- **SinricProWindowAC** - Window AC unit
- **SinricProFan** - Smart fan with speed control
- **SinricProFanUS** - US-style fan with power levels

### Entertainment
- **SinricProTV** - Smart TV (power, volume, channels, inputs, media)
- **SinricProSpeaker** - Smart speaker (volume, media, equalizer, modes)
- **SinricProCamera** - Security camera
- **SinricProDoorbell** - Smart doorbell

### Sensors
- **SinricProMotionSensor** - Motion detection
- **SinricProContactSensor** - Door/window contact sensor
- **SinricProTemperatureSensor** - Temperature and humidity
- **SinricProAirQualitySensor** - Air quality monitoring (PM2.5, PM10, AQI)
- **SinricProPowerSensor** - Power consumption monitoring

## Capabilities (30 Total)

### State Control
- **PowerStateController** - On/off control
- **LockController** - Lock/unlock with state
- **OpenCloseController** - Open/close with position
- **StartStopController** - Start/stop operations
- **ToggleController** - Generic toggle switches

### Adjustment Controls
- **BrightnessController** - Brightness levels (0-100)
- **VolumeController** - Volume control with relative adjustments
- **ColorController** - RGB color control
- **ColorTemperatureController** - White color temperature
- **PercentageController** - Generic percentage control
- **PowerLevelController** - Power level settings
- **RangeController** - Generic range values

### Media & Entertainment
- **MediaController** - Play/pause/stop/skip controls
- **ChannelController** - Channel selection and navigation
- **InputController** - Input source selection
- **MuteController** - Mute/unmute
- **EqualizerController** - Audio equalizer bands
- **ModeController** - Generic mode selection

### Climate
- **ThermostatController** - Temperature control with modes (heat/cool/auto)
- **TemperatureSensor** - Temperature and humidity reporting

### Sensors
- **MotionSensor** - Motion detection events
- **ContactSensor** - Contact state reporting
- **AirQualitySensor** - Air quality metrics
- **PowerSensor** - Power consumption reporting

### Advanced Features
- **CameraController** - Camera streaming control
- **Doorbell** - Doorbell press events
- **PushNotification** - Send notifications
- **SettingController** - Generic settings management
- **KeypadController** - Keypad input
- **SmartButtonStateController** - Smart button events

## Type System Implementation

### Device Type Pattern

Every device follows this pattern:

```typescript
// 1. Import capabilities with their interfaces
import { PowerStateController, IPowerStateController } from '../capabilities/PowerStateController';

// 2. Internal class extends capabilities (uses mixin pattern)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProSwitchClass extends PowerStateController(SinricProDevice as any) {
  constructor(deviceId: string) {
    super(deviceId, 'SWITCH');
  }
}

// 3. Factory function returns intersection type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProSwitch(
  deviceId: string
): SinricProDevice & IPowerStateController {
  return new SinricProSwitchClass(deviceId) as any;
}

// 4. Export type alias for TypeScript
export type SinricProSwitch = SinricProDevice & IPowerStateController;
```

### Capability Interface Pattern

Each capability exports both mixin function and interface:

```typescript
// Interface defines public API
export interface IPowerStateController {
  onPowerState(callback: PowerStateCallback): void;
  sendPowerStateEvent(state: boolean, cause?: string): Promise<boolean>;
}

// Mixin function adds capability to base class
export function PowerStateController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IPowerStateController {
    // Implementation...
  };
}
```

## Common Patterns

### Creating a Device

```typescript
import SinricPro from './core/SinricPro';
import { SinricProSwitch } from './devices/SinricProSwitch';

// 1. Create device instance
const mySwitch = SinricProSwitch('device-id-here');

// 2. Set up callbacks
mySwitch.onPowerState(async (deviceId: string, state: boolean) => {
  console.log(`Device ${deviceId} turned ${state ? 'ON' : 'OFF'}`);
  // Control hardware here
  return true; // Return true if successful
});

// 3. Add to SinricPro
SinricPro.add(mySwitch);

// 4. Initialize connection
await SinricPro.begin({
  appKey: 'your-app-key',
  appSecret: 'your-app-secret',
});
```

### Sending Events

```typescript
// Send event when device state changes locally
const success = await mySwitch.sendPowerStateEvent(true, 'PHYSICAL_INTERACTION');

// Events are rate-limited automatically
// Returns false if rate limit exceeded
```

### Multi-Capability Device

```typescript
const myLight = SinricProLight('light-id');

// Has multiple capabilities
myLight.onPowerState(async (deviceId, state) => { ... });
myLight.onBrightness(async (deviceId, brightness) => { ... });
myLight.onColor(async (deviceId, r, g, b) => { ... });
myLight.onColorTemperature(async (deviceId, temp) => { ... });

// Can send multiple event types
await myLight.sendPowerStateEvent(true);
await myLight.sendBrightnessEvent(75);
await myLight.sendColorEvent(255, 0, 0); // Red
```

## Build & Development

### Commands

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Lint code
npm run lint
npm run lint:fix

# Format code
npm run format

# Run examples
npm run example:switch
npm run example:light
npm run example:fan
npm run example:lock
npm run example:thermostat
npm run example:tv
```

### Build Configuration

**TypeScript (tsconfig.json)**
- Target: ES2020
- Module: CommonJS
- Strict mode enabled
- **Declaration: false** (required for mixin pattern)

**ESLint**
- TypeScript ESLint plugin
- Prettier integration
- Allows necessary `any` types with inline comments

**Prettier**
- Single quotes
- No semicolons
- 100 character line width
- 2 space indentation

## Known Issues & Workarounds

### 1. TypeScript Mixin Pattern Limitations

**Issue**: TypeScript requires `any[]` for constructor parameters in mixins
**Workaround**: Use `// eslint-disable-next-line @typescript-eslint/no-explicit-any`

```typescript
type Constructor<T = object> = new (...args: any[]) => T;
```

### 2. Abstract Class in Mixin Chain

**Issue**: Cannot pass abstract `SinricProDevice` to mixin without type error
**Workaround**: Cast to `any` at class definition, restore types in factory function

```typescript
class DeviceClass extends Capability(SinricProDevice as any) { }
export function Device(): SinricProDevice & ICapability {
  return new DeviceClass() as any;
}
```

### 3. Declaration File Generation

**Issue**: TS4094 errors when generating `.d.ts` files with mixins
**Workaround**: Disabled declaration generation in tsconfig.json

### 4. Record<string, any> for Dynamic Payloads

**Issue**: Message payloads have dynamic structure
**Workaround**: Use `Record<string, any>` with eslint-disable comments

## Testing

### Running Examples

All examples require credentials from SinricPro portal:

```typescript
const CONFIG = {
  appKey: 'YOUR-APP-KEY',      // From portal
  appSecret: 'YOUR-APP-SECRET', // From portal
  deviceId: 'YOUR-DEVICE-ID',   // From portal
};
```

Examples will connect to SinricPro cloud and:
- Listen for commands from Alexa/Google Home
- Simulate local device changes
- Send events back to cloud

### Example Output

```
============================================================
SinricPro Switch Example
============================================================

✓ Connected to SinricPro!
  You can now control the device via Alexa or Google Home

Waiting for commands from Alexa/Google Home...

[Callback] Device 123abc turned ON
    Source: Alexa/Google Home/SinricPro App

[Local Event] Button pressed - turning OFF
  ✓ Event sent to SinricPro server
```

## Future Improvements

### Potential Enhancements

1. **Declaration Files**
   - Investigate manual `.d.ts` file generation
   - Workaround for TS4094 mixin errors

2. **Testing**
   - Add Jest unit tests
   - Mock WebSocket for offline testing
   - Integration tests with SinricPro staging

3. **Additional Features**
   - UDP discovery support
   - Offline mode with local caching
   - Device groups/scenes
   - Custom device types

4. **Documentation**
   - API reference generator (TypeDoc)
   - More examples for each device type
   - Migration guide from other platforms

## Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

**Lint Errors**
```bash
# Auto-fix most issues
npm run lint:fix

# Format code
npm run format
```

**Connection Issues**
- Verify credentials from SinricPro portal
- Check internet connection
- Ensure device IDs match portal configuration

**Type Errors in Examples**
- Ensure callback parameters have explicit types
- Use intersection types from device exports

## Resources

- **SinricPro Portal**: https://portal.sinric.pro
- **Documentation**: See README.md, DEVICES.md, CAPABILITIES.md
- **Examples**: See examples/ directory
- **GitHub Issues**: Report bugs and request features

## Credits

Built with TypeScript mixin pattern for maximum code reuse and type safety.

Generated with Claude Code
