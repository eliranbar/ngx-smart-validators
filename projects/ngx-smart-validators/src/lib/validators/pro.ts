import { AbstractControl, ValidatorFn } from '@angular/forms';
import { isSmartValidatorFeatureEnabled } from '../license/feature-gate.service';
import { DateInput, parseDateValue } from './dates';
import { isEmpty, validatorError } from './utils';

export interface PasswordOptions {
  minLength?: number;
  maxLength?: number;
  uppercase?: boolean;
  lowercase?: boolean;
  number?: boolean;
  special?: boolean;
  noSpaces?: boolean;
}

const DEFAULT_PASSWORD_OPTIONS: Required<PasswordOptions> = {
  minLength: 8,
  maxLength: 128,
  uppercase: true,
  lowercase: true,
  number: true,
  special: true,
  noSpaces: true,
};

export function password(options: PasswordOptions = {}): ValidatorFn {
  const constraints = { ...DEFAULT_PASSWORD_OPTIONS, ...options };
  if (
    !Number.isInteger(constraints.minLength) ||
    !Number.isInteger(constraints.maxLength) ||
    constraints.minLength < 0 ||
    constraints.maxLength < constraints.minLength
  ) {
    throw new RangeError('Password length constraints are invalid');
  }

  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    if (!isSmartValidatorFeatureEnabled('passwordEngine')) return null;
    const value = control.value;
    const failedRules: string[] = [];
    if (typeof value !== 'string') {
      failedRules.push('type');
    } else {
      if (value.length < constraints.minLength) failedRules.push('minLength');
      if (value.length > constraints.maxLength) failedRules.push('maxLength');
      if (constraints.uppercase && !/[A-Z]/.test(value)) failedRules.push('uppercase');
      if (constraints.lowercase && !/[a-z]/.test(value)) failedRules.push('lowercase');
      if (constraints.number && !/\d/.test(value)) failedRules.push('number');
      if (constraints.special && !/[^A-Za-z0-9\s]/.test(value)) failedRules.push('special');
      if (constraints.noSpaces && /\s/.test(value)) failedRules.push('noSpaces');
    }
    return failedRules.length === 0
      ? null
      : validatorError('password', value, { ...constraints, failedRules });
  };
}

export type CreditCardBrand =
  | 'amex'
  | 'discover'
  | 'jcb'
  | 'mastercard'
  | 'visa'
  | 'unknown';

function cardBrand(digits: string): CreditCardBrand {
  if (/^4\d{12}(?:\d{3})?(?:\d{3})?$/.test(digits)) return 'visa';
  if (/^3[47]\d{13}$/.test(digits)) return 'amex';
  if (/^(?:5[1-5]\d{14}|2(?:2[2-9]\d|2[3-9]\d{2}|[3-6]\d{3}|7[01]\d{2}|720\d)\d{12})$/.test(digits)) {
    return 'mastercard';
  }
  if (/^6(?:011|5\d{2})\d{12}$/.test(digits)) return 'discover';
  if (/^(?:2131|1800|35\d{3})\d{11}$/.test(digits)) return 'jcb';
  return 'unknown';
}

function passesLuhn(digits: string): boolean {
  let sum = 0;
  let doubleDigit = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

export function creditCard(): ValidatorFn {
  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    if (!isSmartValidatorFeatureEnabled('financial')) return null;
    if (typeof control.value !== 'string' || !/^[\d -]+$/.test(control.value)) {
      return validatorError('creditCard', control.value, {
        algorithm: 'Luhn',
        brand: 'unknown',
      });
    }
    const digits = control.value.replace(/[ -]/g, '');
    const brand = cardBrand(digits);
    return brand !== 'unknown' && passesLuhn(digits)
      ? null
      : validatorError('creditCard', control.value, { algorithm: 'Luhn', brand });
  };
}

const IBAN_LENGTHS: Record<string, number> = {
  AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22,
  BR: 29, BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28,
  EE: 20, EG: 29, ES: 24, FI: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23,
  GL: 18, GR: 27, GT: 28, HR: 21, HU: 28, IE: 22, IL: 23, IQ: 23, IS: 26,
  IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28, LC: 32, LI: 21, LT: 20, LU: 20,
  LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27, MT: 31, MU: 30, NL: 18,
  NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29, RO: 24, RS: 22, SA: 24,
  SC: 31, SE: 24, SI: 19, SK: 24, SM: 27, ST: 25, SV: 28, TL: 23, TN: 24,
  TR: 26, UA: 29, VA: 22, VG: 24, XK: 20,
};

function ibanRemainder(value: string): number {
  let remainder = 0;
  for (const character of value) {
    const expanded = /\d/.test(character)
      ? character
      : String(character.charCodeAt(0) - 55);
    for (const digit of expanded) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }
  return remainder;
}

export function iban(): ValidatorFn {
  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    if (!isSmartValidatorFeatureEnabled('financial')) return null;
    const normalized =
      typeof control.value === 'string' ? control.value.replace(/\s/g, '').toUpperCase() : '';
    const country = normalized.slice(0, 2);
    const expectedLength = IBAN_LENGTHS[country];
    const valid =
      /^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(normalized) &&
      expectedLength !== undefined &&
      normalized.length === expectedLength &&
      ibanRemainder(normalized.slice(4) + normalized.slice(0, 4)) === 1;
    return valid
      ? null
      : validatorError('iban', control.value, {
          country: country || 'unknown',
          expectedLength: expectedLength ?? 'unsupported',
          algorithm: 'MOD-97',
        });
  };
}

function ageOn(dateOfBirth: Date, reference: Date): number {
  let age = reference.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const beforeBirthday =
    reference.getUTCMonth() < dateOfBirth.getUTCMonth() ||
    (reference.getUTCMonth() === dateOfBirth.getUTCMonth() &&
      reference.getUTCDate() < dateOfBirth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function ageValidator(
  key: 'minAge' | 'maxAge',
  years: number,
  reference?: DateInput,
): ValidatorFn {
  if (!Number.isInteger(years) || years < 0) {
    throw new RangeError('Age must be a non-negative integer');
  }

  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    if (!isSmartValidatorFeatureEnabled('ageValidation')) return null;
    const birthDate = parseDateValue(control.value);
    const comparedWith = reference === undefined ? new Date() : parseDateValue(reference);
    if (comparedWith === null) throw new RangeError('reference must be a valid date');
    const actualAge = birthDate === null ? null : ageOn(birthDate, comparedWith);
    const valid =
      actualAge !== null &&
      actualAge >= 0 &&
      (key === 'minAge' ? actualAge >= years : actualAge <= years);
    return valid
      ? null
      : validatorError(key, control.value, {
          [key === 'minAge' ? 'min' : 'max']: years,
          actualAge,
          reference: reference === undefined ? 'now' : comparedWith.toISOString(),
        });
  };
}

export function minAge(years: number, reference?: DateInput): ValidatorFn {
  return ageValidator('minAge', years, reference);
}

export function maxAge(years: number, reference?: DateInput): ValidatorFn {
  return ageValidator('maxAge', years, reference);
}
