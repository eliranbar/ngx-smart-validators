import { AbstractControl, ValidatorFn } from '@angular/forms';
import { isSmartValidatorFeatureEnabled } from '../license/feature-gate.service';
import { parseDateValue } from './dates';
import { controlValues, isEmpty, validatorError } from './utils';

type RequiredIfCondition = unknown | ((value: unknown, group: AbstractControl) => boolean);

function fieldList(fields: readonly string[] | string, additional: readonly string[]): string[] {
  const result = typeof fields === 'string' ? [fields, ...additional] : [...fields, ...additional];
  if (result.length === 0) {
    throw new RangeError('At least one field name is required');
  }
  return result;
}

export function matchFields(firstField: string, secondField: string): ValidatorFn {
  return (control: AbstractControl) => {
    const first = control.get(firstField)?.value;
    const second = control.get(secondField)?.value;
    return first === second
      ? null
      : validatorError('matchFields', controlValues(control, [firstField, secondField]), {
          fields: [firstField, secondField],
        });
  };
}

export function dateRange(startField: string, endField: string): ValidatorFn {
  return (control: AbstractControl) => {
    if (!isSmartValidatorFeatureEnabled('crossField')) return null;
    const actual = controlValues(control, [startField, endField]);
    const startValue = actual[startField];
    const endValue = actual[endField];
    if (isEmpty(startValue) || isEmpty(endValue)) return null;

    const start = parseDateValue(startValue);
    const end = parseDateValue(endValue);
    return start !== null && end !== null && start.getTime() <= end.getTime()
      ? null
      : validatorError('dateRange', actual, {
          startField,
          endField,
          order: 'ascending',
        });
  };
}

export function requiredIf(
  targetField: string,
  dependentField: string,
  condition: RequiredIfCondition,
): ValidatorFn {
  return (control: AbstractControl) => {
    if (!isSmartValidatorFeatureEnabled('crossField')) return null;
    const dependentValue = control.get(dependentField)?.value;
    const applies =
      typeof condition === 'function'
        ? condition(dependentValue, control)
        : dependentValue === condition;
    const targetValue = control.get(targetField)?.value;
    return !applies || !isEmpty(targetValue)
      ? null
      : validatorError('requiredIf', targetValue, {
          targetField,
          dependentField,
          dependentValue,
        });
  };
}

export function atLeastOne(
  fields: readonly string[] | string,
  ...additionalFields: string[]
): ValidatorFn {
  const names = fieldList(fields, additionalFields);
  return (control: AbstractControl) => {
    if (!isSmartValidatorFeatureEnabled('crossField')) return null;
    const actual = controlValues(control, names);
    return names.some((field) => !isEmpty(actual[field]))
      ? null
      : validatorError('atLeastOne', actual, { fields: names });
  };
}

export function allOrNone(
  fields: readonly string[] | string,
  ...additionalFields: string[]
): ValidatorFn {
  const names = fieldList(fields, additionalFields);
  return (control: AbstractControl) => {
    if (!isSmartValidatorFeatureEnabled('crossField')) return null;
    const actual = controlValues(control, names);
    const completed = names.filter((field) => !isEmpty(actual[field])).length;
    return completed === 0 || completed === names.length
      ? null
      : validatorError('allOrNone', actual, { fields: names, completed });
  };
}
