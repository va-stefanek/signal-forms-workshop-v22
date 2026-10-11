import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideSignalFormsConfig } from '@angular/forms/signals';
import { fakeBackend } from './api/fake-backend';

/**
 * TODO 5.3: CSS classes for every [formField] element
 *   'is-invalid' when touched and invalid, 'is-valid' when touched, valid and not pending.
 *   Each predicate receives the FormFieldBinding: read the field state with binding.state().
 */
export const FORM_FIELD_CLASSES = provideSignalFormsConfig({
  classes: {},
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([fakeBackend])),
    FORM_FIELD_CLASSES,
    // STRETCH 5.5 (exercises/step-5.md, experimental): provideExperimentalWebMcpForms() here,
    // plus experimentalWebMcpTool in the newsletter form (newsletter/newsletter-signup.ts)
  ],
};
