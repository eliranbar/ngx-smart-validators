import { ValidatorFn } from '@angular/forms';
import {
  allOrNone,
  alpha,
  alphanumeric,
  atLeastOne,
  base64,
  creditCard,
  dateRange,
  decimal,
  endsWith,
  float,
  futureDate,
  greaterThan,
  hexColor,
  iban,
  includes,
  int,
  integer,
  ipAddress,
  json,
  latitude,
  lessThan,
  longitude,
  lowercase,
  matchFields,
  maxAge,
  maxDate,
  minAge,
  minDate,
  noWhitespace,
  number,
  oneOf,
  password,
  pastDate,
  phone,
  range,
  regex,
  requiredIf,
  requiredTrimmed,
  startsWith,
  strictEmail,
  ucfirst,
  uppercase,
  url,
  uuid,
  validDate,
  withMessage,
} from 'ngx-smart-validators';
import { phoneNumber } from 'ngx-smart-validators/phone';

export type ValidatorTier = 'free' | 'pro';

/** A single-control validator rendered as one live input in the catalog. */
export interface CatalogEntry {
  /** Control name inside the catalog form, and the search key. */
  readonly key: string;
  /** Source-accurate call, shown above the input. */
  readonly signature: string;
  readonly tier: ValidatorTier;
  readonly hint: string;
  readonly placeholder: string;
  readonly validator: ValidatorFn;
  readonly type?: 'text' | 'date' | 'password';
  /** Values are rewritten as the user types by the matching directive. */
  readonly autoCorrect?: boolean;
}

export interface CatalogGroup {
  readonly name: string;
  readonly entries: readonly CatalogEntry[];
}

/** Cross-field validators need a small group of their own to be meaningful. */
export interface CrossFieldDemo {
  readonly key: string;
  readonly signature: string;
  readonly tier: ValidatorTier;
  readonly hint: string;
  readonly fields: readonly { name: string; label: string; type: 'text' | 'date' | 'password' | 'checkbox'; placeholder?: string }[];
}

