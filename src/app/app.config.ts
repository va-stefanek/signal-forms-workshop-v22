import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideExperimentalWebMcpForms, provideSignalFormsConfig } from '@angular/forms/signals';
import { fakeBackend } from './api/fake-backend';

/** Task 5.3 (exercises/step-5.md): CSS classes for every [formField] element; each predicate gets the binding, read state() from it */
export const FORM_FIELD_CLASSES = provideSignalFormsConfig({
  classes: {
    'is-invalid': ({ state }) => state().touched() && state().invalid(),
    'is-valid': ({ state }) => state().touched() && state().valid() && !state().pending(),
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([fakeBackend])),
    FORM_FIELD_CLASSES,
    // STRETCH 5.5 (exercises/step-5.md, experimental): exposes forms that declare experimentalWebMcpTool (the newsletter form) to in-browser agents
    provideExperimentalWebMcpForms(),
  ],
};
