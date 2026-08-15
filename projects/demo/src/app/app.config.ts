import { ApplicationConfig } from '@angular/core';
import { provideSmartValidators } from '@ebdev/ngx-smart-validators';
import { DEMO_LICENSE_KEY } from './demo-license';

export const appConfig: ApplicationConfig = {
  providers: [
    provideSmartValidators({ licenseKey: DEMO_LICENSE_KEY }),
  ],
};
