import { InjectionToken } from '@angular/core';
import { SmartValidatorFeatureId } from './features';

export type SmartValidatorMessages = Readonly<Record<string, string>>;

export interface SmartValidatorsConfig {
  /** Offline signed license key unlocking pro validators. */
  readonly licenseKey?: string;
  /** Explicit feature grants, intended for tests and controlled development. */
  readonly extraFeatures?: readonly SmartValidatorFeatureId[];
  /** Consumer-provided validation messages keyed by validator error name. */
  readonly messages?: SmartValidatorMessages;
}

export const SMART_VALIDATORS_CONFIG =
  new InjectionToken<SmartValidatorsConfig>('SMART_VALIDATORS_CONFIG', {
    providedIn: 'root',
    factory: () => ({}),
  });
