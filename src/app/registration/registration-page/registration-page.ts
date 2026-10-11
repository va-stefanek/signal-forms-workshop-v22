import { Component, computed, linkedSignal, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { FormField, disabled, form, apply } from '@angular/forms/signals';
import { Agenda, Registration } from '../../api/models';
import { FieldErrors } from '../../shared/field-errors/field-errors';
import { AgendaPicker } from '../agenda-picker/agenda-picker';
import { RegistrationForm, domainToForm, emptyRegistrationForm, formToDomain } from '../form/registration-form.model';
import { registrationSchema } from '../form/registration.schema';

@Component({
  selector: 'app-registration-page',
  imports: [FormField, JsonPipe, FieldErrors, AgendaPicker],
  templateUrl: './registration-page.html',
})
export class RegistrationPage {
  /** null = new registration, otherwise the id to edit (try "42") */
  readonly registrationId = signal<string | null>(null);

  readonly agenda = httpResource<Agenda>(() => '/api/agenda');
  readonly registration = httpResource<Registration>(() => {
    const id = this.registrationId();
    return id ? `/api/registrations/${id}` : undefined;
  });

  readonly loading = computed(() => this.agenda.isLoading() || this.registration.isLoading());

  /** Form model derived from API data, writable by the form */
  readonly model = linkedSignal<
    { agenda: Agenda | undefined; registration: Registration | undefined },
    RegistrationForm
  >({
    source: () => ({
      agenda: this.agenda.value(),
      registration: this.registrationId() ? this.registration.value() : undefined,
    }),
    computation: ({ agenda, registration }) => {
      const safeAgenda = agenda ?? { slots: [] };
      return registration ? domainToForm(registration, safeAgenda) : emptyRegistrationForm(safeAgenda);
    },
  });

  readonly registrationForm = form(this.model, (f) => {
    disabled(f, { when: () => this.loading() });
    apply(f, registrationSchema);
  });

  /** What would be sent to the API right now */
  readonly domainPreview = computed(() => formToDomain(this.model()));
}
