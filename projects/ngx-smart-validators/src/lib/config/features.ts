/** Stable feature identifiers used by validators and license payloads. */
export const SMART_VALIDATOR_FEATURES = {
  passwordEngine: 'passwordEngine',
  financial: 'financial',
  ageValidation: 'ageValidation',
  crossField: 'crossField',
  phoneAdvanced: 'phoneAdvanced',
} as const;

export type SmartValidatorFeatureId =
  (typeof SMART_VALIDATOR_FEATURES)[keyof typeof SMART_VALIDATOR_FEATURES];

export const FREE_FEATURES: readonly SmartValidatorFeatureId[] = [];

export const PRO_FEATURES: readonly SmartValidatorFeatureId[] = [
  SMART_VALIDATOR_FEATURES.passwordEngine,
  SMART_VALIDATOR_FEATURES.financial,
  SMART_VALIDATOR_FEATURES.ageValidation,
  SMART_VALIDATOR_FEATURES.crossField,
  SMART_VALIDATOR_FEATURES.phoneAdvanced,
];

export const ALL_FEATURES: readonly SmartValidatorFeatureId[] = [
  ...FREE_FEATURES,
  ...PRO_FEATURES,
];
