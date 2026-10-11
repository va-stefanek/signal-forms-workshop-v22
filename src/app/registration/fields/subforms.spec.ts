import { settle, setupPage } from '../../testing/page-harness';

describe('Step 4: subform components', () => {
  it('renders every section as its own component', async () => {
    const { fixture, el } = setupPage();
    await settle(fixture);
    for (const selector of ['app-attendee-fields', 'app-companions-fields', 'app-agenda-picker', 'app-payment-fields', 'app-invoice-fields']) {
      expect(el.querySelector(selector), selector).not.toBeNull();
    }
  });

  it('subforms still take part in the parent form state', async () => {
    const { fixture, page, el } = setupPage();
    await settle(fixture);
    const input = el.querySelector<HTMLInputElement>('app-attendee-fields #firstName')!;
    input.value = 'Ada';
    input.dispatchEvent(new Event('input'));
    expect(page.model().attendee.firstName).toBe('Ada');
  });

  it('binds the phone custom control inside the attendee subform', async () => {
    const { fixture, page, el } = setupPage();
    await settle(fixture);
    const phone = el.querySelector<HTMLInputElement>('app-phone-input input')!;
    phone.value = '600 700 800';
    phone.dispatchEvent(new Event('input'));
    expect(page.model().attendee.phone).toBe('+48600700800');
  });
});
