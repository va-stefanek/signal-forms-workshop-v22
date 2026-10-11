import { Component, computed, input } from '@angular/core';
import { FieldTree, ValidationError } from '@angular/forms/signals';

const DEFAULT_MESSAGES: Record<string, (e: any) => string> = {
  required: () => 'This field is required',
  email: () => 'Enter a valid email address',
  minLength: (e) => `At least ${e.minLength} characters`,
  maxLength: (e) => `At most ${e.maxLength} characters`,
  min: (e) => `Minimum value is ${e.min}`,
  max: (e) => `Maximum value is ${e.max}`,
  pattern: () => 'Invalid format',
  parse: () => 'Cannot read this value',
};

/**
 * Shared helper (provided, not part of any exercise).
 * Shows the errors of a field once it was touched; prefers the error's own message.
 */
@Component({
  selector: 'app-field-errors',
  templateUrl: './field-errors.html',
  host: { 'aria-live': 'polite' },
})
export class FieldErrors {
  readonly field = input.required<FieldTree<unknown>>();
  protected readonly visible = computed(() => this.field()().touched() && this.field()().invalid());

  protected messageOf(error: ValidationError): string {
    return error.message ?? DEFAULT_MESSAGES[error.kind]?.(error) ?? error.kind;
  }
}
