import {
  AbstractControl,
  ValidationErrors,
  Validator,
  ValidatorFn,
} from '@angular/forms';

import * as validatorExports from '../validators';

type ValidatorFactory = (...args: unknown[]) => ValidatorFn;

const validators = validatorExports as unknown as Record<string, unknown>;

export function createValidator(
  name: string,
  args: readonly unknown[] = [],
): ValidatorFn {
  const candidateNames = [
    name,
    `${name}Validator`,
    `${name.charAt(0).toUpperCase()}${name.slice(1)}Validator`,
  ];
  const factory = candidateNames
    .map((candidate) => validators[candidate])
    .find((candidate): candidate is ValidatorFactory =>
      typeof candidate === 'function',
    );

  if (!factory) {
    throw new Error(
      `ngx-smart-validators: no validator factory exported for "${name}".`,
    );
  }

  return factory(...args);
}

export function isEnabled(value: unknown): boolean {
  return value !== false && value !== 'false' && value !== null;
}

export function fieldNames(value: string | readonly string[]): string[] {
  return typeof value === 'string'
    ? value
        .split(',')
        .map((field) => field.trim())
        .filter(Boolean)
    : [...value];
}

export abstract class ValidatorDirectiveBase implements Validator {
  private validator: ValidatorFn | null = null;
  private onChange: () => void = () => undefined;
  protected enabled = false;

  validate(control: AbstractControl): ValidationErrors | null {
    return this.validator ? this.validator(control) : null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onChange = fn;
  }

  protected configure(
    name: string,
    args: readonly unknown[] = [],
    enabled = true,
  ): void {
    this.enabled = enabled;
    this.validator = enabled ? createValidator(name, args) : null;
    this.onChange();
  }
}

/**
 * Validator directive that can rewrite the bound control value in place.
 * Used by lowercase / uppercase / ucfirst / int / float.
 *
 * The control is captured from `validate()` rather than injected: injecting
 * `NgControl` from an element that also provides `NG_VALIDATORS` would be a
 * circular dependency.
 */
export abstract class CorrectingValidatorDirective extends ValidatorDirectiveBase {
  private control: AbstractControl | null = null;

  override validate(control: AbstractControl): ValidationErrors | null {
    this.control = control;
    return super.validate(control);
  }

  protected correctFromInput(
    event: Event,
    transform: (value: string) => string,
  ): void {
    if (!this.enabled) {
      return;
    }

    const input = event.target as HTMLInputElement | HTMLTextAreaElement | null;
    if (!input || typeof input.value !== 'string') {
      return;
    }

    const current = input.value;
    const next = transform(current);
    if (next === current) {
      return;
    }

    const selectionStart = input.selectionStart;
    input.value = next;
    this.control?.setValue(next, { emitModelToViewChange: false });

    if (typeof selectionStart === 'number') {
      const position = Math.min(selectionStart, next.length);
      input.setSelectionRange(position, position);
    }
  }
}
