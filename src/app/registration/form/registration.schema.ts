import { apply, email, maxLength, minLength, pattern, required, schema } from '@angular/forms/signals';
import { CompanyData } from '../../api/models';
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

  // TODO 3.1 cross-field: confirmEmail is required (message 'Repeat your email') and must equal email
  //          error kind: 'emailMismatch', message 'Emails do not match'
});

/**
 * TODO 3.5: company data rules (all required, nip = 10 digits, postalCode = 00-000)
 */
export const companySchema = schema<CompanyData>((c) => {});

export const registrationSchema = schema<RegistrationForm>((f) => {
  apply(f.attendee, attendeeSchema);

  // TODO 3.2 async: validateHttp on f.attendee.username
  //   GET /api/usernames/:name/availability -> { available: boolean }
  //   - skip the request (return undefined) unless the username matches /^[a-z0-9_]{3,20}$/
  //   - when editing (f.id has a value) add ?registrationId=<id> so your own username is available
  //   - debounce 400 ms
  //   - kinds: 'usernameTaken' when not available, 'usernameCheckFailed' on error

  // TODO 3.3 group rule: at least 2 sessions chosen in f.agenda (kind: 'minSessions')

  // TODO 3.4 payment:
  //   - method is required
  //   - card branch only when method === 'card': all required, number 16 digits, expiry MM/YY
  //   - transfer branch only when method === 'transfer': all required, IBAN /^PL\d{26}$/
  //   hint: applyWhenValue(f.payment, ...)

  // TODO 3.5 invoice: apply companySchema to f.invoice only when f.wantsInvoice is true
  //   hint: the condition lives in ANOTHER field, so it is applyWhen, not applyWhenValue
});
