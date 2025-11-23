/**
 * ThermostatController - Adds thermostat control capability
 */

import { SinricProDevice } from '../core/SinricProDevice';
import { EventLimiter } from '../core/EventLimiter';
import type { SinricProRequest } from '../core/types';
import { EVENT_LIMIT_STATE, PHYSICAL_INTERACTION } from '../core/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export type ThermostatMode = 'AUTO' | 'COOL' | 'HEAT' | 'ECO' | 'OFF';

export interface TemperatureSetpoint {
  value: number;
  scale: 'CELSIUS' | 'FAHRENHEIT';
}

export type ThermostatModeCallback = (
  deviceId: string,
  mode: ThermostatMode
) => Promise<boolean> | boolean;

export type TargetTemperatureCallback = (
  deviceId: string,
  temperature: number
) => Promise<boolean> | boolean;

export type AdjustTargetTemperatureCallback = (
  deviceId: string,
  temperatureDelta: number
) => Promise<boolean> | boolean;

export interface IThermostatController {
  onThermostatMode(callback: ThermostatModeCallback): void;
  onTargetTemperature(callback: TargetTemperatureCallback): void;
  onAdjustTargetTemperature(callback: AdjustTargetTemperatureCallback): void;
  sendThermostatModeEvent(mode: ThermostatMode, cause?: string): Promise<boolean>;
  sendTargetTemperatureEvent(temperature: TemperatureSetpoint, cause?: string): Promise<boolean>;
}

export function ThermostatController<T extends Constructor<SinricProDevice>>(Base: T) {
  return class extends Base implements IThermostatController {
    private thermostatModeCallback: ThermostatModeCallback | null = null;
    private targetTemperatureCallback: TargetTemperatureCallback | null = null;
    private adjustTargetTemperatureCallback: AdjustTargetTemperatureCallback | null = null;
    private thermostatEventLimiter = new EventLimiter(EVENT_LIMIT_STATE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.registerRequestHandler(this.handleThermostatRequest.bind(this));
    }

    onThermostatMode(callback: ThermostatModeCallback): void {
      this.thermostatModeCallback = callback;
    }

    onTargetTemperature(callback: TargetTemperatureCallback): void {
      this.targetTemperatureCallback = callback;
    }

    onAdjustTargetTemperature(callback: AdjustTargetTemperatureCallback): void {
      this.adjustTargetTemperatureCallback = callback;
    }

    async sendThermostatModeEvent(
      mode: ThermostatMode,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.thermostatEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('setThermostatMode', { thermostatMode: mode }, cause);
    }

    async sendTargetTemperatureEvent(
      temperature: TemperatureSetpoint,
      cause: string = PHYSICAL_INTERACTION
    ): Promise<boolean> {
      if (this.thermostatEventLimiter.isLimited()) {
        return false;
      }

      return this.sendEvent('targetTemperature', { temperature }, cause);
    }

    private async handleThermostatRequest(request: SinricProRequest): Promise<boolean> {
      if (request.action === 'setThermostatMode' && this.thermostatModeCallback) {
        const mode = request.requestValue.thermostatMode;
        const success = await this.thermostatModeCallback(this.getDeviceId(), mode);

        if (success) {
          request.responseValue.thermostatMode = mode;
        }

        return success;
      }

      if (request.action === 'targetTemperature' && this.targetTemperatureCallback) {
        const temperature = request.requestValue.temperature;
        const success = await this.targetTemperatureCallback(this.getDeviceId(), temperature);

        if (success) {
          request.responseValue.temperature = temperature;
        }

        return success;
      }

      if (request.action === 'adjustTargetTemperature' && this.adjustTargetTemperatureCallback) {
        const temperatureDelta = request.requestValue.temperature.value;
        const success = await this.adjustTargetTemperatureCallback(
          this.getDeviceId(),
          temperatureDelta
        );

        if (success) {
          request.responseValue.temperature = request.requestValue.temperature;
        }

        return success;
      }

      return false;
    }
  };
}
