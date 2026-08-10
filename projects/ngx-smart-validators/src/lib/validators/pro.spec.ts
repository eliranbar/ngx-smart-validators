import { FormControl } from '@angular/forms';
import {
  configureSmartValidatorFeatureGate,
  resetSmartValidatorFeatureGateForTesting,
} from '../license/feature-gate.service';
import { creditCard, iban, maxAge, minAge, password } from './pro';
import { withMessage } from './utils';

describe('pro algorithm validators', () => {
  beforeEach(() =>
    configureSmartValidatorFeatureGate({
      extraFeatures: ['passwordEngine', 'financial', 'ageValidation'],
    }),
  );
  afterEach(resetSmartValidatorFeatureGateForTesting);
  it('applies configurable password rules', () => {
    const validator = password({ minLength: 10 });
    expect(validator(new FormControl('Strong!123'))).toBeNull();
    expect(validator(new FormControl('weak'))?.['password'].constraints).toEqual(
      jasmine.objectContaining({ minLength: 10, uppercase: true, special: true }),
    );
  });

  it('checks card brand and Luhn checksum', () => {
    expect(creditCard()(new FormControl('4111 1111 1111 1111'))).toBeNull();
    const error = creditCard()(new FormControl('4111 1111 1111 1112'));
    expect(error?.['creditCard'].constraints).toEqual({
      algorithm: 'Luhn',
      brand: 'visa',
    });
  });

  it('checks IBAN country length and MOD-97 checksum', () => {
    expect(iban()(new FormControl('GB82 WEST 1234 5698 7654 32'))).toBeNull();
    expect(iban()(new FormControl('GB82 WEST 1234 5698 7654 33'))?.['iban']).toBeDefined();
  });

  it('calculates age at the exact UTC birthday boundary', () => {
    const reference = '2024-06-15';
    expect(minAge(18, reference)(new FormControl('2006-06-15'))).toBeNull();
    expect(minAge(18, reference)(new FormControl('2006-06-16'))?.['minAge']).toBeDefined();
    expect(maxAge(65, reference)(new FormControl('1959-06-15'))).toBeNull();
    expect(maxAge(65, reference)(new FormControl('1958-06-14'))?.['maxAge']).toBeDefined();
  });
});

describe('withMessage', () => {
  beforeEach(() =>
    configureSmartValidatorFeatureGate({ extraFeatures: ['passwordEngine'] }),
  );
  afterEach(resetSmartValidatorFeatureGateForTesting);
  it('adds a custom message while preserving structured details', () => {
    const error = withMessage(password(), 'Use a stronger password.')(
      new FormControl('weak'),
    );
    expect(error?.['password'].message).toBe('Use a stronger password.');
    expect(error?.['password'].actual).toBe('weak');
    expect(error?.['password'].constraints.minLength).toBe(8);
  });
});
