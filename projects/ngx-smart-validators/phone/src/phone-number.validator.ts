import { ValidatorFn } from '@angular/forms';
import {
  CountryCode,
  PhoneNumber,
  parsePhoneNumberFromString,
} from 'libphonenumber-js/min';
import { isSmartValidatorFeatureEnabled } from 'ngx-smart-validators';

export interface PhoneNumberValidatorOptions {
  /** Accept numbers that are possible but not confirmed valid by metadata. */
  readonly allowPossible?: boolean;
  /** Restrict accepted numbers to one or more libphonenumber number types. */
  readonly types?: readonly NonNullable<ReturnType<PhoneNumber['getType']>>[];
}

/**
 * Validates international telephone numbers using libphonenumber metadata.
 *
 * This Pro validator is intentionally a secondary entry point so applications
 * that do not use it never include libphonenumber-js.
 */
export function phoneNumber(
  defaultCountry?: CountryCode,
  options: PhoneNumberValidatorOptions = {},
): ValidatorFn {
  return (control) => {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }
    if (!isSmartValidatorFeatureEnabled('phoneAdvanced')) {
      return null;
    }

    const actual = String(value).trim();
    const parsed = parsePhoneNumberFromString(actual, defaultCountry);
    const numberValid = parsed
      ? options.allowPossible
        ? parsed.isPossible()
        : parsed.isValid()
      : false;
    const typeValid =
      !options.types?.length ||
      (!!parsed?.getType() && options.types.includes(parsed.getType()!));

    return numberValid && typeValid
      ? null
      : {
          phoneNumber: {
            actual,
            country: defaultCountry,
            allowedTypes: options.types,
            message: 'Enter a valid phone number.',
          },
        };
  };
}
