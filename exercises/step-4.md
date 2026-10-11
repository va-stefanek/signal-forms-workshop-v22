# Step 4: Schemas, Subforms, Custom Control

Module 4 · ~50 min · start: `git switch -c my-step-4 step-4-start`

**Goal:** split the big form into reusable schemas and subform components, add a dynamic array and write a custom control without ControlValueAccessor.

**Files:** `registration/form/registration.schema.ts`, `registration/fields/*/`, `registration/registration-page/registration-page.html` and `.ts`, `shared/phone-input/phone-input.ts`

**Slides to look back at:** Reusable Validation Schemas, Subforms, Custom Controls: End of ControlValueAccessor!, FormValueControl vs FormCheckboxControl, transformedValue(), Arrays in Template, Orphan Fields (NG01904), Arrays inside a Subform.

**Done when green:** `phone-input.spec.ts`, `companions-fields.spec.ts`, `subforms.spec.ts`

**Suggested order:** 4.1 → 4.2 (start with payment, the smallest section) → 4.3 + 4.4 → 4.5 → 4.6.

---

## 4.1 `personSchema`

**What:** move the shared person rules (`firstName` and `lastName` required, `email` required + format) into `personSchema`. `attendeeSchema` reuses it. Every companion gets it in 4.4.

## 4.2 Subform components

**What:** move the attendee, payment and invoice sections of `registration-page.html` into `attendee-fields`, `payment-fields` and `invoice-fields`. Each component already declares its `FieldTree` input.
- `registration-page.html` renders the three components instead of the sections. Import them in `registration-page.ts`.
- The page gets a new **Companions** section with `app-companions-fields` (Task 4.3).
- Attendee: the username status and the Re-check / Simulate buttons move too, together with their methods. The subform gets `RegistrationApi` itself.
- Attendee: add a phone field labelled `Phone (optional)` with `app-phone-input` (`inputId="phone"`), bound to `phone`.

**Hint:** a `FieldTree` input is a signal holding a field, and the field is a function returning its state.

**Checked by:** "renders every section as its own component", "subforms still take part in the parent form state", "binds the phone custom control inside the attendee subform".

## 4.3 Companions list

**What:** in `companions-fields`:
- Render one row per companion.
- Input ids `companion-first-<i>`, `companion-last-<i>`, `companion-email-<i>` (0-based).
- A "Remove" button per item with `aria-label` **`Remove companion <n>`**, where `n` counts from 1.
- A "+ Add companion" button, disabled at `MAX_COMPANIONS`.
- `add()` / `remove(i)` change the array. A subform has no model signal.

**Hint:** the field's value is writable. `emptyPerson()` is ready to use. Tracking a row by a property value causes NG01904 (slide "Orphan Fields").

**Checked by:** "adds and removes companions through the subform", "keeps the remaining items editable after removing one from the middle", "sends companions to the API".

## 4.4 Array rules

**What:** in `registrationSchema`:
- At most `MAX_COMPANIONS` items.
- `personSchema` for every item.
- A companion's email must differ from the attendee's email, case-insensitive. Error kind: **`duplicateEmail`**, message `Companions need their own email`.

**Hint:** length validators also work on arrays. A rule for each item may read fields outside the array.

**Checked by:** "applies the person schema to every companion", "rejects a companion with the attendee email", "allows at most 3 companions".

## 4.5 `parsePhone` / `formatPhone`

**What:**
- `parsePhone(raw)`:
  - Ignore spaces and dashes.
  - `""` → `{ value: null }`.
  - 9 digits → `+48` + digits.
  - `+` and 8 to 15 digits → as is.
  - Anything else → an error of kind `parse` with a message.
- `formatPhone(value)`:
  - `+48600700800` → `+48 600 700 800`.
  - Other countries are shown as stored.
  - `null` → `""`.

**Checked by:** the `parsePhone` / `formatPhone` tests in `phone-input.spec.ts`.

## 4.6 `PhoneInput`: a custom control

**What:** implement `FormValueControl<string | null>`:
- `value` (done), plus the optional state inputs `disabled`, `invalid` and `touched`.
- A `touch` output, emitted on blur. Since v22 a control cannot un-touch a field.
- The `<input type="tel">` shows the formatted text and writes the parsed value, using `parsePhone` / `formatPhone`.
- `focus(options)`, so that `focusBoundControl()` works.
- An `inputId` input, used as the `<input>` id.

**Hint:** slides "transformedValue()" and "FormValueControl vs FormCheckboxControl". Parse errors reach the parent field on their own.

**Checked by:** "shows the model value formatted", "writes the normalized value to the model", "keeps the model unchanged and reports a parse error on garbage", "marks the field as touched on blur…", "can be focused with focusBoundControl()".

---

**Common pitfalls**
- Until 4.2 is done the page still renders every section inline; the subform components only show a "TODO 4.x" placeholder, and nothing uses them yet.
- Removing an item from the middle breaks the remaining rows: you are tracking by a property value (NG01904).
