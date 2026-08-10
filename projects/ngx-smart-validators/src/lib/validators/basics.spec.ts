import { FormControl } from '@angular/forms';
import {
  alpha,
  alphanumeric,
  decimal,
  greaterThan,
  integer,
  lessThan,
  noWhitespace,
  number,
  range,
  requiredTrimmed,
} from './basics';

describe('basic validators', () => {
  it('rejects missing and whitespace-only required values', () => {
    expect(requiredTrimmed()(new FormControl('   '))?.['requiredTrimmed']).toBeDefined();
    expect(requiredTrimmed()(new FormControl(' value '))).toBeNull();
  });

  it('validates numeric values and boundaries', () => {
    expect(number()(new FormControl('12.5'))).toBeNull();
    expect(number()(new FormControl('12x'))?.['number']).toBeDefined();
    expect(integer()(new FormControl('-12'))).toBeNull();
    expect(integer()(new FormControl(2.5))?.['integer']).toBeDefined();
    expect(decimal(2)(new FormControl('2.25'))).toBeNull();
    expect(decimal(2)(new FormControl('2.255'))?.['decimal']).toBeDefined();
    expect(range(1, 3)(new FormControl(3))).toBeNull();
    expect(range(1, 3)(new FormControl(4))?.['range'].constraints).toEqual({ min: 1, max: 3 });
    expect(greaterThan(3)(new FormControl(4))).toBeNull();
    expect(lessThan(3)(new FormControl(3))?.['lessThan']).toBeDefined();
  });

  it('validates Unicode text and whitespace', () => {
    expect(alpha()(new FormControl('Élan'))).toBeNull();
    expect(alpha()(new FormControl('abc1'))?.['alpha']).toBeDefined();
    expect(alphanumeric()(new FormControl('東京42'))).toBeNull();
    expect(noWhitespace()(new FormControl('two words'))?.['noWhitespace']).toBeDefined();
  });

  it('lets optional validators skip empty values', () => {
    expect(number()(new FormControl(''))).toBeNull();
    expect(alpha()(new FormControl(null))).toBeNull();
  });
});
