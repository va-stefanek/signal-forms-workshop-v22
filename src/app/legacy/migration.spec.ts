import { TestBed } from '@angular/core/testing';
import { SignalFormControl } from '@angular/forms/signals/compat';
import { FeedbackForm } from './feedback-form/feedback-form';
import { isValidNipChecksum } from './nip-input/nip-input';
import { settle, setupPage } from '../testing/page-harness';

describe('Step 5: migration', () => {
  describe('legacy CVA component inside a signal form', () => {
    async function invoiceReady() {
      const ctx = setupPage();
      await settle(ctx.fixture);
      ctx.page.registrationForm.wantsInvoice().value.set(true);
      await settle(ctx.fixture);
      const nip = ctx.el.querySelector<HTMLInputElement>('lib-nip-input input')!;
      const type = async (text: string) => {
        nip.value = text;
        nip.dispatchEvent(new Event('input'));
        await settle(ctx.fixture);
      };
      return { ...ctx, nip, type };
    }

    it('checks the seed NIP checksum helper', () => {
      expect(isValidNipChecksum('5252248481')).toBe(true);
      expect(isValidNipChecksum('5252248480')).toBe(false);
    });

    it('writes digits to the model and shows the formatted value', async () => {
      const { page, nip, type } = await invoiceReady();
      await type('525-224-84-81');
      expect(page.model().invoice.nip).toBe('5252248481');
      expect(nip.value).toBe('525-224-84-81');
    });

    it('formats a value coming from the model', async () => {
      const { fixture, page, nip } = await invoiceReady();
      page.registrationForm.invoice.nip().value.set('5252248481');
      await settle(fixture);
      expect(nip.value).toBe('525-224-84-81');
    });

    it('propagates the NG_VALIDATORS error of the CVA to the signal form field', async () => {
      const { page, type } = await invoiceReady();
      await type('5252248480');
      expect(page.registrationForm.invoice.nip().getError('nipChecksum')).toBeTruthy();
      await type('5252248481');
      expect(page.registrationForm.invoice.nip().getError('nipChecksum')).toBeUndefined();
    });

    it('still reports schema errors next to the CVA errors', async () => {
      const { page, type } = await invoiceReady();
      await type('123');
      expect(page.registrationForm.invoice.nip().getError('pattern')).toBeTruthy();
    });
  });

  describe('SignalFormControl inside a legacy FormGroup', () => {
    function setup() {
      const fixture = TestBed.createComponent(FeedbackForm);
      fixture.detectChanges();
      return { fixture, cmp: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
    }

    it('makes the FormGroup invalid through signal rules', () => {
      const { cmp } = setup();
      cmp.feedback.controls.rating.setValue(5);
      expect(cmp.feedback.valid).toBe(false);
      expect(cmp.feedback.controls.email.hasError('required')).toBe(true);
    });

    it('works with formControlName in the old template', async () => {
      const { fixture, cmp, el } = setup();
      const input = el.querySelector<HTMLInputElement>('#feedbackEmail')!;
      input.value = 'not-an-email';
      input.dispatchEvent(new Event('input'));
      expect(cmp.feedback.controls.email.hasError('email')).toBe(true);

      input.value = 'ada@acme.dev';
      input.dispatchEvent(new Event('input'));
      cmp.feedback.controls.rating.setValue(4);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(cmp.feedback.valid).toBe(true);
    });

    it('uses a SignalFormControl for email and exposes its value as a signal', () => {
      const { cmp } = setup();
      const email = cmp.feedback.controls.email as unknown as SignalFormControl<string>;
      expect(email).toBeInstanceOf(SignalFormControl);
      cmp.feedback.controls.email.setValue('ada@acme.dev');
      expect(email.sourceValue()).toBe('ada@acme.dev');
    });
  });
});
