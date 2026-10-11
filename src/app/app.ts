import { Component, signal } from '@angular/core';
import { FeedbackForm } from './legacy/feedback-form/feedback-form';
import { NewsletterSignup } from './newsletter/newsletter-signup';
import { RegistrationPage } from './registration/registration-page/registration-page';

@Component({
  selector: 'app-root',
  imports: [RegistrationPage, FeedbackForm, NewsletterSignup],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly view = signal<'registration' | 'feedback' | 'newsletter'>('registration');
}
