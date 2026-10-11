# Step 3: Validation and Submit

Module 3 · ~40 min · start: `git switch -c my-step-3 step-3-start`

**Goal:** cross-field, async, array and conditional rules, then a complete submission flow with server errors.

**Files:** `registration/form/registration.schema.ts`, `registration/registration-page/registration-page.ts`

**Slides to look back at:** Cross-Field Validation, FieldContext: valueOf() vs stateOf(), Conditional Validation: applyWhen() / applyWhenValue(), when vs applyWhen vs applyWhenValue, Async Validation: validateHttp(), reloadValidation(), errorSummary(), Form-level Submission Options, focusBoundControl() + errorSummary().

**Done when green:** `registration.schema.spec.ts`, `registration-submit.spec.ts`

---

## 3.1 Cross-field: repeat email

**What:** `confirmEmail` is required (message `Repeat your email`) and must equal `email` (error kind **`emailMismatch`**, message `Emails do not match`).

**Hint:** a custom validator can read another field through its context. The rule then re-runs when that field changes.

**Checked by:** "reports a mismatch and clears it when email changes".

## 3.2 Async: username availability

**What:** an HTTP check on `f.attendee.username`:
- `GET /api/usernames/<name>/availability` → `{ available: boolean }`
- no request unless the username matches `/^[a-z0-9_]{3,20}$/`
- when editing (`f.id` has a value), add `?registrationId=<id>` so your own username counts as available
- debounce 400 ms
- kinds: **`usernameTaken`** when not available, **`usernameCheckFailed`** when the request fails

**Checked by:** "reports a taken username after the debounce", "does not call the server for syntactically invalid usernames", "reports when the check itself fails", "treats your own username as available when editing".

## 3.3 Rule on the whole agenda array

**What:** at least 2 sessions chosen in `f.agenda`. Error kind: **`minSessions`**.

**Hint:** a rule can target the array itself, not only its items.

**Checked by:** "requires at least two sessions".

## 3.4 Payment: only the active branch

**What:**
- `method` is required.
- Card branch, only when the method is `card`: all fields required, card number 16 digits (`/^\d{16}$/`), expiry `MM/YY` (`/^(0[1-9]|1[0-2])\/\d{2}$/`).
- Transfer branch, only when the method is `transfer`: all fields required, IBAN `/^PL\d{26}$/`.

**Hint:** the condition depends on the value of the payment object itself.

⚠️ Inside a conditional schema, use only the path the callback receives. Paths from the outer schema throw NG01908: “A FieldPath can only be used directly within the Schema that owns it”.

**Checked by:** "requires a method", "validates only the active branch", "checks the card formats".

## 3.5 Invoice: only when wanted

**What:** fill `companySchema`: every field required, NIP 10 digits (`/^\d{10}$/`), postal code `00-000` (`/^\d{2}-\d{3}$/`). It applies to `f.invoice` only when `f.wantsInvoice` is true.

**Hint:** here the condition lives in ANOTHER field. Compare with 3.4 and the slide "when vs applyWhen vs applyWhenValue".

**Checked by:** "is validated only when wantsInvoice is checked".

## 3.6 Submission

**What:** define the submission in the `form()` options. The template already uses `[formRoot]`, so the Register button triggers it.
- Save `formToDomain(...)` of the form value with `this.api.save()`.
- On success, set `lastSaved` and `registrationId`, and return `null` (no errors).
- On error, return the result of the provided `serverErrorsToTree(error, f)`. It maps a 422 onto fields and anything else onto the form root.
- On an invalid submit, focus the first field that has an error.

**Hint:** `api.save()` **rejects** on HTTP errors. The slides "errorSummary()" and "focusBoundControl() + errorSummary()" cover the invalid case.

**Checked by:** "does not call the API for an invalid form and focuses the first error", "saves a valid form and switches to edit mode", "maps a 422 field error from the server onto the email field", "shows a form-level error when the server crashes". Try `taken@conf.dev` and `crash@conf.dev` in the browser.

## 3.7 Re-check without changing the value

**What:** `recheckUsername()` re-runs the async check for the same value.

**Checked by:** no test calls `recheckUsername()` yet. Check it in the browser: type a free username, click "Simulate: someone takes it". The field should turn invalid.

---

**Stretch:** the card expiry date must be in the future. The test helper fills `12/28`, so this rule turns the submit tests red from January 2029.

**Common pitfalls**
- Copying conditional-schema examples that use the outer form path (NG01908, see 3.4).
- Not handling the rejected `api.save()` in 3.6: a 422 then never reaches the email field.
