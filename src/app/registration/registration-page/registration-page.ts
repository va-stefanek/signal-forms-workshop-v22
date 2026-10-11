import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { FormField, FormRoot, apply, disabled, form } from '@angular/forms/signals';
import { Agenda, Registration } from '../../api/models';
import { RegistrationApi } from '../../api/registration-api';
import { FieldErrors } from '../../shared/field-errors/field-errors';
import { AgendaPicker } from '../agenda-picker/agenda-picker';
import { RegistrationForm, domainToForm, emptyRegistrationForm, formToDomain } from '../form/registration-form.model';
import { registrationSchema } from '../form/registration.schema';
import { serverErrorsToTree } from '../form/server-errors';

@Component({
  selector: 'app-registration-page',
  imports: [FormField, FormRoot, JsonPipe, FieldErrors, AgendaPicker],
  templateUrl: './registration-page.html',
})
export class RegistrationPage {
  private readonly api = inject(RegistrationApi);

  /** null = new registration, otherwise the id to edit (try "42") */
  readonly registrationId = signal<string | null>(null);
  readonly lastSaved = signal<Registration | null>(null);

  readonly agenda = httpResource<Agenda>(() => '/api/agenda');
  readonly registration = httpResource<Registration>(() => {
    const id = this.registrationId();
    return id ? `/api/registrations/${id}` : undefined;
  });

  readonly loading = computed(() => this.agenda.isLoading() || this.registration.isLoading());

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

  readonly registrationForm = form(
    this.model,
    (f) => {
      disabled(f, { when: () => this.loading() });
      apply(f, registrationSchema);
    },
    {
      submission: {
        action: async (f) => {
          try {
            const saved = await this.api.save(formToDomain(f().value()));
            this.lastSaved.set(saved);
            this.registrationId.set(saved.id);
            return null;
          } catch (error) {
            return serverErrorsToTree(error, f);
          }
        },
        onInvalid: (f) => {
          f().errorSummary()[0]?.fieldTree().focusBoundControl();
        },
      },
    },
  );

  readonly domainPreview = computed(() => formToDomain(this.model()));

  /** Errors that belong to the whole form (e.g. server unavailable) */
  readonly formErrors = computed(() =>
    this.registrationForm().errors().filter((e) => e.fieldTree === this.registrationForm),
  );

  recheckUsername(): void {
    this.registrationForm.attendee.username().reloadValidation();
  }

  /** Demo for reloadValidation(): the value did not change, the server state did */
  async simulateUsernameTakenElsewhere(): Promise<void> {
    await this.api.takeUsername(this.registrationForm.attendee.username().value());
    this.recheckUsername();
  }
}
