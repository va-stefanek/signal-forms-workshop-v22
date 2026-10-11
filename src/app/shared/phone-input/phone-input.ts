import { Component, model } from '@angular/core';
import { FormValueControl, ParseResult } from '@angular/forms/signals';

/**
 * TODO 4.5: "600 700 800" or "+48600700800" -> "+48600700800"; "" -> null
 * Spaces and dashes are ignored. 9 digits = Polish number, "+" and 8 to 15 digits = international.
 * Anything else: { error: { kind: 'parse', message: '...' } }
 */
export function parsePhone(raw: string): ParseResult<string | null> {
  return { value: raw };
}

/** TODO 4.5: "+48600700800" -> "+48 600 700 800" (other countries as stored), null -> "" */
export function formatPhone(value: string | null): string {
  return value ?? '';
}

/**
 * TODO 4.6: custom control without ControlValueAccessor
 *  - value: model() (done), plus optional inputs disabled / invalid / touched
 *  - touch: output<void>() emitted on blur (v22: a control cannot un-touch a field)
 *  - rawValue = transformedValue(this.value, { parse: parsePhone, format: formatPhone })
 *  - template: <input type="tel"> bound to rawValue, with a typed (input) handler
 *  - focus(options) so focusBoundControl() works
 *  - input `inputId` used as the <input> id
 */
@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.html',
  host: { style: 'display: contents' },
})
export class PhoneInput implements FormValueControl<string | null> {
  readonly value = model<string | null>(null);
}
