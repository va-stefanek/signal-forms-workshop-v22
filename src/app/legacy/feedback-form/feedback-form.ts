import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/**
 * LEGACY reactive form.
 * TODO 5.2: migrate ONLY the email control to SignalFormControl with Signal Forms rules
 * (required + email). Do not touch the template: formControlName and hasError() keep working.
 * Stretch: show the email domain with a computed() over emailControl.sourceValue().
 */
@Component({
  selector: 'app-feedback-form',
  imports: [ReactiveFormsModule],
  templateUrl: './feedback-form.html',
})
export class FeedbackForm {
  readonly emailControl = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });

  readonly feedback = new FormGroup({
    rating: new FormControl<number | null>(null, Validators.required),
    comment: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] }),
    email: this.emailControl,
  });

  readonly sent = signal(false);

  send(): void {
    this.feedback.markAllAsTouched();
    if (this.feedback.valid) {
      this.sent.set(true);
    }
  }
}
