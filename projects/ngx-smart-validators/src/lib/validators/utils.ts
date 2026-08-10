import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface ValidatorErrorDetails {
  actual: unknown;
  constraints?: Record<string, unknown>;
  message?: string;
}

export function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

export function validatorError(
  key: string,
  actual: unknown,
  constraints?: Record<string, unknown>,
): ValidationErrors {
  const details: ValidatorErrorDetails = { actual };
  if (constraints !== undefined) {
    details.constraints = constraints;
  }
  return { [key]: details };
}

export function controlValues(
  control: AbstractControl,
  fields: readonly string[],
): Record<string, unknown> {
  return Object.fromEntries(fields.map((field) => [field, control.get(field)?.value]));
}

/**
 * Adds or replaces the message on every error returned by another validator.
 */
export function withMessage(validator: ValidatorFn, message: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const errors = validator(control);
    if (errors === null) {
      return null;
    }

    return Object.fromEntries(
      Object.entries(errors).map(([key, details]) => {
        if (typeof details === 'object' && details !== null && !Array.isArray(details)) {
          return [key, { ...details, message }];
        }
        return [
          key,
          {
            actual: control.value,
            constraints: { originalError: details },
            message,
          },
        ];
      }),
    );
  };
}
