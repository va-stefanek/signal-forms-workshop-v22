import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { CompanyData } from '../../../api/models';
import { FieldErrors } from '../../../shared/field-errors/field-errors';
import { HINT } from '../../../shared/hint';
import { NipInput } from '../../../legacy/nip-input/nip-input';

/** Task 4.2 (exercises/step-4.md): invoice section as a subform */
@Component({
  selector: 'app-invoice-fields',
  imports: [FormField, FieldErrors, NipInput],
  templateUrl: './invoice-fields.html',
})
export class InvoiceFields {
  protected readonly HINT = HINT;
  readonly wantsInvoice = input.required<FieldTree<boolean>>();
  readonly invoice = input.required<FieldTree<CompanyData>>();
}
