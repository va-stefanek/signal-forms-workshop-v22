import { apply, email, maxLength, minLength, pattern, required, schema } from '@angular/forms/signals';
import { AttendeeForm, RegistrationForm } from './registration-form.model';

export const attendeeSchema = schema<AttendeeForm>((a) => {
  required(a.firstName, { message: 'First name is required' });
  required(a.lastName, { message: 'Last name is required' });
  required(a.email, { message: 'Email is required' });
  email(a.email, { message: 'Enter a valid email address' });
  required(a.username, { message: 'Username is required' });
  minLength(a.username, 3);
  maxLength(a.username, 20);
  pattern(a.username, /^[a-z0-9_]+$/, { message: 'Use lowercase letters, digits and _ only' });
});

export const registrationSchema = schema<RegistrationForm>((f) => {
  apply(f.attendee, attendeeSchema);
});
