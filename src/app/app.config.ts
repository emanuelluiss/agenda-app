import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withHashLocation } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { MockBackendInterceptor } from './core/interceptors/mock-backend.interceptor';
import { LogService } from './core/services/log.service';
import { NotificationService } from './core/services/notification.service';
import { AgendaPreset } from './core/themes/agenda.preset';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    providePrimeNG({
        theme: {
            preset: AgendaPreset,
            options: {
                darkModeSelector: false,
            }
        }
    }),
    MessageService,
    ConfirmationService,
    { provide: HTTP_INTERCEPTORS, useClass: MockBackendInterceptor, multi: true },
    LogService,
    NotificationService
  ]
};
