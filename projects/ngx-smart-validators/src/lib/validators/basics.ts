import { AbstractControl, ValidatorFn } from '@angular/forms';
import { isEmpty, validatorError } from './utils';

const NUMBER_PATTERN = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/;
const INTEGER_PATTERN = /^[+-]?\d+$/;

function numericValue(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string' && NUMBER_PATTERN.test(value)) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function requiredTrimmed(): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value;
    const invalid = isEmpty(value) || (typeof value === 'string' && value.trim().length === 0);
    return invalid
      ? validatorError('requiredTrimmed', value, { allowWhitespaceOnly: false })
      : null;
  };
}

export function range(min: number, max: number): ValidatorFn {
  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    const actual = numericValue(control.value);
    return actual !== null && actual >= min && actual <= max
      ? null
      : validatorError('range', control.value, { min, max });
  };
}

export function number(): ValidatorFn {
  return (control: AbstractControl) =>
    isEmpty(control.value) || numericValue(control.value) !== null
      ? null
      : validatorError('number', control.value, { finite: true });
}

export function integer(): ValidatorFn {
  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    const valid =
      (typeof control.value === 'number' &&
        Number.isFinite(control.value) &&
        Number.isInteger(control.value)) ||
      (typeof control.value === 'string' && INTEGER_PATTERN.test(control.value));
    return valid ? null : validatorError('integer', control.value);
  };
}

export function decimal(decimalPlaces?: number): ValidatorFn {
  if (decimalPlaces !== undefined && (!Number.isInteger(decimalPlaces) || decimalPlaces < 0)) {
    throw new RangeError('decimalPlaces must be a non-negative integer');
  }

  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    const value = control.value;
    const validNumber = numericValue(value) !== null;
    const text = String(value);
    const fractionLength = text.includes('.') ? (text.split('.')[1]?.length ?? 0) : 0;
    const valid =
      validNumber &&
      (decimalPlaces === undefined ? text.includes('.') : fractionLength <= decimalPlaces);
    return valid
      ? null
      : validatorError('decimal', value, { decimalPlaces: decimalPlaces ?? 'any' });
  };
}

export function greaterThan(minExclusive: number): ValidatorFn {
  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    const actual = numericValue(control.value);
    return actual !== null && actual > minExclusive
      ? null
      : validatorError('greaterThan', control.value, { minExclusive });
  };
}

export function lessThan(maxExclusive: number): ValidatorFn {
  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    const actual = numericValue(control.value);
    return actual !== null && actual < maxExclusive
      ? null
      : validatorError('lessThan', control.value, { maxExclusive });
  };
}

export function alpha(): ValidatorFn {
  return (control: AbstractControl) =>
    isEmpty(control.value) || (typeof control.value === 'string' && /^\p{L}+$/u.test(control.value))
      ? null
      : validatorError('alpha', control.value, { unicode: true });
}

export function alphanumeric(): ValidatorFn {
  return (control: AbstractControl) =>
    isEmpty(control.value) ||
    (typeof control.value === 'string' && /^[\p{L}\p{N}]+$/u.test(control.value))
      ? null
      : validatorError('alphanumeric', control.value, { unicode: true });
}

export function noWhitespace(): ValidatorFn {
  return (control: AbstractControl) =>
    isEmpty(control.value) ||
    (typeof control.value === 'string' && !/\s/u.test(control.value))
      ? null
      : validatorError('noWhitespace', control.value);
}
