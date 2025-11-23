/**
 * SinricProThermostat - Smart thermostat device
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { PowerStateController, IPowerStateController } from '../capabilities/PowerStateController';
import { TemperatureSensor, ITemperatureSensor } from '../capabilities/TemperatureSensor';
import { ThermostatController, IThermostatController } from '../capabilities/ThermostatController';
import { SettingController, ISettingController } from '../capabilities/SettingController';
import { PushNotification, IPushNotification } from '../capabilities/PushNotification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProThermostatClass extends SettingController(
  PushNotification(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TemperatureSensor(ThermostatController(PowerStateController(SinricProDevice as any)))
  )
) {
  constructor(deviceId: string) {
    super(deviceId, 'THERMOSTAT');
  }
}

/**
 * Create a SinricProThermostat device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProThermostat instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProThermostat(
  deviceId: string
): SinricProDevice &
  IPowerStateController &
  IThermostatController &
  ITemperatureSensor &
  IPushNotification &
  ISettingController {
  return new SinricProThermostatClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProThermostat = SinricProDevice &
  IPowerStateController &
  IThermostatController &
  ITemperatureSensor &
  IPushNotification &
  ISettingController;
