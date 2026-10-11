import { USERNAME_CHECK_MS, fillValidForm, settle, setupPage } from '../../../testing/page-harness';

describe('Step 4: companions (arrays)', () => {
  async function ready() {
    const ctx = setupPage();
    await settle(ctx.fixture);
    const addButton = () =>
      [...ctx.el.querySelectorAll('button')].find((b) => b.textContent?.includes('Add companion'))!;
    const removeButtons = () => [...ctx.el.querySelectorAll<HTMLButtonElement>('button[aria-label^="Remove companion"]')];
    return { ...ctx, addButton, removeButtons };
  }

  it('adds and removes companions through the subform', async () => {
    const { fixture, page, addButton, removeButtons } = await ready();
    addButton().click();
    addButton().click();
    await settle(fixture);
    expect(page.registrationForm.companions.length).toBe(2);

    removeButtons()[0].click();
    await settle(fixture);
    expect(page.registrationForm.companions.length).toBe(1);
  });

  it('applies the person schema to every companion', async () => {
    const { fixture, page, addButton } = await ready();
    addButton().click();
    await settle(fixture);
    const companion = page.registrationForm.companions[0];
    expect(companion.firstName().getError('required')).toBeTruthy();
    companion.email().value.set('nope');
    expect(companion.email().getError('email')).toBeTruthy();
  });

  it('rejects a companion with the attendee email', async () => {
    const { fixture, page, addButton } = await ready();
    page.registrationForm.attendee.email().value.set('ada@example.com');
    addButton().click();
    await settle(fixture);
    page.registrationForm.companions[0].email().value.set('ADA@example.com');
    expect(page.registrationForm.companions[0].email().getError('duplicateEmail')).toBeTruthy();
  });

  it('allows at most 3 companions', async () => {
    const { fixture, page, addButton } = await ready();
    for (let i = 0; i < 3; i++) {
      addButton().click();
      await settle(fixture);
    }
    expect(addButton().disabled).toBe(true);
    expect(page.registrationForm.companions.length).toBe(3);
  });

  it('keeps the remaining items editable after removing one from the middle (no orphan fields)', async () => {
    const { fixture, page, el, addButton, removeButtons } = await ready();
    for (let i = 0; i < 3; i++) {
      addButton().click();
      await settle(fixture);
    }
    page.registrationForm.companions[2].firstName().value.set('Third');
    removeButtons()[1].click();
    await settle(fixture);

    const input = el.querySelector<HTMLInputElement>('#companion-first-1')!;
    expect(input.value).toBe('Third');
    input.value = 'Edited';
    input.dispatchEvent(new Event('input'));
    expect(page.model().companions[1].firstName).toBe('Edited');
  });

  it('sends companions to the API', async () => {
    const { fixture, page, addButton } = await ready();
    fillValidForm(page);
    addButton().click();
    await settle(fixture);
    const c = page.registrationForm.companions[0];
    c.firstName().value.set('Charles');
    c.lastName().value.set('Babbage');
    c.email().value.set('charles@example.com');
    await settle(fixture, USERNAME_CHECK_MS);
    expect(page.registrationForm().valid()).toBe(true);
    // compare the JSON payload: array items carry internal tracking keys in memory
    expect(JSON.parse(JSON.stringify(page.domainPreview().companions))).toEqual([
      { firstName: 'Charles', lastName: 'Babbage', email: 'charles@example.com' },
    ]);
  });
});
