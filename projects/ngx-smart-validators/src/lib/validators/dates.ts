import { AbstractControl, ValidatorFn } from '@angular/forms';
import { isEmpty, validatorError } from './utils';

export type DateInput = Date | string | number;

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_WITH_TIMEZONE =
  /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;

function validCalendarDate(year: number, month: number, day: number): boolean {
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

export function parseDateValue(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }
  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value !== 'string') return null;

  const dateOnlyMatch = DATE_ONLY.exec(value);
  if (dateOnlyMatch !== null) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    return validCalendarDate(year, month, day)
      ? new Date(Date.UTC(year, month - 1, day))
      : null;
  }

  const dateTimeMatch = ISO_WITH_TIMEZONE.exec(value);
  if (dateTimeMatch === null) return null;
  if (
    !validCalendarDate(
      Number(dateTimeMatch[1]),
      Number(dateTimeMatch[2]),
      Number(dateTimeMatch[3]),
    )
  ) {
    return null;
  }
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp);
}

function boundary(value: DateInput, name: string): Date {
  const parsed = parseDateValue(value);
  if (parsed === null) {
    throw new RangeError(`${name} must be a valid Date, timestamp, or ISO 8601 string`);
  }
  return parsed;
}

export function validDate(): ValidatorFn {
  return (control: AbstractControl) =>
    isEmpty(control.value) || parseDateValue(control.value) !== null
      ? null
      : validatorError('validDate', control.value, { format: 'ISO 8601' });
}

export function minDate(minimum: DateInput): ValidatorFn {
  const min = boundary(minimum, 'minimum');
  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    const actual = parseDateValue(control.value);
    return actual !== null && actual.getTime() >= min.getTime()
      ? null
      : validatorError('minDate', control.value, { min: min.toISOString() });
  };
}

export function maxDate(maximum: DateInput): ValidatorFn {
  const max = boundary(maximum, 'maximum');
  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    const actual = parseDateValue(control.value);
    return actual !== null && actual.getTime() <= max.getTime()
      ? null
      : validatorError('maxDate', control.value, { max: max.toISOString() });
  };
}

export function pastDate(reference?: DateInput): ValidatorFn {
  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    const actual = parseDateValue(control.value);
    const comparedWith = reference === undefined ? new Date() : boundary(reference, 'reference');
    return actual !== null && actual.getTime() < comparedWith.getTime()
      ? null
      : validatorError('pastDate', control.value, {
          before: reference === undefined ? 'now' : comparedWith.toISOString(),
        });
  };
}

export function futureDate(reference?: DateInput): ValidatorFn {
  return (control: AbstractControl) => {
    if (isEmpty(control.value)) return null;
    const actual = parseDateValue(control.value);
    const comparedWith = reference === undefined ? new Date() : boundary(reference, 'reference');
    return actual !== null && actual.getTime() > comparedWith.getTime()
      ? null
      : validatorError('futureDate', control.value, {
          after: reference === undefined ? 'now' : comparedWith.toISOString(),
        });
  };
}
