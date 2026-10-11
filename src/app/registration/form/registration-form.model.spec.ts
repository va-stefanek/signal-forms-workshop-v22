import { AGENDA } from '../../api/fake-backend';
import { Registration } from '../../api/models';
import { domainToForm, emptyRegistrationForm, formToDomain } from './registration-form.model';

const REGISTRATION: Registration = {
  id: '42',
  attendee: { firstName: 'Kasia', lastName: 'Nowicka', email: 'kasia@example.com', username: 'kasia_dev', phone: null },
  companions: [{ firstName: 'Marek', lastName: 'Nowicki', email: 'marek@example.com' }],
  sessionIds: ['s-keynote', 's-ws-forms', 's-ai'],
  payment: { method: 'transfer', payerName: 'Kasia Nowicka', iban: 'PL61109010140000071219812874' },
  invoice: { name: 'ACME', nip: '5252248481', street: 'Prosta 1', city: 'Warszawa', postalCode: '00-850' },
};

describe('Step 2: form model vs domain model', () => {
  describe('emptyRegistrationForm()', () => {
    it('creates one empty entry per agenda slot', () => {
      const form = emptyRegistrationForm(AGENDA);
      expect(form.agenda).toEqual([
        { slotId: 'slot-1', sessionId: '' },
        { slotId: 'slot-2', sessionId: '' },
        { slotId: 'slot-3', sessionId: '' },
        { slotId: 'slot-4', sessionId: '' },
      ]);
    });

    it('has no undefined values anywhere (static field tree)', () => {
      const json = JSON.stringify(emptyRegistrationForm(AGENDA), (_k, v) => (v === undefined ? '__undefined__' : v));
      expect(json).not.toContain('__undefined__');
    });
  });

  describe('domainToForm()', () => {
    const form = domainToForm(REGISTRATION, AGENDA);

    it('maps the flat sessionIds list onto agenda slots', () => {
      expect(form.agenda).toEqual([
        { slotId: 'slot-1', sessionId: 's-keynote' },
        { slotId: 'slot-2', sessionId: 's-ws-forms' },
        { slotId: 'slot-3', sessionId: '' },
        { slotId: 'slot-4', sessionId: 's-ai' },
      ]);
    });

    it('pre-fills confirmEmail with the email', () => {
      expect(form.attendee.confirmEmail).toBe('kasia@example.com');
    });

    it('keeps both payment branches and selects the right method', () => {
      expect(form.payment.method).toBe('transfer');
      expect(form.payment.transfer).toEqual({ payerName: 'Kasia Nowicka', iban: 'PL61109010140000071219812874' });
      expect(form.payment.card).toEqual({ cardholderName: '', cardNumber: '', expiry: '' });
    });

    it('turns an existing invoice into wantsInvoice + invoice', () => {
      expect(form.wantsInvoice).toBe(true);
      expect(form.invoice.nip).toBe('5252248481');
    });

    it('fills an empty invoice when the registration has none', () => {
      const { invoice, ...withoutInvoice } = REGISTRATION;
      const noInvoice = domainToForm(withoutInvoice, AGENDA);
      expect(noInvoice.wantsInvoice).toBe(false);
      expect(noInvoice.invoice).toEqual({ name: '', nip: '', street: '', city: '', postalCode: '' });
    });
  });

  describe('formToDomain()', () => {
    it('round-trips a registration', () => {
      expect(formToDomain(domainToForm(REGISTRATION, AGENDA))).toEqual(REGISTRATION);
    });

    it('never sends the UI-only confirmEmail field', () => {
      const domain = formToDomain(domainToForm(REGISTRATION, AGENDA));
      expect('confirmEmail' in domain.attendee).toBe(false);
    });

    it('omits the invoice key when wantsInvoice is false, but the form keeps the data', () => {
      const form = domainToForm(REGISTRATION, AGENDA);
      form.wantsInvoice = false;
      const domain = formToDomain(form);
      expect('invoice' in domain).toBe(false);
      expect(form.invoice.nip).toBe('5252248481');
    });

    it('sends only the active payment branch', () => {
      const form = domainToForm(REGISTRATION, AGENDA);
      form.payment.method = 'card';
      form.payment.card = { cardholderName: 'K N', cardNumber: '4111111111111111', expiry: '12/28' };
      expect(formToDomain(form).payment).toEqual({
        method: 'card', cardholderName: 'K N', cardNumber: '4111111111111111', expiry: '12/28',
      });
    });

    it('sends null payment when no method is chosen', () => {
      expect(formToDomain(emptyRegistrationForm(AGENDA)).payment).toBeNull();
    });
  });
});
