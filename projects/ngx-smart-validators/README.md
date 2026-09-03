# @ebdev/ngx-smart-validators

Comprehensive, tree-shakeable validation for Angular 17–22. It supports reactive
forms and template-driven forms, ships readable error messages, and has no
setup requirement for the free validator set.

[![npm version](https://img.shields.io/npm/v/%40ebdev%2Fngx-smart-validators)](https://www.npmjs.com/package/@ebdev/ngx-smart-validators)
[![npm downloads](https://img.shields.io/npm/dm/%40ebdev%2Fngx-smart-validators)](https://www.npmjs.com/package/@ebdev/ngx-smart-validators)
![Angular 17–22](https://img.shields.io/badge/Angular-17%E2%80%9322-dd0031)

[Live demo](https://ngx-smart-validators.ebdev-design.com) ·
[Product page](https://www.ebdev-design.com/products/ngx-smart-validators) ·
[Issues](https://github.com/eliranbar/ngx-smart-validators/issues)

## Why this exists

Angular ships `required`, `min`, `max`, `email` and `pattern` — and stops there.
Every form-heavy application ends up hand-writing the same phone, date-range,
password and cross-field validators, each with its own error shape and no
message layer. This package is that missing set: one import per validator, a
predictable error object, and a pipe that turns errors into readable messages.

## Install

```bash
npm install @ebdev/ngx-smart-validators
```

## Reactive forms

```typescript
import { FormControl, FormGroup } from '@angular/forms';
import {
  matchFields,
  password,
  phone,
  requiredTrimmed,
  strictEmail,
} from '@ebdev/ngx-smart-validators';

readonly form = new FormGroup(
  {
    email: new FormControl('', [requiredTrimmed(), strictEmail()]),
    phone: new FormControl('', [phone('IL')]),
    password: new FormControl('', [password({ minLength: 10, special: true })]),
    confirmPassword: new FormControl(''),
  },
  { validators: matchFields('password', 'confirmPassword') },
);
```

Validators intentionally ignore empty values unless they enforce requiredness,
so they compose cleanly with Angular's `Validators.required`.

## Template-driven forms

Import individual standalone directives, or `NGV_DIRECTIVES`:

```typescript
import { NGV_DIRECTIVES, ValidationMessagePipe } from "@ebdev/ngx-smart-validators";

@Component({
  standalone: true,
  imports: [FormsModule, NGV_DIRECTIVES, ValidationMessagePipe],
})
export class ProfileComponent {}
```

```html
<input name="email" [(ngModel)]="email" ngvRequiredTrimmed ngvStrictEmail #emailModel="ngModel" /> <small>{{ emailModel.errors | ngvMessage }}</small>
```

## Configure messages and a Pro license

```typescript
import { ApplicationConfig } from "@angular/core";
import { provideSmartValidators } from "@ebdev/ngx-smart-validators";

export const appConfig: ApplicationConfig = {
  providers: [
    provideSmartValidators({
      licenseKey: environment.smartValidatorsLicense,
      messages: { strictEmail: "Enter a work email address." },
    }),
  ],
};
```

License verification is offline. Signed keys may be restricted by hostname and
expiry date; local development hosts always work. An invalid or expired key
falls back to the free tier without breaking the form.

## Validator catalog

### Free

- Basics: `requiredTrimmed`, `range`, `number`, `integer`, `decimal`,
  `greaterThan`, `lessThan`, `alpha`, `alphanumeric`, `noWhitespace`
- Strings: `regex`, `startsWith`, `endsWith`, `includes`, `url`, `strictEmail`
- Dates: `validDate`, `minDate`, `maxDate`, `pastDate`, `futureDate`
- Formats: `phone`, `uuid`, `json`, `base64`, `hexColor`, `ipAddress`,
  `latitude`, `longitude`
- Groups and utilities: `matchFields`, `withMessage`

### Pro

- Configurable `password` rule engine
- `creditCard` with Luhn checking and card-brand detection, and `iban`
- `minAge` and `maxAge`
- `dateRange`, `requiredIf`, `atLeastOne`, and `allOrNone`
- Accurate international `phoneNumber` from `@ebdev/ngx-smart-validators/phone`

Install `libphonenumber-js` when using the optional phone entry point:

```bash
npm install libphonenumber-js
```

```typescript
import { phoneNumber } from "@ebdev/ngx-smart-validators/phone";
```

## Error shape

Every validator returns Angular `ValidationErrors` using a predictable object:

```typescript
{
  minDate: {
    actual: '2025-01-01',
    min: '2026-01-01',
    message: 'Date must be on or after 2026-01-01.'
  }
}
```

Use `withMessage(validator, 'Custom message')` for one control, or configure
global messages with `provideSmartValidators`.

## Compatibility

| Package                           | Supported Angular      |
| --------------------------------- | ---------------------- |
| `@ebdev/ngx-smart-validators` 0.x | 17, 18, 19, 20, 21, 22 |

The package is published in Angular partial-Ivy format.

## License

The free tier may be used in commercial applications. Pro validators require a
purchased signed key. See the bundled license agreement for complete terms.
