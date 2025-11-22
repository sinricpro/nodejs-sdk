/**
 * SinricProSwitch - Basic on/off switch device
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { PowerStateController, IPowerStateController } from '../capabilities/PowerStateController';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SinricProSwitchClass extends PowerStateController(SinricProDevice as any) {
  constructor(deviceId: string) {
    super(deviceId, 'SWITCH');
  }
}

/**
 * Create a SinricProSwitch device
 * @param deviceId - Device ID from SinricPro portal
 * @returns SinricProSwitch instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SinricProSwitch(deviceId: string): SinricProDevice & IPowerStateController {
  return new SinricProSwitchClass(deviceId) as any;
}

// Export type for TypeScript
export type SinricProSwitch = SinricProDevice & IPowerStateController;
