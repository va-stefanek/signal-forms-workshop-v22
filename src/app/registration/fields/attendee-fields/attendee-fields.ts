import { Component, inject, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { RegistrationApi } from '../../../api/registration-api';
import { FieldErrors } from '../../../shared/field-errors/field-errors';
import { HINT } from '../../../shared/hint';
import { PhoneInput } from '../../../shared/phone-input/phone-input';
import { AttendeeForm } from '../../form/registration-form.model';

/**
 * Task 4.2 (exercises/step-4.md). Subform: renders a portion of the parent's field tree, owns no state of its own.
 * FormField in imports is Task 1.3: without it [formField] is an unknown property (NG8002).
 */
@Component({
  selector: 'app-attendee-fields',
  imports: [FormField, FieldErrors, PhoneInput],
  templateUrl: './attendee-fields.html',
})
export class AttendeeFields {
  protected readonly HINT = HINT;
  private readonly api = inject(RegistrationApi);
  readonly attendee = input.required<FieldTree<AttendeeForm>>();

  /** Task 3.7 (exercises/step-3.md): re-run the async username check without changing the value */
  recheckUsername(): void {
    this.attendee().username().reloadValidation();
  }

  /** Demo for reloadValidation(): the value did not change, the server state did */
  async simulateUsernameTakenElsewhere(): Promise<void> {
    await this.api.takeUsername(this.attendee().username().value());
    this.recheckUsername();
  }
}
