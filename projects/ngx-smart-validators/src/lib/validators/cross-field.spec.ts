import { FormControl, FormGroup } from '@angular/forms';
import {
  configureSmartValidatorFeatureGate,
  resetSmartValidatorFeatureGateForTesting,
} from '../license/feature-gate.service';
import { allOrNone, atLeastOne, dateRange, matchFields, requiredIf } from './cross-field';

describe('cross-field validators', () => {
  beforeEach(() =>
    configureSmartValidatorFeatureGate({ extraFeatures: ['crossField'] }),
  );
  afterEach(resetSmartValidatorFeatureGateForTesting);
  it('matches two fields', () => {
    const group = new FormGroup({
      password: new FormControl('secret'),
      confirmation: new FormControl('different'),
    });
    expect(matchFields('password', 'confirmation')(group)?.['matchFields']).toBeDefined();
    group.controls.confirmation.setValue('secret');
    expect(matchFields('password', 'confirmation')(group)).toBeNull();
  });

  it('validates ascending date ranges and skips incomplete ranges', () => {
    const group = new FormGroup({
      start: new FormControl('2024-02-02'),
      end: new FormControl('2024-02-01'),
    });
    expect(dateRange('start', 'end')(group)?.['dateRange']).toBeDefined();
    group.controls.end.setValue('');
    expect(dateRange('start', 'end')(group)).toBeNull();
  });

  it('requires a field when a dependent condition applies', () => {
    const group = new FormGroup({
      subscribed: new FormControl(true),
      email: new FormControl(''),
    });
    expect(requiredIf('email', 'subscribed', true)(group)?.['requiredIf']).toBeDefined();
    group.controls.email.setValue('person@example.com');
    expect(requiredIf('email', 'subscribed', true)(group)).toBeNull();
  });

  it('requires at least one field', () => {
    const group = new FormGroup({
      email: new FormControl(''),
      phone: new FormControl(''),
    });
    expect(atLeastOne(['email', 'phone'])(group)?.['atLeastOne']).toBeDefined();
    group.controls.phone.setValue('555');
    expect(atLeastOne(['email', 'phone'])(group)).toBeNull();
  });

  it('requires all fields together or none of them', () => {
    const group = new FormGroup({
      city: new FormControl('Paris'),
      postalCode: new FormControl(''),
    });
    expect(allOrNone('city', 'postalCode')(group)?.['allOrNone']).toBeDefined();
    group.controls.postalCode.setValue('75001');
    expect(allOrNone('city', 'postalCode')(group)).toBeNull();
  });
});
