import { Component, signal } from '@angular/core';
import { FormField, FormRoot, email, form, required } from '@angular/forms/signals';
import { FieldErrors } from '../shared/field-errors/field-errors';

/**
 * Deliberately flat model: strings and a boolean only.
 * WebMCP infers the tool's input schema from the initial value and gives up on
 * null, undefined and empty arrays, which the registration form contains on purpose (Module 2).
 */
export interface NewsletterForm {
  name: string;
  email: string;
  track: string;
  weekly: boolean;
}

export const TRACKS = [
  { id: 'web', label: 'Web platform' },
  { id: 'ai', label: 'AI and agents' },
  { id: 'architecture', label: 'Architecture' },
];

@Component({
  selector: 'app-newsletter-signup',
  imports: [FormRoot, FormField, FieldErrors],
  templateUrl: './newsletter-signup.html',
  styleUrl: './newsletter-signup.css',
})
export class NewsletterSignup {
  protected readonly tracks = TRACKS;
  readonly subscribed = signal<NewsletterForm | null>(null);

  readonly newsletterForm = form(
    signal<NewsletterForm>({ name: '', email: '', track: '', weekly: false }),
    (f) => {
      required(f.name, { message: 'Name is required' });
      required(f.email, { message: 'Email is required' });
      email(f.email, { message: 'Enter a valid email address' });
      required(f.track, { message: 'Choose a track' });
    },
    {
      // STRETCH 5.5 (exercises/step-5.md, experimental): add experimentalWebMcpTool { name, description, annotations } here
      submission: {
        action: async (f) => {
          this.subscribed.set(f().value());
          return null;
        },
      },
    },
  );
}
