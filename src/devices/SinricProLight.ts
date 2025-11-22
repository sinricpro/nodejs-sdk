/**
 * SinricProLight - Smart light with full color and brightness control
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { PowerStateController, IPowerStateController } from '../capabilities/PowerStateController';
import { BrightnessController, IBrightnessController } from '../capabilities/BrightnessController';
import { ColorController, IColorController } from '../capabilities/ColorController';
import {
  ColorTemperatureController,
  IColorTemperatureController,
} from '../capabilities/ColorTemperatureController';

// Apply mixins in order
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProLightClass extends ColorTemperatureController(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ColorController(BrightnessController(PowerStateController(SinricProDevice as any)))
) {
  constructor(deviceId: string) {
    super(deviceId, 'LIGHT');
  }
}

/**
 * Create a SinricProLight device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProLight instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProLight(
  deviceId: string
): SinricProDevice &
  IPowerStateController &
  IBrightnessController &
  IColorController &
  IColorTemperatureController {
  return new SinricProLightClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProLight = SinricProDevice &
  IPowerStateController &
  IBrightnessController &
  IColorController &
  IColorTemperatureController;
