import { Injectable, inject } from '@angular/core';
import { FREE_FEATURES, SmartValidatorFeatureId } from '../config/features';
import {
  SMART_VALIDATORS_CONFIG,
  SmartValidatorsConfig,
} from '../config/tokens';
import { LicenseService } from './license.service';

let resolvedFeatures: ReadonlySet<SmartValidatorFeatureId> = new Set(FREE_FEATURES);

function featuresWithOverrides(
  extraFeatures: readonly SmartValidatorFeatureId[] = [],
): Set<SmartValidatorFeatureId> {
  return new Set([...FREE_FEATURES, ...extraFeatures]);
}

/**
 * Updates the process-wide gate synchronously. `provideSmartValidators` calls
 * this before Angular creates validators, including during SSR.
 */
export function configureSmartValidatorFeatureGate(
  config: SmartValidatorsConfig,
): void {
  resolvedFeatures = featuresWithOverrides(config.extraFeatures);
}

/** Safe for plain ValidatorFn factories that cannot use Angular injection. */
export function isSmartValidatorFeatureEnabled(
  feature: SmartValidatorFeatureId,
): boolean {
  return resolvedFeatures.has(feature);
}

export function getResolvedSmartValidatorFeatures(): ReadonlySet<SmartValidatorFeatureId> {
  return resolvedFeatures;
}

/** Test seam that prevents module state leaking between Jasmine specs. */
export function resetSmartValidatorFeatureGateForTesting(): void {
  resolvedFeatures = new Set(FREE_FEATURES);
}

@Injectable()
export class FeatureGateService {
  private readonly config = inject(SMART_VALIDATORS_CONFIG);
  private readonly license = inject(LicenseService);
  private pending: Promise<void> | null = null;

  init(): Promise<void> {
    this.pending ??= this.resolveFeatures();
    return this.pending;
  }

  isEnabled(feature: SmartValidatorFeatureId): boolean {
    return isSmartValidatorFeatureEnabled(feature);
  }

  features(): ReadonlySet<SmartValidatorFeatureId> {
    return getResolvedSmartValidatorFeatures();
  }

  private async resolveFeatures(): Promise<void> {
    await this.license.verify();
    const enabled = featuresWithOverrides(this.config.extraFeatures);
    for (const feature of this.license.getLicensedFeatures()) {
      enabled.add(feature);
    }
    resolvedFeatures = enabled;
  }
}
