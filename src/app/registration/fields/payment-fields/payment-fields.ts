import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { FieldErrors } from '../../../shared/field-errors/field-errors';
import { PaymentForm } from '../../form/registration-form.model';

@Component({
  selector: 'app-payment-fields',
  imports: [FormField, FieldErrors],
  templateUrl: './payment-fields.html',
})
export class PaymentFields {
  readonly payment = input.required<FieldTree<PaymentForm>>();
}
