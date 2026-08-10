import { InjectionToken, Provider } from '@angular/core';

import {
  DEFAULT_VALIDATION_MESSAGES,
  ValidationMessages,
} from './default-messages';

export const NGX_VALIDATION_MESSAGES =
  new InjectionToken<ValidationMessages>('NGX_VALIDATION_MESSAGES', {
    providedIn: 'root',
    factory: () => DEFAULT_VALIDATION_MESSAGES,
  });

export function provideValidationMessages(
  overrides: Partial<ValidationMessages>,
): Provider {
  return {
    provide: NGX_VALIDATION_MESSAGES,
    useValue: Object.freeze({
      ...DEFAULT_VALIDATION_MESSAGES,
      ...overrides,
    }),
  };
}
