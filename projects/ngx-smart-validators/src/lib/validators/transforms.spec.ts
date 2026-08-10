import { FormControl } from '@angular/forms';
import {
  float,
  int,
  lowercase,
  normalizeFloat,
  normalizeInt,
  normalizeLowercase,
  normalizeUcFirst,
  normalizeUppercase,
  oneOf,
  ucfirst,
  uppercase,
} from './transforms';

describe('transform validators', () => {
  it('validates and normalizes letter case', () => {
    expect(lowercase()(new FormControl('hello'))).toBeNull();
    expect(lowercase()(new FormControl('Hello'))?.['lowercase']).toBeDefined();
    expect(uppercase()(new FormControl('HELLO'))).toBeNull();
    expect(uppercase()(new FormControl('Hello'))?.['uppercase']).toBeDefined();
    expect(ucfirst()(new FormControl('Hello'))).toBeNull();
    expect(ucfirst()(new FormControl('hello'))?.['ucfirst']).toBeDefined();

    expect(normalizeLowercase('HeLLo')).toBe('hello');
    expect(normalizeUppercase('HeLLo')).toBe('HELLO');
    expect(normalizeUcFirst('hello')).toBe('Hello');
    expect(normalizeUcFirst('hELLO')).toBe('HELLO');
  });

  it('validates integers and floats with correction helpers', () => {
    expect(int()(new FormControl(52))).toBeNull();
    expect(int()(new FormControl('52'))).toBeNull();
    expect(int()(new FormControl(52.7))?.['int']).toBeDefined();
    expect(int()(new FormControl('52.7'))?.['int']).toBeDefined();

    expect(float()(new FormControl('52.123'))).toBeNull();
    expect(float()(new FormControl(52))).toBeNull();
    expect(float()(new FormControl('52.'))).toBeNull();
    expect(float()(new FormControl('52a'))?.['float']).toBeDefined();

    expect(normalizeInt('52.7')).toBe('52');
    expect(normalizeInt(52.7)).toBe(52);
    expect(normalizeInt('-12x3')).toBe('-123');
    expect(normalizeFloat('52.12.3')).toBe('52.123');
    expect(normalizeFloat('12a.3b')).toBe('12.3');
  });

  it('limits values to an offered enum list', () => {
    const validator = oneOf(['draft', 'published', 'archived']);
    expect(validator(new FormControl('published'))).toBeNull();
    expect(validator(new FormControl('deleted'))?.['oneOf'].constraints.values).toEqual([
      'draft',
      'published',
      'archived',
    ]);
    expect(validator(new FormControl(''))).toBeNull();
  });

  it('rejects an empty enum list', () => {
    expect(() => oneOf([])).toThrowError(/non-empty/);
  });
});
