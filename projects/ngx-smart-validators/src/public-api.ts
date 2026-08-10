/*
 * Public API Surface of ngx-smart-validators
 */

export * from './lib/validators';
export * from './lib/directives';
export * from './lib/messages';
export * from './lib/config/features';
export * from './lib/config/tokens';
export * from './lib/config/provide';
export {
  FeatureGateService,
  getResolvedSmartValidatorFeatures,
  isSmartValidatorFeatureEnabled,
} from './lib/license/feature-gate.service';
export {
  LicenseService,
  type LicenseFailureReason,
  type SmartValidatorsLicensePayload,
  type LicenseState,
} from './lib/license/license.service';
