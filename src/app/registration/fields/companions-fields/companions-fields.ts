import { Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { Person } from '../../../api/models';

/**
 * TODO 4.3: list of companions
 *  - @for over companions(), track the field itself (NOT item.email().value(): NG01904)
 *  - inputs with ids companion-first-<i>, companion-last-<i>, companion-email-<i>
 *  - a "Remove" button per item with aria-label "Remove companion <n>"
 *  - an "+ Add companion" button, disabled at MAX_COMPANIONS
 *  - add()/remove(): update the array through the field's value signal
 */
@Component({
  selector: 'app-companions-fields',
  templateUrl: './companions-fields.html',
  styleUrl: './companions-fields.css',
})
export class CompanionsFields {
  readonly companions = input.required<FieldTree<Person[]>>();
}
