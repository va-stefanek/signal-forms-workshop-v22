import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { FAKE_BACKEND_DELAY, fakeBackend, resetFakeBackend } from '../api/fake-backend';
import { RegistrationPage } from '../registration/registration-page/registration-page';

/** Provided test helpers. The fake backend answers immediately in tests. */
export function setupPage() {
  resetFakeBackend();
  TestBed.configureTestingModule({
    imports: [RegistrationPage],
    providers: [
      provideHttpClient(withInterceptors([fakeBackend])),
      { provide: FAKE_BACKEND_DELAY, useValue: 0 },
    ],
  });
  const fixture = TestBed.createComponent(RegistrationPage);
  fixture.detectChanges();
  return { fixture, page: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
}

/** Lets resources, debounces and change detection run. */
export async function settle(fixture: { whenStable(): Promise<unknown>; detectChanges(): void }, ms = 0) {
  if (ms) {
    await new Promise((r) => setTimeout(r, ms));
  }
  for (let i = 0; i < 5; i++) {
    await new Promise((r) => setTimeout(r, 0));
    await fixture.whenStable();
    fixture.detectChanges();
  }
}

/** Time needed for the debounced username check to fire and resolve */
export const USERNAME_CHECK_MS = 450;

type Page = ReturnType<typeof setupPage>['page'];

/** Fills the whole form with valid data (card payment, two sessions, no invoice). */
export function fillValidForm(page: Page, overrides: { email?: string; username?: string } = {}) {
  const f = page.registrationForm;
  const email = overrides.email ?? 'ada@example.com';
  f.attendee.firstName().value.set('Ada');
  f.attendee.lastName().value.set('Lovelace');
  f.attendee.email().value.set(email);
  f.attendee.confirmEmail().value.set(email);
  f.attendee.username().value.set(overrides.username ?? 'ada_l');
  f.agenda[0].sessionId().value.set('s-keynote');
  f.agenda[1].sessionId().value.set('s-forms');
  f.payment.method().value.set('card');
  f.payment.card.cardholderName().value.set('Ada Lovelace');
  f.payment.card.cardNumber().value.set('4111111111111111');
  f.payment.card.expiry().value.set('12/28');
}