export const CATALOG_GROUPS: readonly CatalogGroup[] = [
  {
    name: 'Basics',
    entries: [
      {
        key: 'requiredTrimmed',
        signature: 'requiredTrimmed()',
        tier: 'free',
        hint: 'Rejects empty and whitespace-only values.',
        placeholder: 'Try typing only spaces',
        validator: requiredTrimmed(),
      },
      {
        key: 'range',
        signature: 'range(1, 100)',
        tier: 'free',
        hint: 'Numeric value inside an inclusive range.',
        placeholder: '1 – 100',
        validator: range(1, 100),
      },
      {
        key: 'number',
        signature: 'number()',
        tier: 'free',
        hint: 'Any finite number.',
        placeholder: '12.5',
        validator: number(),
      },
      {
        key: 'integer',
        signature: 'integer()',
        tier: 'free',
        hint: 'Whole numbers only, no correction.',
        placeholder: '-12',
        validator: integer(),
      },
      {
        key: 'decimal',
        signature: 'decimal(2)',
        tier: 'free',
        hint: 'At most two decimal places.',
        placeholder: '2.25',
        validator: decimal(2),
      },
      {
        key: 'greaterThan',
        signature: 'greaterThan(0)',
        tier: 'free',
        hint: 'Strictly greater than the bound.',
        placeholder: '0.01',
        validator: greaterThan(0),
      },
      {
        key: 'lessThan',
        signature: 'lessThan(100)',
        tier: 'free',
        hint: 'Strictly less than the bound.',
        placeholder: '99',
        validator: lessThan(100),
      },
      {
        key: 'alpha',
        signature: 'alpha()',
        tier: 'free',
        hint: 'Unicode letters only.',
        placeholder: 'Élan',
        validator: alpha(),
      },
      {
        key: 'alphanumeric',
        signature: 'alphanumeric()',
        tier: 'free',
        hint: 'Letters and digits, no symbols.',
        placeholder: 'ngx42',
        validator: alphanumeric(),
      },
      {
        key: 'noWhitespace',
        signature: 'noWhitespace()',
        tier: 'free',
        hint: 'Any whitespace character is rejected.',
        placeholder: 'no-spaces-here',
        validator: noWhitespace(),
      },
    ],
  },
  {
    name: 'Text case and numeric correction',
    entries: [
      {
        key: 'lowercase',
        signature: 'lowercase() + ngvLowercase',
        tier: 'free',
        hint: 'Uppercase letters are converted as you type.',
        placeholder: 'Type MiXeD case',
        validator: lowercase(),
        autoCorrect: true,
      },
      {
        key: 'uppercase',
        signature: 'uppercase() + ngvUppercase',
        tier: 'free',
        hint: 'Lowercase letters are converted as you type.',
        placeholder: 'Type MiXeD case',
        validator: uppercase(),
        autoCorrect: true,
      },
      {
        key: 'ucfirst',
        signature: 'ucfirst() + ngvUcfirst',
        tier: 'free',
        hint: 'Capitalizes the first character only.',
        placeholder: 'jane doe',
        validator: ucfirst(),
        autoCorrect: true,
      },
      {
        key: 'int',
        signature: 'int() + ngvInt',
        tier: 'free',
        hint: 'Strips non-digits and truncates decimals (52.7 becomes 52).',
        placeholder: '52.7',
        validator: int(),
        autoCorrect: true,
      },
      {
        key: 'float',
        signature: 'float() + ngvFloat',
        tier: 'free',
        hint: 'Keeps digits, one sign, and a single decimal point.',
        placeholder: '52.12.3',
        validator: float(),
        autoCorrect: true,
      },
      {
        key: 'oneOf',
        signature: "oneOf(['draft', 'published', 'archived'])",
        tier: 'free',
        hint: 'Limits input to the offered values.',
        placeholder: 'draft | published | archived',
        validator: oneOf(['draft', 'published', 'archived']),
      },
    ],
  },
  {
    name: 'Strings',
    entries: [
      {
        key: 'regex',
        signature: 'regex(/^SKU-\\d{4}$/)',
        tier: 'free',
        hint: 'Stateful flags are stripped so results stay stable.',
        placeholder: 'SKU-1234',
        validator: regex(/^SKU-\d{4}$/),
      },
      {
        key: 'startsWith',
        signature: "startsWith('ngx-')",
        tier: 'free',
        hint: 'Value must begin with the given prefix.',
        placeholder: 'ngx-smart-validators',
        validator: startsWith('ngx-'),
      },
      {
        key: 'endsWith',
        signature: "endsWith('.ts')",
        tier: 'free',
        hint: 'Value must end with the given suffix.',
        placeholder: 'validators.ts',
        validator: endsWith('.ts'),
      },
      {
        key: 'includes',
        signature: "includes('smart')",
        tier: 'free',
        hint: 'Value must contain the fragment.',
        placeholder: 'ngx-smart-validators',
        validator: includes('smart'),
      },
      {
        key: 'url',
        signature: 'url()',
        tier: 'free',
        hint: 'Absolute http or https URLs with a hostname.',
        placeholder: 'https://example.com/path',
        validator: url(),
      },
      {
        key: 'strictEmail',
        signature: 'strictEmail()',
        tier: 'free',
        hint: 'Requires a real top-level domain.',
        placeholder: 'person@example.com',
        validator: strictEmail(),
      },
    ],
  },
  {
    name: 'Dates',
    entries: [
      {
        key: 'validDate',
        signature: 'validDate()',
        tier: 'free',
        hint: 'ISO 8601 dates, rejecting impossible calendar days.',
        placeholder: '2026-02-30 is invalid',
        validator: validDate(),
        type: 'date',
      },
      {
        key: 'minDate',
        signature: "minDate('2020-01-01')",
        tier: 'free',
        hint: 'On or after the boundary date.',
        placeholder: '2020-01-01',
        validator: minDate('2020-01-01'),
        type: 'date',
      },
      {
        key: 'maxDate',
        signature: "maxDate('2030-12-31')",
        tier: 'free',
        hint: 'On or before the boundary date.',
        placeholder: '2030-12-31',
        validator: maxDate('2030-12-31'),
        type: 'date',
      },
      {
        key: 'pastDate',
        signature: 'pastDate()',
        tier: 'free',
        hint: 'Strictly before now, or before a reference date.',
        placeholder: 'Yesterday or earlier',
        validator: pastDate(),
        type: 'date',
      },
      {
        key: 'futureDate',
        signature: 'futureDate()',
        tier: 'free',
        hint: 'Strictly after now, or after a reference date.',
        placeholder: 'Tomorrow or later',
        validator: futureDate(),
        type: 'date',
      },
    ],
  },
  {
    name: 'Formats',
    entries: [
      {
        key: 'phone',
        signature: "phone('international')",
        tier: 'free',
        hint: 'Dependency-free phone check. US, CA, GB and IL are also supported.',
        placeholder: '+15550142000',
        validator: phone('international'),
      },
      {
        key: 'uuid',
        signature: 'uuid()',
        tier: 'free',
        hint: 'UUID versions 1 through 5.',
        placeholder: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
        validator: uuid(),
      },
      {
        key: 'json',
        signature: 'json()',
        tier: 'free',
        hint: 'Anything JSON.parse accepts.',
        placeholder: '{ "ok": true }',
        validator: json(),
      },
      {
        key: 'base64',
        signature: 'base64()',
        tier: 'free',
        hint: 'Standard Base64 including padding rules.',
        placeholder: 'bmd4LXNtYXJ0',
        validator: base64(),
      },
      {
        key: 'hexColor',
        signature: 'hexColor()',
        tier: 'free',
        hint: '3, 4, 6 or 8 digit hex colors.',
        placeholder: '#5b8def',
        validator: hexColor(),
      },
      {
        key: 'ipAddress',
        signature: 'ipAddress()',
        tier: 'free',
        hint: 'IPv4 or IPv6. Pass "v4" or "v6" to narrow it.',
        placeholder: '192.168.0.1',
        validator: ipAddress(),
      },
      {
        key: 'latitude',
        signature: 'latitude()',
        tier: 'free',
        hint: 'Between -90 and 90.',
        placeholder: '32.0853',
        validator: latitude(),
      },
      {
        key: 'longitude',
        signature: 'longitude()',
        tier: 'free',
        hint: 'Between -180 and 180.',
        placeholder: '34.7818',
        validator: longitude(),
      },
    ],
  },
  {
    name: 'Pro',
    entries: [
      {
        key: 'password',
        signature: 'password({ minLength: 10, special: true })',
        tier: 'pro',
        hint: 'Configurable rule engine that reports every failed rule.',
        placeholder: 'Upper, lower, number and symbol',
        validator: password({ minLength: 10, special: true }),
        type: 'password',
      },
      {
        key: 'creditCard',
        signature: 'creditCard()',
        tier: 'pro',
        hint: 'Luhn checksum plus card-brand detection.',
        placeholder: '4242 4242 4242 4242',
        validator: creditCard(),
      },
      {
        key: 'iban',
        signature: 'iban()',
        tier: 'pro',
        hint: 'Country length table and MOD-97 checksum.',
        placeholder: 'DE89 3704 0044 0532 0130 00',
        validator: iban(),
      },
      {
        key: 'minAge',
        signature: 'minAge(18)',
        tier: 'pro',
        hint: 'Date of birth must be at least this old.',
        placeholder: 'Date of birth',
        validator: minAge(18),
        type: 'date',
      },
      {
        key: 'maxAge',
        signature: 'maxAge(120)',
        tier: 'pro',
        hint: 'Date of birth must be no older than this.',
        placeholder: 'Date of birth',
        validator: maxAge(120),
        type: 'date',
      },
      {
        key: 'phoneNumber',
        signature: "phoneNumber('IL')",
        tier: 'pro',
        hint: 'Metadata-accurate check from the ngx-smart-validators/phone entry point.',
        placeholder: '+972 50 123 4567',
        validator: phoneNumber('IL'),
      },
    ],
  },
  {
    name: 'Utilities',
    entries: [
      {
        key: 'withMessage',
        signature: "withMessage(strictEmail(), 'Use your work email.')",
        tier: 'free',
        hint: 'Wraps any validator and replaces its message.',
        placeholder: 'person@example.com',
        validator: withMessage(strictEmail(), 'Use your work email.'),
      },
    ],
  },
];

