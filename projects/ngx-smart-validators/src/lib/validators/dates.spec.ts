import { FormControl } from '@angular/forms';
import { futureDate, maxDate, minDate, pastDate, validDate } from './dates';

describe('date validators', () => {
  it('accepts deterministic ISO dates and rejects ambiguous or normalized dates', () => {
    expect(validDate()(new FormControl('2024-02-29'))).toBeNull();
    expect(validDate()(new FormControl('2024-02-30'))?.['validDate']).toBeDefined();
    expect(validDate()(new FormControl('02/03/2024'))?.['validDate']).toBeDefined();
    expect(validDate()(new FormControl('2024-01-01T12:00:00Z'))).toBeNull();
  });

  it('validates inclusive date boundaries', () => {
    expect(minDate('2024-01-01')(new FormControl('2024-01-01'))).toBeNull();
    expect(minDate('2024-01-01')(new FormControl('2023-12-31'))?.['minDate']).toBeDefined();
    expect(maxDate('2024-12-31')(new FormControl('2025-01-01'))?.['maxDate']).toBeDefined();
  });

  it('validates strict past and future dates against a supplied reference', () => {
    const reference = '2024-06-01';
    expect(pastDate(reference)(new FormControl('2024-05-31'))).toBeNull();
    expect(pastDate(reference)(new FormControl(reference))?.['pastDate']).toBeDefined();
    expect(futureDate(reference)(new FormControl('2024-06-02'))).toBeNull();
    expect(futureDate(reference)(new FormControl(reference))?.['futureDate']).toBeDefined();
  });
});
