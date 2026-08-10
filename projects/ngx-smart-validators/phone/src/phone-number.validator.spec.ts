import { FormControl } from '@angular/forms';
import {
  configureSmartValidatorFeatureGate,
  resetSmartValidatorFeatureGateForTesting,
} from '../../src/lib/license/feature-gate.service';
import { phoneNumber } from './phone-number.validator';

describe('phoneNumber', () => {
  afterEach(resetSmartValidatorFeatureGateForTesting);

  it('validates a real international number when licensed', () => {
    configureSmartValidatorFeatureGate({ extraFeatures: ['phoneAdvanced'] });
    const validator = phoneNumber('US');

    expect(validator(new FormControl('+1 202-555-0123'))).toBeNull();
    expect(validator(new FormControl('not-a-phone'))?.['phoneNumber']).toBeTruthy();
  });

  it('degrades gracefully when the Pro feature is locked', () => {
    expect(phoneNumber('US')(new FormControl('not-a-phone'))).toBeNull();
  });
});
