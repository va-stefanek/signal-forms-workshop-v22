import { Component, forwardRef, signal } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';

/**
 * LEGACY COMPONENT from the company UI library (do not rewrite it in the workshop).
 * A classic ControlValueAccessor + NG_VALIDATORS: shows "525-224-84-81", stores "5252248481",
 * and validates the NIP checksum itself.
 */
@Component({
  selector: 'lib-nip-input',
  templateUrl: './nip-input.html',
  host: { style: 'display: contents' },
  inputs: ['inputId'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NipInput), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => NipInput), multi: true },
  ],
})
export class NipInput implements ControlValueAccessor, Validator {
  inputId = '';
  protected readonly display = signal('');
  protected readonly isDisabled = signal(false);
  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.display.set(formatNip(value ?? ''));
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  validate(control: AbstractControl<string>): ValidationErrors | null {
    const value = control.value;
    if (!value || !/^\d{10}$/.test(value)) {
      return null; // format is someone else's job
    }
    return isValidNipChecksum(value) ? null : { nipChecksum: true };
  }

  protected onInput(event: Event): void {
    const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 10);
    this.display.set(formatNip(digits));
    this.onChange(digits);
  }
}

export function formatNip(digits: string): string {
  const d = digits.replace(/\D/g, '');
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)].filter(Boolean).join('-');
}

export function isValidNipChecksum(nip: string): boolean {
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const sum = weights.reduce((acc, w, i) => acc + w * Number(nip[i]), 0);
  return sum % 11 === Number(nip[9]);
}
