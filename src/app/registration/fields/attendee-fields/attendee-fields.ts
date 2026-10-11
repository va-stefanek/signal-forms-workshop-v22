import { Component, inject, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { RegistrationApi } from '../../../api/registration-api';
import { FieldErrors } from '../../../shared/field-errors/field-errors';
import { PhoneInput } from '../../../shared/phone-input/phone-input';
import { AttendeeForm } from '../../form/registration-form.model';

/**
 * Subform: renders a portion of the parent's field tree, owns no state of its own.
 * TODO 5.4: show a required mark (<span class="required-mark" aria-hidden="true">*</span>) in labels of
 *           required fields, read from the field state. Show HINT metadata in a <span class="hint">:
 *           add one under username, and replace the hard-coded phone hint.
 */
@Component({
  selector: 'app-attendee-fields',
  imports: [FormField, FieldErrors, PhoneInput],
  templateUrl: './attendee-fields.html',
})
export class AttendeeFields {
  private readonly api = inject(RegistrationApi);
  readonly attendee = input.required<FieldTree<AttendeeForm>>();

  recheckUsername(): void {
    this.attendee().username().reloadValidation();
  }

  /** Demo for reloadValidation(): the value did not change, the server state did */
  async simulateUsernameTakenElsewhere(): Promise<void> {
    await this.api.takeUsername(this.attendee().username().value());
    this.recheckUsername();
  }
}
