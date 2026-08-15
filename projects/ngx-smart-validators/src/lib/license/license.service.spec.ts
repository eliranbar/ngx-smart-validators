import { TestBed } from '@angular/core/testing';
import { SMART_VALIDATOR_FEATURES } from '../config/features';
import { provideSmartValidators } from '../config/provide';
import { SMART_VALIDATORS_CONFIG } from '../config/tokens';
import {
  getResolvedSmartValidatorFeatures,
  isSmartValidatorFeatureEnabled,
  resetSmartValidatorFeatureGateForTesting,
} from './feature-gate.service';
import {
  LicenseService,
  SmartValidatorsLicensePayload,
  validateSmartValidatorsLicenseClaims,
} from './license.service';
import { SMART_VALIDATORS_PRODUCT_ID } from './public-key';

function payload(
  overrides: Partial<SmartValidatorsLicensePayload> = {},
): SmartValidatorsLicensePayload {
  return {
    // The constant, not a literal: a hardcoded copy silently turns every claim
    // assertion below into a `product-mismatch` the day the npm name changes.
    product: SMART_VALIDATORS_PRODUCT_ID,
    kid: 'sv-2026-08',
    plan: 'pro',
    features: [],
    expiry: '2099-01-01',
    licensee: 'Jasmine',
    domains: ['example.com', '*.example.com'],
    ...overrides,
  };
}

describe('ngx-smart-validators licensing', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    resetSmartValidatorFeatureGateForTesting();
  });

  it('falls back to free features when no key is configured', async () => {
    TestBed.configureTestingModule({
      providers: [
        LicenseService,
        { provide: SMART_VALIDATORS_CONFIG, useValue: {} },
      ],
    });

    const state = await TestBed.inject(LicenseService).verify();

    expect(state.valid).toBeFalse();
    expect(state.reason).toBe('missing-key');
    expect(
      isSmartValidatorFeatureEnabled(
        SMART_VALIDATOR_FEATURES.ageValidation,
      ),
    ).toBeFalse();
    expect(
      isSmartValidatorFeatureEnabled(SMART_VALIDATOR_FEATURES.financial),
    ).toBeFalse();
  });

  it('makes extraFeatures immediately visible to plain validator functions', () => {
    provideSmartValidators({
      extraFeatures: [SMART_VALIDATOR_FEATURES.phoneAdvanced],
    });

    expect(
      getResolvedSmartValidatorFeatures().has(
        SMART_VALIDATOR_FEATURES.phoneAdvanced,
      ),
    ).toBeTrue();
  });

  it('gracefully rejects a malformed base64 envelope', async () => {
    spyOn(console, 'warn');
    TestBed.configureTestingModule({
      providers: [
        LicenseService,
        {
          provide: SMART_VALIDATORS_CONFIG,
          useValue: { licenseKey: 'not-a-license' },
        },
      ],
    });

    const state = await TestBed.inject(LicenseService).verify();

    expect(state.reason).toBe('parse-error');
    expect(console.warn).toHaveBeenCalled();
  });

  it('checks product identity', () => {
    expect(
      validateSmartValidatorsLicenseClaims(
        payload({ product: 'another-product' }),
        'example.com',
      ),
    ).toBe('product-mismatch');
  });

  it('honors the full expiry day with a 24-hour grace window', () => {
    const expiring = payload({ expiry: '2026-08-09' });

    expect(
      validateSmartValidatorsLicenseClaims(
        expiring,
        'example.com',
        Date.parse('2026-08-09T23:59:59Z'),
      ),
    ).toBeNull();
    expect(
      validateSmartValidatorsLicenseClaims(
        expiring,
        'example.com',
        Date.parse('2026-08-10T00:00:01Z'),
      ),
    ).toBe('expired');
  });

  it('supports apex wildcards, rejects suffix collisions, and allows dev hosts', () => {
    const licensed = payload({ domains: ['*.example.com'] });

    expect(
      validateSmartValidatorsLicenseClaims(licensed, 'example.com'),
    ).toBeNull();
    expect(
      validateSmartValidatorsLicenseClaims(licensed, 'app.example.com'),
    ).toBeNull();
    expect(
      validateSmartValidatorsLicenseClaims(licensed, 'notexample.com'),
    ).toBe('domain-mismatch');
    expect(
      validateSmartValidatorsLicenseClaims(licensed, 'app.localhost'),
    ).toBeNull();
  });
});
