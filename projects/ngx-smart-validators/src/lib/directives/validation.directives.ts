import { Directive, forwardRef, HostListener, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS } from '@angular/forms';

import { PasswordOptions, PhoneCountry } from '../validators';
import {
  CorrectingValidatorDirective,
  fieldNames,
  isEnabled,
  ValidatorDirectiveBase,
} from './validator-directive.base';
import {
  normalizeFloat,
  normalizeInt,
  normalizeLowercase,
  normalizeUcFirst,
  normalizeUppercase,
} from '../validators/transforms';

type Toggle = boolean | '';
type DateValue = Date | string | number;

export interface NgvRangeConfig {
  min: number;
  max: number;
}

export interface NgvRegexConfig {
  pattern: string;
  flags?: string;
}

export interface NgvRequiredIfConfig {
  targetField: string;
  dependentField: string;
  condition:
    | unknown
    | ((value: unknown, group: AbstractControl) => boolean);
}

export interface NgvDateRangeConfig {
  start: string;
  end: string;
}

const validatorProvider = (type: unknown) => ({
  provide: NG_VALIDATORS,
  useExisting: type,
  multi: true,
});

@Directive({
  selector: '[ngvRequiredTrimmed]',
  standalone: true,
  providers: [
    validatorProvider(forwardRef(() => NgvRequiredTrimmedDirective)),
  ],
})
export class NgvRequiredTrimmedDirective extends ValidatorDirectiveBase {
  @Input()
  set ngvRequiredTrimmed(value: Toggle) {
    this.configure('requiredTrimmed', [], isEnabled(value));
  }
}

@Directive({
  selector: '[ngvRange]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvRangeDirective))],
})
export class NgvRangeDirective extends ValidatorDirectiveBase {
  @Input()
  set ngvRange(value: NgvRangeConfig | readonly [number, number] | null) {
    if (!value) {
      this.configure('range', [], false);
      return;
    }

    const [min, max] =
      'min' in value ? [value.min, value.max] : value;
    this.configure('range', [min, max]);
  }
}

@Directive({
  selector: '[ngvRegex]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvRegexDirective))],
})
export class NgvRegexDirective extends ValidatorDirectiveBase {
  @Input()
  set ngvRegex(value: RegExp | string | NgvRegexConfig | null) {
    if (!value) {
      this.configure('regex', [], false);
      return;
    }

    const pattern =
      typeof value === 'object' && !(value instanceof RegExp)
        ? new RegExp(value.pattern, value.flags)
        : value;
    this.configure('regex', [pattern]);
  }
}

abstract class ToggleValidatorDirective extends ValidatorDirectiveBase {
  protected setToggle(name: string, value: Toggle): void {
    this.configure(name, [], isEnabled(value));
  }
}

@Directive({
  selector: '[ngvStrictEmail]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvStrictEmailDirective))],
})
export class NgvStrictEmailDirective extends ToggleValidatorDirective {
  @Input()
  set ngvStrictEmail(value: Toggle) {
    this.setToggle('strictEmail', value);
  }
}

@Directive({
  selector: '[ngvUrl]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvUrlDirective))],
})
export class NgvUrlDirective extends ToggleValidatorDirective {
  @Input()
  set ngvUrl(value: Toggle) {
    this.setToggle('url', value);
  }
}

@Directive({
  selector: '[ngvPhone]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvPhoneDirective))],
})
export class NgvPhoneDirective extends ValidatorDirectiveBase {
  @Input()
  set ngvPhone(value: Toggle | PhoneCountry) {
    const enabled = isEnabled(value);
    const options =
      value === '' || typeof value === 'boolean' ? [] : [value];
    this.configure('phone', options, enabled);
  }
}

@Directive({
  selector: '[ngvPassword]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvPasswordDirective))],
})
export class NgvPasswordDirective extends ValidatorDirectiveBase {
  @Input()
  set ngvPassword(value: Toggle | PasswordOptions) {
    const enabled = isEnabled(value);
    const options =
      value === '' || typeof value === 'boolean' ? [] : [value];
    this.configure('password', options, enabled);
  }
}

abstract class DateValidatorDirective extends ValidatorDirectiveBase {
  protected setDate(name: string, value: DateValue | null): void {
    this.configure(name, value === null ? [] : [value], value !== null);
  }
}

@Directive({
  selector: '[ngvMinDate]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvMinDateDirective))],
})
export class NgvMinDateDirective extends DateValidatorDirective {
  @Input()
  set ngvMinDate(value: DateValue | null) {
    this.setDate('minDate', value);
  }
}

@Directive({
  selector: '[ngvMaxDate]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvMaxDateDirective))],
})
export class NgvMaxDateDirective extends DateValidatorDirective {
  @Input()
  set ngvMaxDate(value: DateValue | null) {
    this.setDate('maxDate', value);
  }
}

