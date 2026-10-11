import {
  apply,
  applyEach,
  applyWhen,
  applyWhenValue,
  email,
  maxLength,
  minLength,
  pattern,
  required,
  schema,
  validate,
  validateHttp,
} from '@angular/forms/signals';
import { CompanyData, Person } from '../../api/models';
import { AttendeeForm, RegistrationForm } from './registration-form.model';

export const MAX_COMPANIONS = 3;

/** Reused for the attendee AND every companion */
export const personSchema = schema<Person>((p) => {
  required(p.firstName, { message: 'First name is required' });
  required(p.lastName, { message: 'Last name is required' });
  required(p.email, { message: 'Email is required' });
  email(p.email, { message: 'Enter a valid email address' });
});

export const attendeeSchema = schema<AttendeeForm>((a) => {
  apply(a, personSchema);
  required(a.username, { message: 'Username is required' });
  minLength(a.username, 3);
  maxLength(a.username, 20);
  pattern(a.username, /^[a-z0-9_]+$/, { message: 'Use lowercase letters, digits and _ only' });

  // Cross-field: depends on a.email, re-runs automatically when it changes
  required(a.confirmEmail, { message: 'Repeat your email' });
  validate(a.confirmEmail, ({ value, valueOf }) =>
    value() && value() !== valueOf(a.email)
      ? { kind: 'emailMismatch', message: 'Emails do not match' }
      : null,
  );
});

export const companySchema = schema<CompanyData>((c) => {
  required(c.name, { message: 'Company name is required' });
  required(c.nip, { message: 'NIP is required' });
  pattern(c.nip, /^\d{10}$/, { message: 'NIP has 10 digits' });
  required(c.street, { message: 'Street is required' });
  required(c.city, { message: 'City is required' });
  required(c.postalCode, { message: 'Postal code is required' });
  pattern(c.postalCode, /^\d{2}-\d{3}$/, { message: 'Format: 00-000' });
});

export const registrationSchema = schema<RegistrationForm>((f) => {
  apply(f.attendee, attendeeSchema);

  // Async: only when the username is syntactically valid; debounced; own username is fine when editing
  validateHttp(f.attendee.username, {
    request: ({ value, valueOf }) => {
      const username = value();
      if (!/^[a-z0-9_]{3,20}$/.test(username)) {
        return undefined;
      }
      const id = valueOf(f.id);
      const url = `/api/usernames/${encodeURIComponent(username)}/availability`;
      return id ? `${url}?registrationId=${encodeURIComponent(id)}` : url;
    },
    debounce: 400,
    onSuccess: (response: { available: boolean }) =>
      response.available ? null : { kind: 'usernameTaken', message: 'This username is already taken' },
    onError: () => ({ kind: 'usernameCheckFailed', message: 'Could not check the username, try again' }),
  });

  // Arrays: the same schema for every item, plus rules on the array itself
  maxLength(f.companions, MAX_COMPANIONS, { message: `At most ${MAX_COMPANIONS} companions` });
  applyEach(f.companions, (companion) => {
    apply(companion, personSchema);
    // An item rule may read fields outside the array
    validate(companion.email, ({ value, valueOf }) =>
      value() && value().toLowerCase() === valueOf(f.attendee.email).toLowerCase()
        ? { kind: 'duplicateEmail', message: 'Companions need their own email' }
        : null,
    );
  });

  // Group-level rule on the agenda array
  validate(f.agenda, ({ value }) =>
    value().filter((slot) => slot.sessionId).length < 2
      ? { kind: 'minSessions', message: 'Choose at least 2 sessions' }
      : null,
  );

  // Static structure + conditional rules: only the active branch is validated
  required(f.payment.method, { message: 'Choose a payment method' });
  applyWhenValue(f.payment, (payment) => payment.method === 'card', (p) => {
    required(p.card.cardholderName, { message: 'Cardholder name is required' });
    required(p.card.cardNumber, { message: 'Card number is required' });
    pattern(p.card.cardNumber, /^\d{16}$/, { message: 'Card number has 16 digits' });
    required(p.card.expiry, { message: 'Expiry date is required' });
    pattern(p.card.expiry, /^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Use MM/YY' });
  });
  applyWhenValue(f.payment, (payment) => payment.method === 'transfer', (p) => {
    required(p.transfer.payerName, { message: 'Payer name is required' });
    required(p.transfer.iban, { message: 'IBAN is required' });
    pattern(p.transfer.iban, /^PL\d{26}$/, { message: 'Polish IBAN: PL followed by 26 digits' });
  });

  // Condition depends on ANOTHER field (wantsInvoice), so applyWhen instead of applyWhenValue
  applyWhen(f.invoice, ({ valueOf }) => valueOf(f.wantsInvoice), companySchema);
});
