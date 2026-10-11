import { submit } from '@angular/forms/signals';
import { USERNAME_CHECK_MS, fillValidForm, settle, setupPage } from '../../testing/page-harness';

describe('Step 3: submission', () => {
  async function ready() {
    const ctx = setupPage();
    await settle(ctx.fixture);
    return ctx;
  }

  it('does not call the API for an invalid form and focuses the first error', async () => {
    const { fixture, page, el } = await ready();
    const ok = await submit(page.registrationForm);
    await settle(fixture);
    expect(ok).toBe(false);
    expect(page.lastSaved()).toBeNull();
    expect(document.activeElement).toBe(el.querySelector('#firstName'));
  });

  it('marks every field as touched on submit so errors become visible', async () => {
    const { fixture, page, el } = await ready();
    await submit(page.registrationForm);
    await settle(fixture);
    expect(page.registrationForm.attendee.lastName().touched()).toBe(true);
    expect(el.textContent).toContain('Last name is required');
  });

  it('saves a valid form and switches to edit mode', async () => {
    const { fixture, page } = await ready();
    fillValidForm(page);
    await settle(fixture, USERNAME_CHECK_MS);

    const ok = await submit(page.registrationForm);
    await settle(fixture);

    expect(ok).toBe(true);
    expect(page.lastSaved()?.id).toBe('100');
    expect(page.registrationId()).toBe('100');
  });

  it('maps a 422 field error from the server onto the email field', async () => {
    const { fixture, page } = await ready();
    fillValidForm(page, { email: 'taken@conf.dev' });
    await settle(fixture, USERNAME_CHECK_MS);

    const ok = await submit(page.registrationForm);
    await settle(fixture);

    expect(ok).toBe(false);
    expect(page.registrationForm.attendee.email().getError('server')?.message).toBe(
      'This email is already registered',
    );
  });

  it('shows a form-level error when the server crashes', async () => {
    const { fixture, page, el } = await ready();
    fillValidForm(page, { email: 'crash@conf.dev' });
    await settle(fixture, USERNAME_CHECK_MS);

    await submit(page.registrationForm);
    await settle(fixture);

    expect(page.formErrors()[0]?.kind).toBe('serverUnavailable');
    expect(el.querySelector('.banner.err')?.textContent).toContain('Saving failed');
  });
});
