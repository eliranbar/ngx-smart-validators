import { FormControl, FormGroup } from '@angular/forms';
import {
  configureSmartValidatorFeatureGate,
  resetSmartValidatorFeatureGateForTesting,
} from '../license/feature-gate.service';
import { allOrNone, atLeastOne, dateRange, matchFields, requiredIf } from './cross-field';
import { creditCard, iban, maxAge, minAge, password } from './pro';

describe('Pro and group validators', () => {
  beforeEach(resetSmartValidatorFeatureGateForTesting);
  afterEach(resetSmartValidatorFeatureGateForTesting);

  it('keeps matchFields free', () => {
    const group = new FormGroup({
      first: new FormControl('one'),
      second: new FormControl('two'),
    });
    expect(matchFields('first', 'second')(group)?.['matchFields']).toBeTruthy();
  });

  it('keeps Pro validators inert until their feature is enabled', () => {
    expect(password()(new FormControl('weak'))).toBeNull();
    expect(creditCard()(new FormControl('bad'))).toBeNull();
    expect(minAge(18, '2026-08-09')(new FormControl('2020-01-01'))).toBeNull();
  });

  it('reports individual password rule failures', () => {
    configureSmartValidatorFeatureGate({ extraFeatures: ['passwordEngine'] });
    const error = password({ minLength: 10 })(new FormControl('weak'));

    expect(error?.['password'].constraints.failedRules).toContain('minLength');
    expect(error?.['password'].constraints.failedRules).toContain('uppercase');
    expect(error?.['password'].constraints.failedRules).toContain('number');
    expect(error?.['password'].constraints.failedRules).toContain('special');
  });

  it('validates financial identifiers', () => {
    configureSmartValidatorFeatureGate({ extraFeatures: ['financial'] });

    expect(creditCard()(new FormControl('4111 1111 1111 1111'))).toBeNull();
    expect(creditCard()(new FormControl('4111 1111 1111 1112'))?.['creditCard']).toBeTruthy();
    expect(iban()(new FormControl('GB82 WEST 1234 5698 7654 32'))).toBeNull();
  });

  it('validates ages against a deterministic reference date', () => {
    configureSmartValidatorFeatureGate({ extraFeatures: ['ageValidation'] });

    expect(minAge(18, '2026-08-09')(new FormControl('2000-01-01'))).toBeNull();
    expect(minAge(18, '2026-08-09')(new FormControl('2010-01-01'))?.['minAge']).toBeTruthy();
    expect(maxAge(65, '2026-08-09')(new FormControl('1950-01-01'))?.['maxAge']).toBeTruthy();
  });

  it('validates advanced cross-field relationships', () => {
    configureSmartValidatorFeatureGate({ extraFeatures: ['crossField'] });
    const group = new FormGroup({
      start: new FormControl('2026-08-10'),
      end: new FormControl('2026-08-09'),
      enabled: new FormControl(true),
      detail: new FormControl(''),
      one: new FormControl(''),
      two: new FormControl('value'),
    });

    expect(dateRange('start', 'end')(group)?.['dateRange']).toBeTruthy();
    expect(requiredIf('detail', 'enabled', true)(group)?.['requiredIf']).toBeTruthy();
    expect(atLeastOne(['one', 'two'])(group)).toBeNull();
    expect(allOrNone(['one', 'two'])(group)?.['allOrNone']).toBeTruthy();
  });
});
