# Step 5: Migration and Production

Module 5 · ~30 min · start: `git switch -c my-step-5 step-5-start`

**Goal:** make Signal Forms live next to legacy Reactive Forms code, configure them for production and test your own rule.

**Files:** `registration/fields/invoice-fields/`, `legacy/feedback-form/feedback-form.ts`, `app.config.ts`, `registration/fields/attendee-fields/`, `registration/form/registration.schema.ts`

**Slides to look back at:** Testing Signal Forms, Migration: SignalFormControl Bridge, Custom Controls Work Both Ways, SignalFormsConfig: CSS Classes, Metadata: Proactive UX, Signal Forms as WebMCP Tools.

**Done when green:** `legacy/migration.spec.ts`, `registration/registration-page/production.spec.ts`

---

## 5.1 Legacy CVA with `[formField]`

**What:** in `invoice-fields.html`, the NIP field uses the company library component `lib-nip-input` (`legacy/nip-input/`, a ControlValueAccessor with `NG_VALIDATORS`) with `inputId="nip"`, bound to the `nip` field. Its checksum error (`nipChecksum`) shows up on the Signal Forms field next to the schema errors.

**Checked by:** "writes digits to the model and shows the formatted value", "formats a value coming from the model", "propagates the NG_VALIDATORS error…", "still reports schema errors next to the CVA errors".

## 5.2 `SignalFormControl` in a legacy form

**What:** in `FeedbackForm`, migrate ONLY the `email` control to a `SignalFormControl` with Signal Forms rules (required + email format). Do not touch the template: `formControlName` and `hasError()` keep working.

**Stretch:** show the email domain next to the Send button, computed from the control's value signal. This one may touch the template.

**Checked by:** "makes the FormGroup invalid through signal rules", "works with formControlName in the old template", "uses a SignalFormControl for email and exposes its value as a signal".

## 5.3 CSS classes for every `[formField]`

**What:** in `FORM_FIELD_CLASSES` (`app.config.ts`):
- `is-invalid` when the field is touched and invalid.
- `is-valid` when the field is touched, valid and not pending.

**Hint:** each predicate receives the `FormFieldBinding`, not the field state. The state is one step further.

**Checked by:** "adds is-invalid to touched invalid fields", "adds is-valid once the field is fixed".

## 5.4 Required marks and hints from metadata

**What:**
- In the attendee labels, required fields get `<span class="required-mark" aria-hidden="true">*</span>`. Read “required” from the field state, not from a hard-coded list.
- Replace the hard-coded hints with `HINT` metadata (`shared/hint.ts`). Set the hints in the schemas that hold the field's rules: `attendeeSchema` for username and phone, `companySchema` for NIP. The `TODO 5.4` comments sit at these places.
- Show each hint in a `<span class="hint">` under its field. Phone already has one with hard-coded text; **username** (`attendee-fields.html`) and **NIP** (`invoice-fields.html`) need a new one.

| Field | Hint text |
|---|---|
| username | `3 to 20 characters: a-z, 0-9 and _` (the test looks for `3 to 20 characters`) |
| phone | `9 digits for Poland, or +country code` |
| NIP | `Polish tax id, the checksum is verified` |

**Checked by:** "exposes hints through custom metadata", "marks required fields from validator metadata". The phone label must not get a mark, because phone is optional.

## 5.6 Your own test

**What:** write a test for a rule you added or care about. Save it next to the code it tests, e.g. `registration/form/my-rules.spec.ts`.

**Hint:** a schema can be tested without any component, because `form()` only needs an injection context. For page-level tests, `testing/page-harness.ts` has `setupPage`, `settle` and `fillValidForm`.

---

## Stretch 5.5: WebMCP (experimental)

**What:** expose the **newsletter** form (`newsletter/newsletter-signup.ts`) to in-browser agents as a WebMCP tool. See the slide "Signal Forms as WebMCP Tools".

**Why not the registration form?** WebMCP infers the tool's input schema from the model's current value. It gives up on `null`, `undefined` and empty arrays: “Could not accurately infer WebMCP schema”. The registration model contains them on purpose (Module 2), so it cannot be a WebMCP tool. The newsletter form is flat: strings and a boolean only.

**Checked by:** no test. WebMCP itself is behind a Chrome flag.
