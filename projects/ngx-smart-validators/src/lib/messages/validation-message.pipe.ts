import { inject, Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

import {
  ValidationMessage,
  ValidationMessages,
} from './default-messages';
import { NGX_VALIDATION_MESSAGES } from './validation-messages';

export type ValidationMessageMode = 'first' | 'all';

@Pipe({
  name: 'ngvMessage',
  standalone: true,
  pure: true,
})
export class ValidationMessagePipe implements PipeTransform {
  private readonly messages = inject(NGX_VALIDATION_MESSAGES);

  transform(
    errors: ValidationErrors | null | undefined,
    mode?: 'first',
  ): string;
  transform(
    errors: ValidationErrors | null | undefined,
    mode: 'all',
  ): string[];
  transform(
    errors: ValidationErrors | null | undefined,
    mode: ValidationMessageMode = 'first',
  ): string | string[] {
    if (!errors) {
      return mode === 'all' ? [] : '';
    }

    const messages = Object.entries(errors).map(([key, details]) =>
      this.format(this.messages[key], details, key),
    );

    return mode === 'all' ? messages : (messages[0] ?? '');
  }

  private format(
    message: ValidationMessage | undefined,
    details: unknown,
    key: string,
  ): string {
    if (typeof message === 'function') {
      return message(details, key);
    }

    return message ?? this.humanize(key);
  }

  private humanize(key: string): string {
    const label = key
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .toLowerCase();

    return label ? `${label[0].toUpperCase()}${label.slice(1)}.` : '';
  }
}
