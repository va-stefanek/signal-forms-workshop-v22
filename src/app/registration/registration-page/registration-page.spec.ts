import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { RegistrationPage } from './registration-page';
import { fakeBackend } from '../../api/fake-backend';

describe('Step 1: attendee form', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [RegistrationPage],
      providers: [provideHttpClient(withInterceptors([fakeBackend]))],
    });
    const fixture = TestBed.createComponent(RegistrationPage);
    fixture.detectChanges();
    return { fixture, page: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }

  it('starts invalid and becomes valid with correct data', () => {
    const { page } = setup();
    const f = page.attendeeForm;
    expect(f().invalid()).toBe(true);

    f.firstName().value.set('Ada');
    f.lastName().value.set('Lovelace');
    f.email().value.set('ada@example.com');
    f.username().value.set('ada_l');

    expect(f().valid()).toBe(true);
  });

  it('validates the email format', () => {
    const { page } = setup();
    page.attendeeForm.email().value.set('not-an-email');
    expect(page.attendeeForm.email().getError('email')).toBeTruthy();
  });

  it('validates username length and characters', () => {
    const { page } = setup();
    const username = page.attendeeForm.username;

    username().value.set('ab');
    expect(username().getError('minLength')?.minLength).toBe(3);

    username().value.set('a'.repeat(21));
    expect(username().getError('maxLength')?.maxLength).toBe(20);

    username().value.set('Ada Lovelace');
    expect(username().getError('pattern')).toBeTruthy();

    username().value.set('ada_l');
    expect(username().errors()).toEqual([]);
  });

  it('binds the inputs to the model in both directions', async () => {
    const { fixture, page, el } = setup();
    const input = el.querySelector<HTMLInputElement>('#firstName')!;

    input.value = 'Grace';
    input.dispatchEvent(new Event('input'));
    expect(page.attendeeForm.firstName().value()).toBe('Grace');

    page.attendeeForm.firstName().value.set('Ada');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(input.value).toBe('Ada');
  });

  it('shows an error message only after the field was touched', async () => {
    const { fixture, el } = setup();
    expect(el.textContent).not.toContain('Email is required');

    const input = el.querySelector<HTMLInputElement>('#email')!;
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(el.textContent).toContain('Email is required');
  });
});
