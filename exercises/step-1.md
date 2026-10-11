# Step 1: Your First Signal Form

Module 1 · ~25 min · start: `git switch -c my-step-1 step-1-start`

**Goal:** build the first Signal Form. The form model is the domain model `Attendee`, on purpose. Module 2 shows why that stops working for bigger forms.

**Files:** `registration/registration-page/registration-page.ts` and `registration-page.html`

**Slides to look back at:** Creating Your First Signal Form, Template Binding: [formField], Field State, Built-in Validators, getError(kind), Three Error APIs.

**Done when green:** `registration-page.spec.ts`

---

## 1.1 Validation schema

**What:** give `form()` a schema with these rules:

| Field | Rules | Message for `required` |
|---|---|---|
| `firstName` | required | `First name is required` |
| `lastName` | required | `Last name is required` |
| `email` | required, email format | `Email is required` |
| `username` | required, 3 to 20 characters, `/^[a-z0-9_]+$/` | `Username is required` |

The test looks for the exact text **`Email is required`**. Use the same pattern for the other fields.

**Hint:** the schema is the second argument of `form()`. Each built-in validator accepts an optional config with a `message`.

**Checked by:** "starts invalid and becomes valid with correct data", "validates the email format", "validates username length and characters".

## 1.2 Bind the inputs

**What:** bind every `<input>` to its field with `[formField]`. Keep the existing `id`s, because the tests use them.

**Checked by:** "binds the inputs to the model in both directions".

## 1.3 Import `FormField`

**What:** make `[formField]` available in the component's template.

⚠️ **Do 1.2 and 1.3 together.** Until 1.3 is done, `[formField]` is an unknown property and the whole build fails with NG8002.

## 1.4 Show errors after touch

**What:** under each input, show its error messages, but only once the field was touched. For the username length errors, show the limit from the error itself instead of hard-coding 3 and 20.

**Hint:** the field state tells you whether it was touched. `getError(kind)` returns a typed error: length errors carry the configured limit.

**Checked by:** "shows an error message only after the field was touched". The test expects no `Email is required` before blur and the message after blur.

## 1.5 Disable the button

**What:** the Register button is disabled while the form is invalid.

**Checked by:** no test. Check it in the browser.

---

**Common pitfalls**
- Mixing up the field and its state: the field is a function, and calling it gives the state (`value()`, `touched()`, `errors()`…).
- Showing errors without checking touched: the form then starts covered in red.
