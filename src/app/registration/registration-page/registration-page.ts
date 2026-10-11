import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form } from '@angular/forms/signals';
import { Attendee } from '../../api/models';

/**
 * STEP 1: your first Signal Form.
 * For now the form model IS the domain model (`Attendee`), on purpose.
 */
export const EMPTY_ATTENDEE: Attendee = {
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  phone: null,
};

@Component({
  selector: 'app-registration-page',
  // TODO 1.3: import FormField so the template can use [formField]
  imports: [JsonPipe],
  templateUrl: './registration-page.html',
})
export class RegistrationPage {
  protected readonly attendeeModel = signal<Attendee>({ ...EMPTY_ATTENDEE });

  // TODO 1.1: add a schema function as the second argument of form():
  //   - firstName, lastName, email, username are required (with messages)
  //   - email has a valid email format
  //   - username: 3 to 20 characters, only /^[a-z0-9_]+$/
  readonly attendeeForm = form(this.attendeeModel);
}
