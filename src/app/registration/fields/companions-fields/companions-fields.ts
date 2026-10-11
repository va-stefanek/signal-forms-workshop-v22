import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { Person } from '../../../api/models';
import { FieldErrors } from '../../../shared/field-errors/field-errors';
import { emptyPerson } from '../../form/registration-form.model';
import { MAX_COMPANIONS } from '../../form/registration.schema';

@Component({
  selector: 'app-companions-fields',
  imports: [FormField, FieldErrors],
  templateUrl: './companions-fields.html',
  styleUrl: './companions-fields.css',
})
export class CompanionsFields {
  readonly companions = input.required<FieldTree<Person[]>>();
  protected readonly max = MAX_COMPANIONS;

  /** The field's value is a WritableSignal: the subform updates the parent model directly */
  add(): void {
    this.companions()().value.update((list) => [...list, emptyPerson()]);
  }

  remove(index: number): void {
    this.companions()().value.update((list) => list.filter((_, i) => i !== index));
  }
}
