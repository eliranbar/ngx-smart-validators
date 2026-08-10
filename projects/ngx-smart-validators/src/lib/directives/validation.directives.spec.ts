import { FormControl, FormGroup } from '@angular/forms';

import {
  NgvEnumDirective,
  NgvLowercaseDirective,
  NgvMatchFieldsDirective,
  NgvRangeDirective,
} from './validation.directives';

describe('validation directives', () => {
  it('rebuilds a validator and notifies Angular when an input changes', () => {
    const directive = new NgvRangeDirective();
    const changed = jasmine.createSpy('changed');
    directive.registerOnValidatorChange(changed);

    directive.ngvRange = [1, 3];

    expect(changed).toHaveBeenCalledOnceWith();
    expect(directive.validate(new FormControl(2))).toBeNull();
    expect(directive.validate(new FormControl(4))?.['range']).toBeDefined();
  });

  it('supports validators attached to a form group', () => {
    const directive = new NgvMatchFieldsDirective();
    directive.ngvMatchFields = ['password', 'confirmation'];
    const form = new FormGroup({
      password: new FormControl('secret'),
      confirmation: new FormControl('different'),
    });

    expect(directive.validate(form)?.['matchFields']).toBeDefined();
    form.controls.confirmation.setValue('secret');
    expect(directive.validate(form)).toBeNull();
  });

  it('auto-corrects lowercase input values', () => {
    const control = new FormControl('Hi');
    const directive = new NgvLowercaseDirective();
    directive.ngvLowercase = true;
    directive.validate(control);

    const input = {
      value: 'Hi',
      selectionStart: 2,
      setSelectionRange: jasmine.createSpy('setSelectionRange'),
    };
    directive.onInput({ target: input } as unknown as Event);

    expect(control.value).toBe('hi');
    expect(input.value).toBe('hi');
    expect(input.setSelectionRange).toHaveBeenCalledWith(2, 2);
    expect(directive.validate(control)).toBeNull();
  });

  it('leaves values untouched while the correcting directive is disabled', () => {
    const control = new FormControl('Hi');
    const directive = new NgvLowercaseDirective();
    directive.ngvLowercase = false;
    directive.validate(control);

    const input = { value: 'Hi', selectionStart: 2, setSelectionRange: () => undefined };
    directive.onInput({ target: input } as unknown as Event);

    expect(control.value).toBe('Hi');
    expect(directive.validate(control)).toBeNull();
  });

  it('limits enum values from a comma-separated list', () => {
    const directive = new NgvEnumDirective();
    directive.ngvEnum = 'red, green, blue';

    expect(directive.validate(new FormControl('green'))).toBeNull();
    expect(directive.validate(new FormControl('yellow'))?.['oneOf']).toBeDefined();
  });
});
