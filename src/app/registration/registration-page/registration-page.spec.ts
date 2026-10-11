import { settle, setupPage } from '../../testing/page-harness';

describe('Step 2: registration page', () => {
  it('creates an empty form with one entry per agenda slot', async () => {
    const { fixture, page } = setupPage();
    await settle(fixture);
    expect(page.registrationForm.agenda.length).toBe(4);
    expect(page.registrationForm.attendee.firstName().value()).toBe('');
  });

  it('loads registration #42 into the form', async () => {
    const { fixture, page } = setupPage();
    await settle(fixture);
    page.registrationId.set('42');
    await settle(fixture);

    const f = page.registrationForm;
    expect(f.attendee.firstName().value()).toBe('Katarzyna');
    expect(f.agenda[1].sessionId().value()).toBe('s-ws-forms');
    expect(f.payment.method().value()).toBe('transfer');
    expect(f.wantsInvoice().value()).toBe(true);
  });

  it('disables the form while loading', () => {
    const { page } = setupPage();
    expect(page.registrationForm().disabled()).toBe(true);
  });

  it('keeps typed card data when switching payment method back and forth', async () => {
    const { fixture, page } = setupPage();
    await settle(fixture);
    const payment = page.registrationForm.payment;
    payment.method().value.set('card');
    payment.card.cardNumber().value.set('4111111111111111');
    payment.method().value.set('transfer');
    payment.method().value.set('card');
    expect(payment.card.cardNumber().value()).toBe('4111111111111111');
  });

  it('shows the domain model in the preview', async () => {
    const { fixture, page } = setupPage();
    await settle(fixture);
    page.registrationForm.agenda[0].sessionId().value.set('s-keynote');
    expect(page.domainPreview().sessionIds).toEqual(['s-keynote']);
  });
});
