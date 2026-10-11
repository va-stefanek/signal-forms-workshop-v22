import { TestBed } from '@angular/core/testing';
import { RegistrationApi } from '../../api/registration-api';
import { USERNAME_CHECK_MS, fillValidForm, settle, setupPage } from '../../testing/page-harness';

describe('Step 3: validation', () => {
  async function ready() {
    const ctx = setupPage();
    await settle(ctx.fixture);
    return ctx;
  }

  it('accepts a completely filled form', async () => {
    const { fixture, page } = await ready();
    fillValidForm(page);
    await settle(fixture, USERNAME_CHECK_MS);
    expect(page.registrationForm().errorSummary()).toEqual([]);
    expect(page.registrationForm().valid()).toBe(true);
  });

  describe('cross-field: confirmEmail', () => {
    it('reports a mismatch and clears it when email changes', async () => {
      const { page } = await ready();
      const a = page.registrationForm.attendee;
      a.email().value.set('ada@example.com');
      a.confirmEmail().value.set('ada@exampel.com');
      expect(a.confirmEmail().getError('emailMismatch')).toBeTruthy();

      a.email().value.set('ada@exampel.com');
      expect(a.confirmEmail().getError('emailMismatch')).toBeUndefined();
    });
  });

  describe('agenda', () => {
    it('requires at least two sessions', async () => {
      const { page } = await ready();
      const agenda = page.registrationForm.agenda;
      agenda[0].sessionId().value.set('s-keynote');
      expect(agenda().getError('minSessions')).toBeTruthy();
      agenda[2].sessionId().value.set('s-testing');
      expect(agenda().getError('minSessions')).toBeUndefined();
    });
  });

  describe('payment', () => {
    it('requires a method', async () => {
      const { page } = await ready();
      expect(page.registrationForm.payment.method().getError('required')).toBeTruthy();
    });

    it('validates only the active branch', async () => {
      const { page } = await ready();
      const p = page.registrationForm.payment;
      p.method().value.set('transfer');
      expect(p.transfer.iban().getError('required')).toBeTruthy();
      expect(p.card.cardNumber().errors()).toEqual([]);

      p.method().value.set('card');
      expect(p.card.cardNumber().getError('required')).toBeTruthy();
      expect(p.transfer.iban().errors()).toEqual([]);
    });

    it('checks the card formats', async () => {
      const { page } = await ready();
      const p = page.registrationForm.payment;
      p.method().value.set('card');
      p.card.cardNumber().value.set('4111 1111');
      p.card.expiry().value.set('13/28');
      expect(p.card.cardNumber().getError('pattern')).toBeTruthy();
      expect(p.card.expiry().getError('pattern')).toBeTruthy();
    });
  });

  describe('invoice', () => {
    it('is validated only when wantsInvoice is checked', async () => {
      const { page } = await ready();
      const f = page.registrationForm;
      expect(f.invoice.nip().errors()).toEqual([]);

      f.wantsInvoice().value.set(true);
      expect(f.invoice.nip().getError('required')).toBeTruthy();
      f.invoice.nip().value.set('123');
      expect(f.invoice.nip().getError('pattern')).toBeTruthy();
    });
  });

  describe('async username check', () => {
    it('reports a taken username after the debounce', async () => {
      const { fixture, page } = await ready();
      const username = page.registrationForm.attendee.username;
      username().value.set('admin');
      await settle(fixture, USERNAME_CHECK_MS);
      expect(username().getError('usernameTaken')).toBeTruthy();
    });

    it('does not call the server for syntactically invalid usernames', async () => {
      const { fixture, page } = await ready();
      const username = page.registrationForm.attendee.username;
      username().value.set('ab');
      await settle(fixture, USERNAME_CHECK_MS);
      expect(username().pending()).toBe(false);
      expect(username().getError('usernameTaken')).toBeUndefined();
    });

    it('reports when the check itself fails', async () => {
      const { fixture, page } = await ready();
      const username = page.registrationForm.attendee.username;
      username().value.set('offline');
      await settle(fixture, USERNAME_CHECK_MS);
      expect(username().getError('usernameCheckFailed')).toBeTruthy();
    });

    it('treats your own username as available when editing', async () => {
      const { fixture, page } = await ready();
      page.registrationId.set('42');
      await settle(fixture, USERNAME_CHECK_MS);
      expect(page.registrationForm.attendee.username().value()).toBe('kasia_dev');
      expect(page.registrationForm.attendee.username().getError('usernameTaken')).toBeUndefined();
    });

    it('re-checks the same value with reloadValidation()', async () => {
      const { fixture, page } = await ready();
      const username = page.registrationForm.attendee.username;
      username().value.set('ada_l');
      await settle(fixture, USERNAME_CHECK_MS);
      expect(username().valid()).toBe(true);

      await TestBed.inject(RegistrationApi).takeUsername('ada_l');
      username().reloadValidation();
      await settle(fixture, USERNAME_CHECK_MS);
      expect(username().getError('usernameTaken')).toBeTruthy();
    });
  });
});
