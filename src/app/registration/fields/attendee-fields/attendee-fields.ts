import { Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { AttendeeForm } from '../../form/registration-form.model';

/**
 * TODO 4.2: move the attendee section of registration-page.html into attendee-fields.html
 * (including the username status and the Re-check / Simulate buttons),
 * then add a field labelled "Phone (optional)": <app-phone-input inputId="phone" [formField]="a.phone" />
 */
@Component({
  selector: 'app-attendee-fields',
  templateUrl: './attendee-fields.html',
})
export class AttendeeFields {
  readonly attendee = input.required<FieldTree<AttendeeForm>>();
}
