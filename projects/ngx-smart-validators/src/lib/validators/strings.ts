import { AbstractControl, ValidatorFn } from '@angular/forms';
import { isEmpty, validatorError } from './utils';

function stringPredicate(
  key: string,
  predicate: (value: string) => boolean,
  constraints?: Record<string, unknown>,
): ValidatorFn {
  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    return typeof control.value === 'string' && predicate(control.value)
      ? null
      : validatorError(key, control.value, constraints);
  };
}

export function regex(pattern: RegExp): ValidatorFn {
  const stablePattern = new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ''));
  return stringPredicate(
    'regex',
    (value) => stablePattern.test(value),
    { pattern: pattern.source, flags: stablePattern.flags },
  );
}

export function startsWith(prefix: string): ValidatorFn {
  return stringPredicate('startsWith', (value) => value.startsWith(prefix), { prefix });
}

export function endsWith(suffix: string): ValidatorFn {
  return stringPredicate('endsWith', (value) => value.endsWith(suffix), { suffix });
}

export function includes(fragment: string): ValidatorFn {
  return stringPredicate('includes', (value) => value.includes(fragment), { fragment });
}

export function url(): ValidatorFn {
  return stringPredicate(
    'url',
    (value) => {
      try {
        const parsed = new URL(value);
        return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname.length > 0;
      } catch {
        return false;
      }
    },
    { protocols: ['http', 'https'], absolute: true },
  );
}

export function strictEmail(): ValidatorFn {
  const emailPattern =
    /^(?=.{1,254}$)(?=.{1,64}@)[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;
  return stringPredicate('strictEmail', (value) => emailPattern.test(value), {
    requireTopLevelDomain: true,
  });
}
