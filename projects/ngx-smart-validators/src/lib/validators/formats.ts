import { AbstractControl, ValidatorFn } from '@angular/forms';
import { isEmpty, validatorError } from './utils';

export type PhoneCountry = 'US' | 'CA' | 'GB' | 'IL' | 'international';
export type IpVersion = 'v4' | 'v6';

function formatValidator(
  key: string,
  predicate: (value: unknown) => boolean,
  constraints?: Record<string, unknown>,
): ValidatorFn {
  return (control: AbstractControl) =>
    isEmpty(control.value) || predicate(control.value)
      ? null
      : validatorError(key, control.value, constraints);
}

export function phone(country: PhoneCountry = 'international'): ValidatorFn {
  return formatValidator(
    'phone',
    (value) => {
      if (typeof value !== 'string' || !/^[+\d\s().-]+$/.test(value)) return false;
      const digits = value.replace(/\D/g, '');
      switch (country) {
        case 'US':
        case 'CA':
          return /^(?:1)?[2-9]\d{2}[2-9]\d{6}$/.test(digits);
        case 'GB':
          return /^(?:44|0)7\d{9}$/.test(digits);
        case 'IL':
          return /^(?:972|0)5\d{8}$/.test(digits);
        case 'international':
          return value.trim().startsWith('+') && /^[1-9]\d{7,14}$/.test(digits);
      }
    },
    { country },
  );
}

export function uuid(): ValidatorFn {
  return formatValidator(
    'uuid',
    (value) =>
      typeof value === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value),
    { versions: [1, 2, 3, 4, 5] },
  );
}

export function json(): ValidatorFn {
  return formatValidator('json', (value) => {
    if (typeof value !== 'string') return false;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  });
}

export function base64(): ValidatorFn {
  return formatValidator(
    'base64',
    (value) =>
      typeof value === 'string' &&
      value.length % 4 === 0 &&
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value),
    { variant: 'standard' },
  );
}

export function hexColor(): ValidatorFn {
  return formatValidator(
    'hexColor',
    (value) =>
      typeof value === 'string' &&
      /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value),
    { prefix: '#', alphaAllowed: true },
  );
}

function isIpv4(value: string): boolean {
  const parts = value.split('.');
  return (
    parts.length === 4 &&
    parts.every(
      (part) =>
        /^(?:0|[1-9]\d{0,2})$/.test(part) && Number(part) >= 0 && Number(part) <= 255,
    )
  );
}

function isIpv6(value: string): boolean {
  if (!/^[0-9a-f:.]+$/i.test(value) || (value.match(/::/g)?.length ?? 0) > 1) return false;
  const halves = value.split('::');
  if (halves.length > 2) return false;

  const left = halves[0] === '' ? [] : halves[0]?.split(':') ?? [];
  const right = halves.length === 1 || halves[1] === '' ? [] : halves[1]?.split(':') ?? [];
  const groups = [...left, ...right];
  if (groups.some((group) => group.length === 0)) return false;

  let groupCount = groups.length;
  const ipv4Index = groups.findIndex((group) => group.includes('.'));
  if (ipv4Index >= 0) {
    if (ipv4Index !== groups.length - 1 || !isIpv4(groups[ipv4Index] ?? '')) return false;
    groupCount += 1;
  }
  if (
    groups.some(
      (group, index) => index !== ipv4Index && !/^[0-9a-f]{1,4}$/i.test(group),
    )
  ) {
    return false;
  }

  return halves.length === 2 ? groupCount < 8 : groupCount === 8;
}

export function ipAddress(version?: IpVersion): ValidatorFn {
  return formatValidator(
    'ipAddress',
    (value) => {
      if (typeof value !== 'string') return false;
      return version === 'v4'
        ? isIpv4(value)
        : version === 'v6'
          ? isIpv6(value)
          : isIpv4(value) || isIpv6(value);
    },
    { version: version ?? 'v4-or-v6' },
  );
}

function coordinate(key: 'latitude' | 'longitude', min: number, max: number): ValidatorFn {
  return formatValidator(
    key,
    (value) => {
      if (
        (typeof value !== 'number' && typeof value !== 'string') ||
        (typeof value === 'string' && !/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value))
      ) {
        return false;
      }
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed >= min && parsed <= max;
    },
    { min, max },
  );
}

export function latitude(): ValidatorFn {
  return coordinate('latitude', -90, 90);
}

export function longitude(): ValidatorFn {
  return coordinate('longitude', -180, 180);
}
