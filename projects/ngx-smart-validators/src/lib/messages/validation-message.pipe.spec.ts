import { TestBed } from '@angular/core/testing';

import { ValidationMessagePipe } from './validation-message.pipe';
import { provideValidationMessages } from './validation-messages';

describe('ValidationMessagePipe', () => {
  it('returns the first message by default and every message in all mode', () => {
    TestBed.configureTestingModule({});
    const pipe = TestBed.runInInjectionContext(
      () => new ValidationMessagePipe(),
    );
    const errors = { requiredTrimmed: true, strictEmail: true };

    expect(pipe.transform(errors)).toBe('This field is required.');
    expect(pipe.transform(errors, 'all')).toEqual([
      'This field is required.',
      'Enter a valid email address.',
    ]);
  });

  it('supports string and formatter overrides', () => {
    TestBed.configureTestingModule({
      providers: [
        provideValidationMessages({
          range: (details) => {
            const { min, max } = details as { min: number; max: number };
            return `Use ${min} through ${max}.`;
          },
          requiredTrimmed: 'Please enter a value.',
        }),
      ],
    });
    const pipe = TestBed.runInInjectionContext(
      () => new ValidationMessagePipe(),
    );

    expect(pipe.transform({ requiredTrimmed: true })).toBe(
      'Please enter a value.',
    );
    expect(pipe.transform({ range: { min: 1, max: 3 } })).toBe(
      'Use 1 through 3.',
    );
  });
});
