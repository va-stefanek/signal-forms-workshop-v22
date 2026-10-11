import { Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { email, required } from '@angular/forms/signals';
import { SignalFormControl } from '@angular/forms/signals/compat';

/**
 * Task 5.2 (exercises/step-5.md). LEGACY reactive form, migrated bottom-up:
 * `email` is already a SignalFormControl (rules written with Signal Forms),
 * everything else, including the template, stays as it was.
 */
@Component({
  selector: 'app-feedback-form',
  imports: [ReactiveFormsModule],
  templateUrl: './feedback-form.html',
})
export class FeedbackForm {
  readonly emailControl = new SignalFormControl('', (p) => {
    required(p);
    email(p);
  });

  readonly feedback = new FormGroup({
    rating: new FormControl<number | null>(null, Validators.required),
    comment: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] }),
    email: this.emailControl,
  });

  readonly sent = signal(false);

  /** sourceValue is a real signal, even inside a reactive FormGroup */
  protected readonly emailDomain = computed(() => this.emailControl.sourceValue().split('@')[1] ?? '');

  send(): void {
    this.feedback.markAllAsTouched();
    if (this.feedback.valid) {
      this.sent.set(true);
    }
  }
}
