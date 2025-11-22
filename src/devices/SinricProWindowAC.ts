/**
 * SinricProWindowAC - Window air conditioner device
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { PowerStateController, IPowerStateController } from '../capabilities/PowerStateController';
import { ThermostatController, IThermostatController } from '../capabilities/ThermostatController';
import { TemperatureSensor, ITemperatureSensor } from '../capabilities/TemperatureSensor';
import { RangeController, IRangeController } from '../capabilities/RangeController';
import { SettingController, ISettingController } from '../capabilities/SettingController';
import { PushNotification, IPushNotification } from '../capabilities/PushNotification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProWindowACClass extends SettingController(
  PushNotification(
    RangeController(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      TemperatureSensor(ThermostatController(PowerStateController(SinricProDevice as any)))
    )
  )
) {
  constructor(deviceId: string) {
    super(deviceId, 'AC_UNIT');
  }
}

/**
 * Create a SinricProWindowAC device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProWindowAC instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProWindowAC(
  deviceId: string
): SinricProDevice &
  IPowerStateController &
  IThermostatController &
  ITemperatureSensor &
  IRangeController &
  IPushNotification &
  ISettingController {
  return new SinricProWindowACClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProWindowAC = SinricProDevice &
  IPowerStateController &
  IThermostatController &
  ITemperatureSensor &
  IRangeController &
  IPushNotification &
  ISettingController;
