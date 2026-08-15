import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  creditCard,
  matchFields,
  NGV_DIRECTIVES,
  password,
  phone,
  requiredIf,
  strictEmail,
  url,
  validDate,
  ValidationMessagePipe as NgvMessagePipe,
} from '@ebdev/ngx-smart-validators';
import { phoneNumber } from '@ebdev/ngx-smart-validators/phone';

import {
  CATALOG_GROUPS,
  CatalogEntry,
  CatalogGroup,
  CROSS_FIELD_DEMOS,
  CROSS_FIELD_VALIDATORS,
  CrossFieldDemo,
} from './validator-catalog';

type DemoTab = 'free' | 'pro' | 'catalog' | 'cross';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, NgvMessagePipe, ...NGV_DIRECTIVES],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  /** Mobile nav. Collapsed into a menu below 620px, same as the marketing site. */
  protected menuOpen = false;

  protected activeDemo: DemoTab = 'free';
  protected freeSubmitted = false;
  protected proSubmitted = false;
  protected catalogFilter = '';

  protected readonly freeForm = this.fb.group(
    {
      email: ['', [Validators.required, strictEmail()]],
      website: ['', [Validators.required, url()]],
      phone: ['', phone()],
      date: ['', [Validators.required, validDate()]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: matchFields('password', 'confirmPassword') },
  );

  protected readonly proForm = this.fb.group(
    {
      password: ['', [Validators.required, password()]],
      phone: ['', [Validators.required, phoneNumber()]],
      card: ['', [Validators.required, creditCard()]],
      businessAccount: false,
      company: '',
    },
    { validators: requiredIf('company', 'businessAccount', true) },
  );

  protected readonly catalogGroups = CATALOG_GROUPS;
  protected readonly catalogEntryCount = CATALOG_GROUPS.reduce(
    (total, group) => total + group.entries.length,
    0,
  );

  protected readonly catalogForm = new FormGroup(
    Object.fromEntries(
      CATALOG_GROUPS.flatMap((group) => group.entries).map((entry) => [
        entry.key,
        new FormControl('', { nonNullable: true, validators: entry.validator }),
      ]),
    ),
  );

  protected readonly crossFieldDemos = CROSS_FIELD_DEMOS;

  protected readonly crossFieldForms: Readonly<Record<string, FormGroup>> =
    Object.fromEntries(
      CROSS_FIELD_DEMOS.map((demo) => [
        demo.key,
        new FormGroup(
          Object.fromEntries(
            demo.fields.map((field) => [
              field.name,
              new FormControl(field.type === 'checkbox' ? false : '', {
                nonNullable: true,
              }),
            ]),
          ),
          { validators: CROSS_FIELD_VALIDATORS[demo.key] },
        ),
      ]),
    );

  /** Every validator the package exports, grouped for the reference index. */
  protected readonly validatorIndex: {
    name: string;
    items: { key: string; tier: 'free' | 'pro' }[];
  }[] = [
    ...CATALOG_GROUPS.map((group) => ({
      name: group.name,
      items: group.entries.map((entry) => ({ key: entry.key, tier: entry.tier })),
    })),
    {
      name: 'Cross-field',
      items: CROSS_FIELD_DEMOS.map((demo) => ({ key: demo.key, tier: demo.tier })),
    },
  ];

  protected readonly totalValidatorCount =
    CATALOG_GROUPS.reduce((total, group) => total + group.entries.length, 0) +
    CROSS_FIELD_DEMOS.length;

  protected readonly templateExample = `<input
  type="email"
  name="email"
  [(ngModel)]="email"
  ngvStrictEmail
  #emailControl="ngModel"
/>
@if (emailControl.errors; as errors) {
  <p>{{ errors | ngvMessage }}</p>
}`;

  protected readonly installCode = `npm install @ebdev/ngx-smart-validators`;
  protected readonly setupCode = `import { provideSmartValidators } from '@ebdev/ngx-smart-validators';

export const appConfig: ApplicationConfig = {
  providers: [
    provideSmartValidators({ licenseKey: DEMO_LICENSE_KEY })
  ]
};`;

  protected readonly reactiveCode = `this.form = this.fb.group({
  email: ['', [Validators.required, strictEmail()]],
  website: ['', url()],
  phone: ['', phone()],
  password: [''],
  confirmPassword: ['']
}, { validators: matchFields('password', 'confirmPassword') });`;

  protected get filteredCatalog(): CatalogGroup[] {
    const term = this.catalogFilter.trim().toLowerCase();
    if (!term) {
      return [...this.catalogGroups];
    }

    return this.catalogGroups
      .map((group) => ({
        name: group.name,
        entries: group.entries.filter(
          (entry) =>
            entry.key.toLowerCase().includes(term) ||
            entry.signature.toLowerCase().includes(term) ||
            entry.hint.toLowerCase().includes(term) ||
            group.name.toLowerCase().includes(term),
        ),
      }))
      .filter((group) => group.entries.length > 0);
  }

  protected get filteredCatalogCount(): number {
    return this.filteredCatalog.reduce(
      (total, group) => total + group.entries.length,
      0,
    );
  }

  protected selectDemo(demo: DemoTab): void {
    this.activeDemo = demo;
  }

  protected updateCatalogFilter(event: Event): void {
    this.catalogFilter = (event.target as HTMLInputElement).value;
  }

  protected catalogControl(entry: CatalogEntry): AbstractControl {
    return this.catalogForm.controls[entry.key];
  }

  protected crossFieldControl(demo: CrossFieldDemo, field: string): AbstractControl {
    return this.crossFieldForms[demo.key].controls[field];
  }

  protected crossFieldErrors(demo: CrossFieldDemo): ValidationErrors | null {
    const form = this.crossFieldForms[demo.key];
    return form.dirty || form.touched ? form.errors : null;
  }

  protected resetCatalog(): void {
    this.catalogForm.reset();
    for (const demo of this.crossFieldDemos) {
      this.crossFieldForms[demo.key].reset();
    }
  }

  protected submitFree(): void {
    this.freeSubmitted = true;
    this.freeForm.markAllAsTouched();
  }

  protected submitPro(): void {
    this.proSubmitted = true;
    this.proForm.markAllAsTouched();
  }

  protected resetForms(): void {
    this.freeSubmitted = false;
    this.proSubmitted = false;
    this.freeForm.reset();
    this.proForm.reset();
  }

  protected isInvalid(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  protected isValid(control: AbstractControl): boolean {
    return control.valid && control.value !== '' && (control.dirty || control.touched);
  }

  protected confirmPasswordInvalid(): boolean {
    const control = this.freeForm.controls.confirmPassword;
    return (
      this.isInvalid(control) ||
      (!!this.freeForm.errors?.['matchFields'] && (control.dirty || control.touched))
    );
  }

  protected companyInvalid(): boolean {
    const control = this.proForm.controls.company;
    return (
      this.isInvalid(control) ||
      (!!this.proForm.errors?.['requiredIf'] && (control.dirty || control.touched))
    );
  }

  protected errorFor(control: AbstractControl): string {
    const errors: ValidationErrors | null = control.errors;
    if (!errors) return '';
    if (errors['required'] || errors['requiredIf']) return 'This field is required.';
    if (errors['strictEmail'] || errors['email']) return 'Enter a valid email address.';
    if (errors['url']) return 'Use a complete URL, including https://.';
    if (errors['phone']) return 'Enter a valid phone number.';
    if (errors['phoneNumber']) return 'Enter a valid international phone number.';
    if (errors['validDate'] || errors['date']) return 'Enter a valid date.';
    if (errors['minlength']) return 'Use at least 8 characters.';
    if (errors['password']) return 'Use upper, lower, number, and symbol.';
    if (errors['creditCard']) return 'Enter a valid card number.';
    return 'Check this value and try again.';
  }
}
