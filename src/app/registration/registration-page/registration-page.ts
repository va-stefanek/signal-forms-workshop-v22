import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormField, email, form, maxLength, minLength, pattern, required } from '@angular/forms/signals';
import { Attendee } from '../../api/models';

/**
 * STEP 1: the form model IS the domain model (on purpose).
 * Step 2 shows where that stops working.
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
  imports: [FormField, JsonPipe],
  templateUrl: './registration-page.html',
})
export class RegistrationPage {
  protected readonly attendeeModel = signal<Attendee>({ ...EMPTY_ATTENDEE });

  readonly attendeeForm = form(this.attendeeModel, (a) => {
    required(a.firstName, { message: 'First name is required' });
    required(a.lastName, { message: 'Last name is required' });
    required(a.email, { message: 'Email is required' });
    email(a.email, { message: 'Enter a valid email address' });
    required(a.username, { message: 'Username is required' });
    minLength(a.username, 3);
    maxLength(a.username, 20);
    pattern(a.username, /^[a-z0-9_]+$/, { message: 'Use lowercase letters, digits and _ only' });
  });
}
