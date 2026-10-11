import { Component, computed, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { FormField, apply, form } from '@angular/forms/signals';
import { Agenda, Registration } from '../../api/models';
import { FieldErrors } from '../../shared/field-errors/field-errors';
import { AgendaPicker } from '../agenda-picker/agenda-picker';
import { RegistrationForm, emptyRegistrationForm, formToDomain } from '../form/registration-form.model';
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

  /**
   * TODO 2.4: replace this signal with a linkedSignal that is recomputed from
   * agenda.value() and (when registrationId is set) registration.value():
   *   registration loaded -> domainToForm(registration, agenda)
   *   otherwise           -> emptyRegistrationForm(agenda ?? { slots: [] })
   */
  readonly model = signal<RegistrationForm>(emptyRegistrationForm({ slots: [] }));

  // TODO 2.5: disable the whole form while loading() is true (use { when })
  readonly registrationForm = form(this.model, (f) => {
    apply(f, registrationSchema);
  });

  /** What would be sent to the API right now */
  readonly domainPreview = computed(() => formToDomain(this.model()));
}
