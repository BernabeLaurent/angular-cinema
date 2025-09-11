import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideAnimations} from '@angular/platform-browser/animations';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';

import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {AuthInterceptor} from './auth/auth.interceptor';
import {CustomDateAdapter} from './services/date-adapter.service';
import {CUSTOM_DATE_FORMATS} from './services/date-format.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    provideAnimations(),
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ]
};
