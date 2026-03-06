import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './layouts/auth/auth.interceptor';
import { ConfirmationService, MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    MessageService,
    ConfirmationService,
    provideRouter(routes),
  provideAnimations(),
  
    providePrimeNG({
            theme: {
                preset: Aura,
                 options: {
                 darkModeSelector: false,  // Désactive mode sombre automatique
                 cssLayer: false,          // Évite conflits avec Tailwind
                 prefix: 'p',              // Préfixe par défaut (sécurité)
                 presetTheme: 'light'      // Force le thème clair
               }
            }
        }),
  
  provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
