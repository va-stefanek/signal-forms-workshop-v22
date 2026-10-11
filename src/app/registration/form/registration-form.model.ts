import { Agenda, CompanyData, Person, Registration } from '../../api/models';

/**
 * FORM MODEL
 * Shaped for the UI, not for the API. Every field always exists (no undefined),
 * so the field tree is static and nothing typed by the user gets lost.
 * The types are given; your job is the mapping functions below.
 */

export interface AttendeeForm {
  firstName: string;
  lastName: string;
  email: string;
  /** UI-only field, never sent to the API */
  confirmEmail: string;
  username: string;
  phone: string | null;
}

/**
 * One entry per agenda slot: the session chosen in that slot.
 * '' means "nothing chosen": radio inputs bind to string fields only,
 * so the form model uses '' where the domain model has "absent".
 */
export interface AgendaSlotForm {
  slotId: string;
  sessionId: string;
}

/** Static structure: both branches always exist, `method` picks the active one */
export interface PaymentForm {
  /** '' = not chosen yet (radio inputs need a string) */
  method: 'card' | 'transfer' | '';
  card: { cardholderName: string; cardNumber: string; expiry: string };
  transfer: { payerName: string; iban: string };
}

export interface RegistrationForm {
  id: string | null;
  attendee: AttendeeForm;
  companions: Person[];
  agenda: AgendaSlotForm[];
  payment: PaymentForm;
  wantsInvoice: boolean;
  /** Always present in the form, even when wantsInvoice is false */
  invoice: CompanyData;
}

export const EMPTY_COMPANY: CompanyData = { name: '', nip: '', street: '', city: '', postalCode: '' };

export const EMPTY_PAYMENT: PaymentForm = {
  method: '',
  card: { cardholderName: '', cardNumber: '', expiry: '' },
  transfer: { payerName: '', iban: '' },
};

export function emptyPerson(): Person {
  return { firstName: '', lastName: '', email: '' };
}

/** TODO 2.1: an empty form with one { slotId, sessionId: '' } entry per agenda slot */
export function emptyRegistrationForm(agenda: Agenda): RegistrationForm {
  return {
    id: null,
    attendee: { firstName: '', lastName: '', email: '', confirmEmail: '', username: '', phone: null },
    companions: [],
    agenda: [],
    payment: structuredClone(EMPTY_PAYMENT),
    wantsInvoice: false,
    invoice: { ...EMPTY_COMPANY },
  };
}

/**
 * TODO 2.2: API -> form
 *  - sessionIds (flat list) -> one entry per agenda slot
 *  - confirmEmail starts equal to email
 *  - payment union -> static PaymentForm (fill the active branch, keep the other one empty)
 *  - optional invoice -> wantsInvoice + always-present invoice
 */
export function domainToForm(registration: Registration, agenda: Agenda): RegistrationForm {
  return emptyRegistrationForm(agenda); // TODO 2.2
}

/**
 * TODO 2.3: form -> API
 *  - drop confirmEmail
 *  - agenda entries -> sessionIds (skip empty slots)
 *  - only the active payment branch, or null
 *  - include `invoice` only when wantsInvoice is true (no `invoice: undefined` key!)
 */
export function formToDomain(form: RegistrationForm): Registration {
  // TODO 2.3
  return { id: form.id, attendee: form.attendee, companions: [], sessionIds: [], payment: null };
}
