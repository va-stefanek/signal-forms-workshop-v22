/**
 * DOMAIN MODEL
 * This is what the backend stores and returns. Treat it as a fixed contract:
 * do not change these types during the workshop.
 */

export interface Person {
  firstName: string;
  lastName: string;
  email: string;
}

export interface Attendee extends Person {
  username: string;
  /** E.164 format, e.g. "+48600700800", or null when not provided */
  phone: string | null;
}

export type Payment =
  | { method: 'card'; cardholderName: string; cardNumber: string; expiry: string }
  | { method: 'transfer'; payerName: string; iban: string };

export interface CompanyData {
  name: string;
  /** Polish tax id: 10 digits, no separators */
  nip: string;
  street: string;
  city: string;
  postalCode: string;
}

export interface Registration {
  id: string | null;
  attendee: Attendee;
  companions: Person[];
  /** Flat list of chosen session ids, at most one per agenda slot */
  sessionIds: string[];
  payment: Payment | null;
  /** Present only when the attendee wants an invoice */
  invoice?: CompanyData;
}

export interface Session {
  id: string;
  title: string;
  speaker: string;
  track: 'Main stage' | 'Deep dive' | 'Workshop';
}

export interface Slot {
  id: string;
  /** ISO date-time */
  startsAt: string;
  /** ISO date-time */
  endsAt: string;
  sessions: Session[];
}

export interface Agenda {
  slots: Slot[];
}

/** Body of a 422 response from POST/PUT /api/registrations */
export interface ServerValidationErrors {
  errors: { path: string; message: string }[];
}
