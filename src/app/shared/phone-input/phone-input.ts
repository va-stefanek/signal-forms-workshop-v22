import { Component, ElementRef, input, model, output, viewChild } from '@angular/core';
import { FormValueControl, ParseResult, transformedValue } from '@angular/forms/signals';

/** "600 700 800" or "+48600700800" -> "+48600700800"; "" -> null; anything else -> parse error */
export function parsePhone(raw: string): ParseResult<string | null> {
  const compact = raw.replace(/[\s-]/g, '');
  if (compact === '') {
    return { value: null };
  }
  if (/^\d{9}$/.test(compact)) {
    return { value: `+48${compact}` };
  }
  if (/^\+\d{8,15}$/.test(compact)) {
    return { value: compact };
  }
  return { error: { kind: 'parse', message: 'Use 9 digits or +country code and number' } };
}

/** "+48600700800" -> "+48 600 700 800" (other countries are shown as stored) */
export function formatPhone(value: string | null): string {
  if (!value) {
    return '';
  }
  const pl = value.match(/^\+48(\d{3})(\d{3})(\d{3})$/);
  return pl ? `+48 ${pl[1]} ${pl[2]} ${pl[3]}` : value;
}

/**
 * Custom control: no ControlValueAccessor.
 * The model holds E.164 (or null); the input shows what the user types.
 */
@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.html',
  host: { style: 'display: contents' },
})
export class PhoneInput implements FormValueControl<string | null> {
  /** Required by FormValueControl: kept in sync with the bound field */
  readonly value = model<string | null>(null);

  /** Optional state inputs, bound automatically by [formField] */
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly touched = input(false);

  /** v22: a control reports "touched" through an output, it cannot un-touch a field */
  readonly touch = output<void>();

  readonly inputId = input<string>('');

  /** Raw text <-> model value; parse errors are reported to the parent field automatically */
  protected readonly rawValue = transformedValue(this.value, { parse: parsePhone, format: formatPhone });

  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');

  /** Called by focusBoundControl(), e.g. when this is the first invalid field on submit */
  focus(options?: FocusOptions): void {
    this.inputRef().nativeElement.focus(options);
  }

  protected onInput(event: Event): void {
    this.rawValue.set((event.target as HTMLInputElement).value);
  }
}