export const CROSS_FIELD_DEMOS: readonly CrossFieldDemo[] = [
  {
    key: 'matchFields',
    signature: "matchFields('password', 'confirmPassword')",
    tier: 'free',
    hint: 'Two controls must hold the same value.',
    fields: [
      { name: 'password', label: 'Password', type: 'password', placeholder: 'Secret' },
      { name: 'confirmPassword', label: 'Confirm password', type: 'password', placeholder: 'Repeat it' },
    ],
  },
  {
    key: 'dateRange',
    signature: "dateRange('start', 'end')",
    tier: 'pro',
    hint: 'The end date may not be earlier than the start date.',
    fields: [
      { name: 'start', label: 'Start date', type: 'date' },
      { name: 'end', label: 'End date', type: 'date' },
    ],
  },
  {
    key: 'requiredIf',
    signature: "requiredIf('company', 'businessAccount', true)",
    tier: 'pro',
    hint: 'A field becomes required only when another field matches a condition.',
    fields: [
      { name: 'businessAccount', label: 'Business account', type: 'checkbox' },
      { name: 'company', label: 'Company name', type: 'text', placeholder: 'Acme Inc.' },
    ],
  },
  {
    key: 'atLeastOne',
    signature: "atLeastOne('email', 'phone')",
    tier: 'pro',
    hint: 'At least one of the listed fields must be filled in.',
    fields: [
      { name: 'email', label: 'Email', type: 'text', placeholder: 'you@company.com' },
      { name: 'phone', label: 'Phone', type: 'text', placeholder: '+1 555 0142' },
    ],
  },
  {
    key: 'allOrNone',
    signature: "allOrNone('street', 'city')",
    tier: 'pro',
    hint: 'Fill in every field of the set, or leave all of them empty.',
    fields: [
      { name: 'street', label: 'Street', type: 'text', placeholder: '12 Rothschild Blvd' },
      { name: 'city', label: 'City', type: 'text', placeholder: 'Tel Aviv' },
    ],
  },
];

export const CROSS_FIELD_VALIDATORS: Readonly<Record<string, ValidatorFn>> = {
  matchFields: matchFields('password', 'confirmPassword'),
  dateRange: dateRange('start', 'end'),
  requiredIf: requiredIf('company', 'businessAccount', true),
  atLeastOne: atLeastOne('email', 'phone'),
  allOrNone: allOrNone('street', 'city'),
};
