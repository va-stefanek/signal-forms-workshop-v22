import { Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { PaymentForm } from '../../form/registration-form.model';

/** TODO 4.2: move the payment section of registration-page.html into payment-fields.html */
@Component({
  selector: 'app-payment-fields',
  templateUrl: './payment-fields.html',
})
export class PaymentFields {
  readonly payment = input.required<FieldTree<PaymentForm>>();
}
