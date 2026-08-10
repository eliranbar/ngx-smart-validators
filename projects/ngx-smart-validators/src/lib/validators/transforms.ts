import { AbstractControl, ValidatorFn } from '@angular/forms';
import { isEmpty, validatorError } from './utils';

const INTEGER_PATTERN = /^[+-]?\d+$/;
const FLOAT_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

/**
 * Normalizes a string to lowercase. Used by the `lowercase` validator directive
 * for automatic correction.
 */
export function normalizeLowercase(value: string): string {
  return value.toLocaleLowerCase();
}

/**
 * Normalizes a string to uppercase. Used by the `uppercase` validator directive
 * for automatic correction.
 */
export function normalizeUppercase(value: string): string {
  return value.toLocaleUpperCase();
}

/**
 * Capitalizes the first character, leaving the rest unchanged.
 */
export function normalizeUcFirst(value: string): string {
  if (value.length === 0) {
    return value;
  }
  return value.charAt(0).toLocaleUpperCase() + value.slice(1);
}

/**
 * Strips non-integer characters and truncates any fractional part.
 * Preserves an optional leading sign while the user is typing.
 */
export function normalizeInt(value: string | number): string | number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.trunc(value) : value;
  }

  let result = '';
  let index = 0;
  if (value[0] === '+' || value[0] === '-') {
    result += value[0];
    index = 1;
  }
  for (; index < value.length; index++) {
    const char = value[index];
    if (char >= '0' && char <= '9') {
      result += char;
    } else if (char === '.') {
      break;
    }
  }
  return result;
}

/**
 * Keeps an optional sign, digits, and at most one decimal point.
 */
export function normalizeFloat(value: string | number): string | number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : value;
  }

  let result = '';
  let seenDot = false;
  let index = 0;
  if (value[0] === '+' || value[0] === '-') {
    result += value[0];
    index = 1;
  }
  for (; index < value.length; index++) {
    const char = value[index];
    if (char >= '0' && char <= '9') {
      result += char;
    } else if (char === '.' && !seenDot) {
      result += char;
      seenDot = true;
    }
  }
  return result;
}

export function lowercase(): ValidatorFn {
  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    const value = control.value;
    return typeof value === 'string' && value === normalizeLowercase(value)
      ? null
      : validatorError('lowercase', value);
  };
}

export function uppercase(): ValidatorFn {
  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    const value = control.value;
    return typeof value === 'string' && value === normalizeUppercase(value)
      ? null
      : validatorError('uppercase', value);
  };
}

export function ucfirst(): ValidatorFn {
  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    const value = control.value;
    return typeof value === 'string' && value === normalizeUcFirst(value)
      ? null
      : validatorError('ucfirst', value);
  };
}

/**
 * Validates integers. Prefer the `ngvInt` directive when you also want
 * automatic correction (for example `52.7` → `52`).
 */
export function int(): ValidatorFn {
  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    const value = control.value;
    const valid =
      (typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value)) ||
      (typeof value === 'string' && INTEGER_PATTERN.test(value));
    return valid ? null : validatorError('int', value);
  };
}

/**
 * Validates floating-point numbers (for example `52`, `52.123`, `.5`).
 * Prefer the `ngvFloat` directive when you also want automatic correction.
 */
export function float(): ValidatorFn {
  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    const value = control.value;
    const valid =
      (typeof value === 'number' && Number.isFinite(value)) ||
      (typeof value === 'string' && FLOAT_PATTERN.test(value) && Number.isFinite(Number(value)));
    return valid ? null : validatorError('float', value);
  };
}

/**
 * Limits the control value to one of the offered values.
 * (`enum` is a TypeScript reserved word, so the factory is named `oneOf`.)
 */
export function oneOf(values: readonly unknown[]): ValidatorFn {
  if (!Array.isArray(values) || values.length === 0) {
    throw new RangeError('oneOf requires a non-empty list of allowed values');
  }

  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    return values.some((allowed) => Object.is(allowed, control.value))
      ? null
      : validatorError('oneOf', control.value, { values: [...values] });
  };
}
