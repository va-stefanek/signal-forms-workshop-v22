import { TestBed } from '@angular/core/testing';
import { FORM_FIELD_CLASSES } from '../../app.config';
import { settle, setupPage } from '../../testing/page-harness';
import { HINT } from '../../shared/hint';

describe('Step 5: production setup', () => {
  async function ready() {
    TestBed.configureTestingModule({ providers: [FORM_FIELD_CLASSES] });
    const ctx = setupPage();
    await settle(ctx.fixture);
    return ctx;
  }

  it('adds is-invalid to touched invalid fields (provideSignalFormsConfig)', async () => {
    const { fixture, el } = await ready();
    const input = el.querySelector<HTMLInputElement>('#firstName')!;
    expect(input.classList.contains('is-invalid')).toBe(false);
    input.dispatchEvent(new Event('blur'));
    await settle(fixture);
    expect(input.classList.contains('is-invalid')).toBe(true);
  });

  it('adds is-valid once the field is fixed', async () => {
    const { fixture, el } = await ready();
    const input = el.querySelector<HTMLInputElement>('#firstName')!;
    input.value = 'Ada';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await settle(fixture);
    expect(input.classList.contains('is-valid')).toBe(true);
  });

  it('exposes hints through custom metadata', async () => {
    const { page, el } = await ready();
    expect(page.registrationForm.attendee.username().metadata(HINT)?.()).toContain('3 to 20');
    expect(el.textContent).toContain('3 to 20 characters');
  });

  it('marks required fields from validator metadata', async () => {
    const { el } = await ready();
    const label = el.querySelector('label[for="firstName"]')!;
    expect(label.querySelector('.required-mark')).not.toBeNull();
    expect(el.querySelector('label[for="phone"] .required-mark')).toBeNull();
  });
});
