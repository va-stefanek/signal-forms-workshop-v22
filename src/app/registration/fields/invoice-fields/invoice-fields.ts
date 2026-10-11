import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { CompanyData } from '../../../api/models';
import { FieldErrors } from '../../../shared/field-errors/field-errors';

@Component({
  selector: 'app-invoice-fields',
  imports: [FormField, FieldErrors],
  templateUrl: './invoice-fields.html',
})
export class InvoiceFields {
  readonly wantsInvoice = input.required<FieldTree<boolean>>();
  readonly invoice = input.required<FieldTree<CompanyData>>();
}
