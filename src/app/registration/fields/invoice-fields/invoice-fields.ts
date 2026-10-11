import { Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { CompanyData } from '../../../api/models';

/** TODO 4.2: move the invoice section of registration-page.html into invoice-fields.html (checkbox + company fields) */
@Component({
  selector: 'app-invoice-fields',
  templateUrl: './invoice-fields.html',
})
export class InvoiceFields {
  readonly wantsInvoice = input.required<FieldTree<boolean>>();
  readonly invoice = input.required<FieldTree<CompanyData>>();
}