abstract class AgeValidatorDirective extends ValidatorDirectiveBase {
  protected setAge(name: string, value: number | string | null): void {
    const age = value === null || value === '' ? null : Number(value);
    this.configure(name, age === null ? [] : [age], age !== null);
  }
}

@Directive({
  selector: '[ngvMinAge]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvMinAgeDirective))],
})
export class NgvMinAgeDirective extends AgeValidatorDirective {
  @Input()
  set ngvMinAge(value: number | string | null) {
    this.setAge('minAge', value);
  }
}

@Directive({
  selector: '[ngvMaxAge]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvMaxAgeDirective))],
})
export class NgvMaxAgeDirective extends AgeValidatorDirective {
  @Input()
  set ngvMaxAge(value: number | string | null) {
    this.setAge('maxAge', value);
  }
}

@Directive({
  selector: '[ngvCreditCard]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvCreditCardDirective))],
})
export class NgvCreditCardDirective extends ToggleValidatorDirective {
  @Input()
  set ngvCreditCard(value: Toggle) {
    this.setToggle('creditCard', value);
  }
}

@Directive({
  selector: '[ngvIban]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvIbanDirective))],
})
export class NgvIbanDirective extends ToggleValidatorDirective {
  @Input()
  set ngvIban(value: Toggle) {
    this.setToggle('iban', value);
  }
}

@Directive({
  selector: '[ngvMatchFields]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvMatchFieldsDirective))],
})
export class NgvMatchFieldsDirective extends ValidatorDirectiveBase {
  @Input()
  set ngvMatchFields(value: string | readonly string[] | null) {
    const fields = value === null ? [] : fieldNames(value);
    this.configure('matchFields', fields, fields.length >= 2);
  }
}

@Directive({
  selector: '[ngvDateRange]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvDateRangeDirective))],
})
export class NgvDateRangeDirective extends ValidatorDirectiveBase {
  @Input()
  set ngvDateRange(
    value: NgvDateRangeConfig | readonly [string, string] | null,
  ) {
    if (!value) {
      this.configure('dateRange', [], false);
      return;
    }

    const fields =
      'start' in value ? [value.start, value.end] : [...value];
    this.configure('dateRange', fields);
  }
}

@Directive({
  selector: '[ngvRequiredIf]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvRequiredIfDirective))],
})
export class NgvRequiredIfDirective extends ValidatorDirectiveBase {
  @Input()
  set ngvRequiredIf(value: NgvRequiredIfConfig | null) {
    this.configure(
      'requiredIf',
      value
        ? [value.targetField, value.dependentField, value.condition]
        : [],
      !!value,
    );
  }
}

abstract class FieldSetValidatorDirective extends ValidatorDirectiveBase {
  protected setFields(
    name: string,
    value: string | readonly string[] | null,
  ): void {
    const fields = value === null ? [] : fieldNames(value);
    this.configure(name, [fields], fields.length > 0);
  }
}

@Directive({
  selector: '[ngvAtLeastOne]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvAtLeastOneDirective))],
})
export class NgvAtLeastOneDirective extends FieldSetValidatorDirective {
  @Input()
  set ngvAtLeastOne(value: string | readonly string[] | null) {
    this.setFields('atLeastOne', value);
  }
}

@Directive({
  selector: '[ngvAllOrNone]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvAllOrNoneDirective))],
})
export class NgvAllOrNoneDirective extends FieldSetValidatorDirective {
  @Input()
  set ngvAllOrNone(value: string | readonly string[] | null) {
    this.setFields('allOrNone', value);
  }
}

@Directive({
  selector: '[ngvNumber]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvNumberDirective))],
})
export class NgvNumberDirective extends ToggleValidatorDirective {
  @Input() set ngvNumber(value: Toggle) { this.setToggle('number', value); }
}

@Directive({
  selector: '[ngvInteger]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvIntegerDirective))],
})
export class NgvIntegerDirective extends ToggleValidatorDirective {
  @Input() set ngvInteger(value: Toggle) { this.setToggle('integer', value); }
}

@Directive({
  selector: '[ngvDecimal]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvDecimalDirective))],
})
export class NgvDecimalDirective extends ValidatorDirectiveBase {
  @Input() set ngvDecimal(value: number | string | null) {
    const places = value === null || value === '' ? 2 : Number(value);
    this.configure('decimal', [places], value !== null);
  }
}

abstract class ThresholdValidatorDirective extends ValidatorDirectiveBase {
  protected setThreshold(name: string, value: number | string | null): void {
    this.configure(name, value === null ? [] : [Number(value)], value !== null);
  }
}

