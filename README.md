# ngx-smart-validators

Every validator Angular forms should have shipped with — tree-shakeable, for
reactive and template-driven forms, Angular 17–22.

[![npm version](https://img.shields.io/npm/v/%40ebdev%2Fngx-smart-validators)](https://www.npmjs.com/package/@ebdev/ngx-smart-validators)
[![npm downloads](https://img.shields.io/npm/dm/%40ebdev%2Fngx-smart-validators)](https://www.npmjs.com/package/@ebdev/ngx-smart-validators)
![Angular 17–22](https://img.shields.io/badge/Angular-17%E2%80%9322-dd0031)

[Live demo](https://ngx-smart-validators.ebdev-design.com) ·
[Product page](https://www.ebdev-design.com/products/ngx-smart-validators) ·
[npm](https://www.npmjs.com/package/@ebdev/ngx-smart-validators)

## Install

```bash
npm install @ebdev/ngx-smart-validators
```

## Quick start

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
so they compose cleanly with Angular's `Validators.required`. Every validator
returns a predictable error object, and the `ngvMessage` pipe
(`ValidationMessagePipe`) turns errors into readable messages.

## Why this exists

Angular ships `required`, `min`, `max`, `email` and `pattern` — and stops there.
Every form-heavy application ends up hand-writing the same phone, date-range,
password and cross-field validators, each with its own error shape and no
message layer. This package is that missing set.

## Free vs Pro

| Tier               | Validators                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Free**           | `requiredTrimmed`, `range`, `number`, `integer`, `decimal`, `greaterThan`, `lessThan`, `alpha`, `alphanumeric`, `noWhitespace`, `regex`, `startsWith`, `endsWith`, `includes`, `url`, `strictEmail`, `validDate`, `minDate`, `maxDate`, `pastDate`, `futureDate`, `phone`, `uuid`, `json`, `base64`, `hexColor`, `ipAddress`, `latitude`, `longitude`, `matchFields`, `withMessage` |
| **Pro** ($9.99/yr) | configurable `password` rule engine, `creditCard` (Luhn + brand detection), `iban`, `minAge`, `maxAge`, `dateRange`, `requiredIf`, `atLeastOne`, `allOrNone`, international `phoneNumber` (via `@ebdev/ngx-smart-validators/phone`)                                                                                                                                                 |

The free tier is a complete validation library for most forms — Pro adds the
password rule engine, financial formats, age and cross-field conditions, and
libphonenumber-backed international phone validation.

Licence verification is **offline**: signed Ed25519 keys, domain-bound, no
licence server, no telemetry. An invalid or expired key falls back to the free
tier without breaking the form.

Full API, error shapes and configuration:
[`projects/ngx-smart-validators/README.md`](projects/ngx-smart-validators/README.md).

## Repository layout

- `projects/ngx-smart-validators` — the publishable Angular 17–22 library
- `projects/demo` — interactive free/Pro validator showcase
- `tools/generate-license.mjs` — offline Ed25519 license issuer

## Development

```bash
npm start             # serve the demo
npm run build         # build library and demo
npm run build:lib     # build the publishable package
npm test              # run library tests
npm run license -- --licensee "Acme" --domains "acme.com,*.acme.com"
npm run pack:dry-run  # inspect npm publish contents without publishing
```

## Licensing

This project is source-available. The free validators may be used in commercial
applications; Pro validators require a signed license. See [`LICENSE`](LICENSE).
