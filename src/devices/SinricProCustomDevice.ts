/**
 * SinricProCustomDevice - Flexible device with multiple capabilities
 *
 * A custom device type that supports many SinricPro capabilities, allowing you to
 * build devices with any combination of features you need.
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { PowerStateController, IPowerStateController } from '../capabilities/PowerStateController';
import { BrightnessController, IBrightnessController } from '../capabilities/BrightnessController';
import { ColorController, IColorController } from '../capabilities/ColorController';
import {
  ColorTemperatureController,
  IColorTemperatureController,
} from '../capabilities/ColorTemperatureController';
import { RangeController, IRangeController } from '../capabilities/RangeController';
import { ModeController, IModeController } from '../capabilities/ModeController';
import { LockController, ILockController } from '../capabilities/LockController';
import { ThermostatController, IThermostatController } from '../capabilities/ThermostatController';
import { TemperatureSensor, ITemperatureSensor } from '../capabilities/TemperatureSensor';
import { SettingController, ISettingController } from '../capabilities/SettingController';
import { PushNotification, IPushNotification } from '../capabilities/PushNotification';
import { PercentageController, IPercentageController } from '../capabilities/PercentageController';
import { PowerLevelController, IPowerLevelController } from '../capabilities/PowerLevelController';

// Apply mixins in order - combining many capabilities
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProCustomDeviceClass extends SettingController(
  PushNotification(
    TemperatureSensor(
      ThermostatController(
        LockController(
          ModeController(
            RangeController(
              PercentageController(
                PowerLevelController(
                  ColorTemperatureController(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ColorController(
                      BrightnessController(PowerStateController(SinricProDevice as any))
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  )
) {
  constructor(deviceId: string, productType: string = 'CUSTOM_DEVICE') {
    super(deviceId, productType);
  }
}

/**
 * Create a SinricProCustomDevice
 *
 * A flexible device that supports many capabilities. Register callbacks only for
 * the capabilities you need.
 *
 * @param deviceId - Device ID from SinricPro portal
 * @param productType - Optional product type (default: 'CUSTOM_DEVICE')
 * @returns SinricProCustomDevice instance
 *
 * @example
 * ```typescript
 * const device = SinricProCustomDevice('device-id');
 *
 * // Register only the callbacks you need
 * device.onPowerState(async (deviceId, state) => {
 *   console.log(`Power: ${state}`);
 *   return true;
 * });
 *
 * device.onBrightness(async (deviceId, brightness) => {
 *   console.log(`Brightness: ${brightness}`);
 *   return true;
 * });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProCustomDevice(
  deviceId: string,
  productType: string = 'CUSTOM_DEVICE'
): SinricProDevice &
  IPowerStateController &
  IBrightnessController &
  IColorController &
  IColorTemperatureController &
  IPowerLevelController &
  IPercentageController &
  IRangeController &
  IModeController &
  ILockController &
  IThermostatController &
  ITemperatureSensor &
  ISettingController &
  IPushNotification {
  return new SinricProCustomDeviceClass(deviceId, productType) as any;
}

// Export type for TypeScript
export type SinricProCustomDevice = SinricProDevice &
  IPowerStateController &
  IBrightnessController &
  IColorController &
  IColorTemperatureController &
  IPowerLevelController &
  IPercentageController &
  IRangeController &
  IModeController &
  ILockController &
  IThermostatController &
  ITemperatureSensor &
  ISettingController &
  IPushNotification;