@Directive({
  selector: '[ngvGreaterThan]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvGreaterThanDirective))],
})
export class NgvGreaterThanDirective extends ThresholdValidatorDirective {
  @Input() set ngvGreaterThan(value: number | string | null) {
    this.setThreshold('greaterThan', value);
  }
}

@Directive({
  selector: '[ngvLessThan]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvLessThanDirective))],
})
export class NgvLessThanDirective extends ThresholdValidatorDirective {
  @Input() set ngvLessThan(value: number | string | null) {
    this.setThreshold('lessThan', value);
  }
}

@Directive({
  selector: '[ngvAlpha]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvAlphaDirective))],
})
export class NgvAlphaDirective extends ToggleValidatorDirective {
  @Input() set ngvAlpha(value: Toggle) { this.setToggle('alpha', value); }
}

@Directive({
  selector: '[ngvAlphanumeric]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvAlphanumericDirective))],
})
export class NgvAlphanumericDirective extends ToggleValidatorDirective {
  @Input() set ngvAlphanumeric(value: Toggle) { this.setToggle('alphanumeric', value); }
}

@Directive({
  selector: '[ngvNoWhitespace]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvNoWhitespaceDirective))],
})
export class NgvNoWhitespaceDirective extends ToggleValidatorDirective {
  @Input() set ngvNoWhitespace(value: Toggle) { this.setToggle('noWhitespace', value); }
}

abstract class CorrectingToggleValidatorDirective extends CorrectingValidatorDirective {
  protected setToggle(name: string, value: Toggle): void {
    this.configure(name, [], isEnabled(value));
  }
}

@Directive({
  selector: '[ngvLowercase]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvLowercaseDirective))],
})
export class NgvLowercaseDirective extends CorrectingToggleValidatorDirective {
  @Input() set ngvLowercase(value: Toggle) {
    this.setToggle('lowercase', value);
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    this.correctFromInput(event, normalizeLowercase);
  }
}

@Directive({
  selector: '[ngvUppercase]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvUppercaseDirective))],
})
export class NgvUppercaseDirective extends CorrectingToggleValidatorDirective {
  @Input() set ngvUppercase(value: Toggle) {
    this.setToggle('uppercase', value);
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    this.correctFromInput(event, normalizeUppercase);
  }
}

@Directive({
  selector: '[ngvUcfirst]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvUcfirstDirective))],
})
export class NgvUcfirstDirective extends CorrectingToggleValidatorDirective {
  @Input() set ngvUcfirst(value: Toggle) {
    this.setToggle('ucfirst', value);
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    this.correctFromInput(event, normalizeUcFirst);
  }
}

@Directive({
  selector: '[ngvInt]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvIntDirective))],
})
export class NgvIntDirective extends CorrectingToggleValidatorDirective {
  @Input() set ngvInt(value: Toggle) {
    this.setToggle('int', value);
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    this.correctFromInput(event, (value) => String(normalizeInt(value)));
  }
}

@Directive({
  selector: '[ngvFloat]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvFloatDirective))],
})
export class NgvFloatDirective extends CorrectingToggleValidatorDirective {
  @Input() set ngvFloat(value: Toggle) {
    this.setToggle('float', value);
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    this.correctFromInput(event, (value) => String(normalizeFloat(value)));
  }
}

@Directive({
  selector: '[ngvEnum],[ngvOneOf]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvEnumDirective))],
})
export class NgvEnumDirective extends ValidatorDirectiveBase {
  @Input()
  set ngvEnum(value: readonly unknown[] | string | null) {
    this.setAllowedValues(value);
  }

  @Input()
  set ngvOneOf(value: readonly unknown[] | string | null) {
    this.setAllowedValues(value);
  }

  private setAllowedValues(value: readonly unknown[] | string | null): void {
    if (value === null) {
      this.configure('oneOf', [], false);
      return;
    }

    const values =
      typeof value === 'string'
        ? value
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean)
        : [...value];
    this.configure('oneOf', [values], values.length > 0);
  }
}

abstract class TextArgumentValidatorDirective extends ValidatorDirectiveBase {
  protected setText(name: string, value: string | null): void {
    this.configure(name, value === null ? [] : [value], value !== null);
  }
}

@Directive({
  selector: '[ngvStartsWith]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvStartsWithDirective))],
})
export class NgvStartsWithDirective extends TextArgumentValidatorDirective {
  @Input() set ngvStartsWith(value: string | null) { this.setText('startsWith', value); }
}

@Directive({
  selector: '[ngvEndsWith]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvEndsWithDirective))],
})
export class NgvEndsWithDirective extends TextArgumentValidatorDirective {
  @Input() set ngvEndsWith(value: string | null) { this.setText('endsWith', value); }
}

