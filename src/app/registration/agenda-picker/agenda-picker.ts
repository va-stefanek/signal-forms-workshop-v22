import { Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FieldTree, FormField } from '@angular/forms/signals';
import { Agenda, Slot } from '../../api/models';
import { AgendaSlotForm } from '../form/registration-form.model';

/**
 * Renders the agenda grid: one radio group per slot.
 * Receives a PORTION of the parent's field tree (the `agenda` array).
 */
@Component({
  selector: 'app-agenda-picker',
  imports: [FormField, DatePipe],
  templateUrl: './agenda-picker.html',
  styleUrl: './agenda-picker.css',
})
export class AgendaPicker {
  readonly slots = input.required<FieldTree<AgendaSlotForm[]>>();
  readonly agenda = input.required<Agenda>();

  protected readonly slotById = computed(
    () => new Map<string, Slot>(this.agenda().slots.map((slot) => [slot.id, slot])),
  );
}
