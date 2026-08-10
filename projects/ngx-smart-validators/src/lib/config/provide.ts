import {
  APP_INITIALIZER,
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import {
  configureSmartValidatorFeatureGate,
  FeatureGateService,
} from '../license/feature-gate.service';
import { LicenseService } from '../license/license.service';
import { DEFAULT_VALIDATION_MESSAGES } from '../messages/default-messages';
import { NGX_VALIDATION_MESSAGES } from '../messages/validation-messages';
import {
  SMART_VALIDATORS_CONFIG,
  SmartValidatorsConfig,
} from './tokens';

function initializeFeatureGate(): () => Promise<void> {
  const gate = inject(FeatureGateService);
  return () => gate.init();
}

/**
 * Configures messages and offline feature licensing at the application root.
 *
 * `extraFeatures` is an explicit test/development override and does not require
 * a license signature.
 */
export function provideSmartValidators(
  config: SmartValidatorsConfig = {},
): EnvironmentProviders {
  configureSmartValidatorFeatureGate(config);
  return makeEnvironmentProviders([
    { provide: SMART_VALIDATORS_CONFIG, useValue: config },
    {
      provide: NGX_VALIDATION_MESSAGES,
      useValue: Object.freeze({
        ...DEFAULT_VALIDATION_MESSAGES,
        ...config.messages,
      }),
    },
    LicenseService,
    FeatureGateService,
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: initializeFeatureGate,
    },
  ]);
}
