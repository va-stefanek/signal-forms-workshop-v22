# Step 2: Form Model ≠ Domain Model

Module 2 · ~35 min · start: `git switch -c my-step-2 step-2-start`

**Goal:** the API shape (`Registration` in `api/models.ts`) and the UI shape (`RegistrationForm`) diverge. The form model is given; you write the mapping and load data into the form.

**Files:** `registration/form/registration-form.model.ts`, `registration/registration-page/registration-page.ts`

**Slides to look back at:** Form Model vs Domain Model, Empty Values Depend on the Control, Avoid Dynamic Structure!, Transforming Models, Using linkedSignal for API Data, linkedSignal with Several Sources, Loading from API with Resource.

**Done when green:** `registration-form.model.spec.ts`, `registration-page.spec.ts`

**Why the shapes differ**

| API (`Registration`) | Form (`RegistrationForm`) | Reason |
|---|---|---|
| `sessionIds: string[]` | `agenda: { slotId, sessionId }[]`, one per slot | one radio group per time slot |
| `payment: Payment \| null` (card or transfer union) | `payment: { method, card, transfer }` | static structure: switching method keeps typed data |
| `invoice?: CompanyData` | `wantsInvoice: boolean` + `invoice: CompanyData` | no optional fields in the form model |
| no `confirmEmail` | `attendee.confirmEmail` | UI-only field |
| `payment: null` | `method: ''` | radio inputs bind strings only: `''` = nothing chosen |

---

## 2.1 `emptyRegistrationForm(agenda)`

**What:** return an empty form with one `{ slotId, sessionId: '' }` entry per agenda slot.

**Checked by:** "creates one empty entry per agenda slot", "has no undefined values anywhere".

## 2.2 `domainToForm(registration, agenda)`

**What:** API → form.
- `sessionIds` → one entry per agenda slot. An empty slot gets `sessionId: ''`.
- `confirmEmail` starts equal to `email`.
- The payment union becomes the static `PaymentForm`: fill the active branch, keep the other one empty.
- An optional `invoice` becomes `wantsInvoice` + an always-present `invoice`.

**Hint:** a session belongs to the slot whose `sessions` contain its id. `EMPTY_PAYMENT` and `EMPTY_COMPANY` are ready to use.

**Checked by:** "maps the flat sessionIds list onto agenda slots", "pre-fills confirmEmail with the email", "keeps both payment branches and selects the right method", "turns an existing invoice into wantsInvoice + invoice", "fills an empty invoice when the registration has none".

## 2.3 `formToDomain(form)`

**What:** form → API.
- Drop `confirmEmail`.
- Agenda entries → `sessionIds`, skipping empty slots.
- Only the active payment branch, or `null` when no method is chosen.
- Add the `invoice` key only when `wantsInvoice` is true. Do not leave an `invoice: undefined` key behind.

**Checked by:** "round-trips a registration", "never sends the UI-only confirmEmail field", "omits the invoice key when wantsInvoice is false…", "sends only the active payment branch", "sends null payment when no method is chosen".

## 2.4 `linkedSignal` from two resources

**What:** the form model is recomputed from the agenda and, when `registrationId()` is set, the loaded registration.
- registration loaded → `domainToForm(registration, agenda)`
- otherwise → `emptyRegistrationForm(agenda ?? { slots: [] })`

**Hint:** `linkedSignal` can depend on several signals at once. If TypeScript cannot infer the types, pass them explicitly.

**Checked by:** "creates an empty form with one entry per agenda slot", "loads registration #42 into the form".

## 2.5 Disable the form while loading

**What:** the whole form is disabled while `loading()` is true.

**Hint:** use the `{ when }` option. Passing a plain function is deprecated in v22.

**Checked by:** "disables the form while loading".

---

**Try it:** pick Card, type a card number, switch to Bank transfer and back. The card data is still there, because both branches always exist in the form model.