@Directive({
  selector: '[ngvIncludes]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvIncludesDirective))],
})
export class NgvIncludesDirective extends TextArgumentValidatorDirective {
  @Input() set ngvIncludes(value: string | null) { this.setText('includes', value); }
}

@Directive({
  selector: '[ngvValidDate]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvValidDateDirective))],
})
export class NgvValidDateDirective extends ToggleValidatorDirective {
  @Input() set ngvValidDate(value: Toggle) { this.setToggle('validDate', value); }
}

@Directive({
  selector: '[ngvPastDate]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvPastDateDirective))],
})
export class NgvPastDateDirective extends ToggleValidatorDirective {
  @Input() set ngvPastDate(value: Toggle) { this.setToggle('pastDate', value); }
}

@Directive({
  selector: '[ngvFutureDate]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvFutureDateDirective))],
})
export class NgvFutureDateDirective extends ToggleValidatorDirective {
  @Input() set ngvFutureDate(value: Toggle) { this.setToggle('futureDate', value); }
}

@Directive({ selector: '[ngvUuid]', standalone: true, providers: [validatorProvider(forwardRef(() => NgvUuidDirective))] })
export class NgvUuidDirective extends ToggleValidatorDirective { @Input() set ngvUuid(value: Toggle) { this.setToggle('uuid', value); } }

@Directive({ selector: '[ngvJson]', standalone: true, providers: [validatorProvider(forwardRef(() => NgvJsonDirective))] })
export class NgvJsonDirective extends ToggleValidatorDirective { @Input() set ngvJson(value: Toggle) { this.setToggle('json', value); } }

@Directive({ selector: '[ngvBase64]', standalone: true, providers: [validatorProvider(forwardRef(() => NgvBase64Directive))] })
export class NgvBase64Directive extends ToggleValidatorDirective { @Input() set ngvBase64(value: Toggle) { this.setToggle('base64', value); } }

@Directive({ selector: '[ngvHexColor]', standalone: true, providers: [validatorProvider(forwardRef(() => NgvHexColorDirective))] })
export class NgvHexColorDirective extends ToggleValidatorDirective { @Input() set ngvHexColor(value: Toggle) { this.setToggle('hexColor', value); } }

@Directive({
  selector: '[ngvIpAddress]',
  standalone: true,
  providers: [validatorProvider(forwardRef(() => NgvIpAddressDirective))],
})
export class NgvIpAddressDirective extends ValidatorDirectiveBase {
  @Input() set ngvIpAddress(value: Toggle | 'v4' | 'v6') {
    this.configure('ipAddress', value === '' || typeof value === 'boolean' ? [] : [value], isEnabled(value));
  }
}

@Directive({ selector: '[ngvLatitude]', standalone: true, providers: [validatorProvider(forwardRef(() => NgvLatitudeDirective))] })
export class NgvLatitudeDirective extends ToggleValidatorDirective { @Input() set ngvLatitude(value: Toggle) { this.setToggle('latitude', value); } }

@Directive({ selector: '[ngvLongitude]', standalone: true, providers: [validatorProvider(forwardRef(() => NgvLongitudeDirective))] })
export class NgvLongitudeDirective extends ToggleValidatorDirective { @Input() set ngvLongitude(value: Toggle) { this.setToggle('longitude', value); } }

export const NGV_DIRECTIVES = [
  NgvRequiredTrimmedDirective,
  NgvRangeDirective,
  NgvRegexDirective,
  NgvStrictEmailDirective,
  NgvUrlDirective,
  NgvPhoneDirective,
  NgvPasswordDirective,
  NgvMinDateDirective,
  NgvMaxDateDirective,
  NgvMinAgeDirective,
  NgvMaxAgeDirective,
  NgvCreditCardDirective,
  NgvIbanDirective,
  NgvMatchFieldsDirective,
  NgvDateRangeDirective,
  NgvRequiredIfDirective,
  NgvAtLeastOneDirective,
  NgvAllOrNoneDirective,
  NgvNumberDirective,
  NgvIntegerDirective,
  NgvDecimalDirective,
  NgvGreaterThanDirective,
  NgvLessThanDirective,
  NgvAlphaDirective,
  NgvAlphanumericDirective,
  NgvNoWhitespaceDirective,
  NgvLowercaseDirective,
  NgvUppercaseDirective,
  NgvUcfirstDirective,
  NgvIntDirective,
  NgvFloatDirective,
  NgvEnumDirective,
  NgvStartsWithDirective,
  NgvEndsWithDirective,
  NgvIncludesDirective,
  NgvValidDateDirective,
  NgvPastDateDirective,
  NgvFutureDateDirective,
  NgvUuidDirective,
  NgvJsonDirective,
  NgvBase64Directive,
  NgvHexColorDirective,
  NgvIpAddressDirective,
  NgvLatitudeDirective,
  NgvLongitudeDirective,
] as const;
