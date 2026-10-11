# Signal Forms Workshop: Signal Conf registration

One application built in five steps, one step per workshop module.
Angular 22.2, Signal Forms (stable since v22.0), Vitest.

## Setup

Requirements: Node `^22.22.3`, `^24.15.0` or `>=26`, npm 10+.
Older Node 22 releases (e.g. 22.14) are rejected by the Angular CLI: `ng` does not start at all.
With nvm, `nvm use` picks the version from `.nvmrc` (it exists on every step). Run it in every new terminal, before `npm install`, `npm start` or `npm test`.

```bash
nvm use
npm install
npm start          # http://localhost:4200
npm test           # Vitest, watch mode
npx ng test --watch=false
```

There is no real server. `src/app/api/fake-backend.ts` is an HTTP interceptor with a deterministic
in-memory database (600 ms delay in the app, 0 ms in tests).

| Scenario | How to trigger |
|---|---|
| Edit an existing registration | "Edit registration #42" |
| Username taken | `admin`, `angular`, `root` |
| Username check fails (503) | `offline` |
| Someone takes your username meanwhile | "Simulate: someone takes it" |
| Field error from the server (422) | attendee email `taken@conf.dev` |
| Server crash (500) | attendee email `crash@conf.dev` |

## Project structure

```
src/app/
  api/                 models, RegistrationApi, fake backend (HTTP interceptor)
  registration/
    registration-page/ the page component and its integration tests
    form/              form model + mapping, validation schema, server error mapping
    fields/            subform components, one folder each (attendee, companions, payment, invoice)
    agenda-picker/
  shared/              reusable controls and helpers: field-errors, phone-input, HINT metadata
  legacy/              Reactive Forms code being migrated: feedback-form, nip-input (CVA), from step 5
  newsletter/          small flat form used for the WebMCP stretch goal, from step 5
  testing/             test helpers
```

Every component lives in its own folder with its template (`.html`), styles (`.css`) and tests.

## How the steps work

Every step has a start and a solution: `step-N-start` and `step-N-solution`, as tags and as branches with the same names.
`step-N-start` is always `step-(N-1)-solution` plus the TODOs and the tests of step N.

```bash
git add -A && git commit -m "my step 2"   # or git stash: keep your work before switching
git switch -c my-step-3 step-3-start   # start a step
npm test                               # the step's tests are red, earlier steps are green
git diff step-3-start step-3-solution  # the reference solution
```

Stuck or late? Leave your branch and start the next step from its tag. Nobody is left behind.

Search for `TODO N.x` in the code. Every task is described in detail in [exercises/](exercises/README.md). Each step is done when its tests are green.
Stretch goals are optional and have no tests.

## Step 1: Foundations (Module 1, ~25 min)

Full task descriptions: [exercises/step-1.md](exercises/step-1.md)

Goal: the first Signal Form. The form model is the domain model `Attendee`, on purpose.

- 1.1 schema: required fields, email format, username 3 to 20 chars and `/^[a-z0-9_]+$/`
- 1.2 bind the inputs with `[formField]`, 1.3 import `FormField`
- 1.4 show errors with `getError(kind)`, only after touch; use the typed `err.minLength`
- 1.5 disable the button while the form is invalid

Tests: `registration/registration-page/registration-page.spec.ts`

## Step 2: Form model design (Module 2, ~35 min)

Full task descriptions: [exercises/step-2.md](exercises/step-2.md)

Goal: the API shape and the UI shape diverge. The form model is given; write the mapping.

- 2.1 `emptyRegistrationForm()`: one entry per agenda slot
- 2.2 `domainToForm()`: flat `sessionIds` onto slots, payment union onto a static structure,
  optional invoice onto `wantsInvoice` + always-present `invoice`, `confirmEmail` = `email`
- 2.3 `formToDomain()`: the reverse; no `confirmEmail`, no `invoice` key when not wanted
- 2.4 `linkedSignal` from `httpResource` data (new vs edit #42)
- 2.5 disable the form while loading, with `{ when }`

Things to notice: radio inputs bind to `string` only, so "nothing chosen" is `''` in the form model
and absent/`null` in the domain model. Switch payment method back and forth: nothing is lost.

Tests: `registration/form/registration-form.model.spec.ts`, `registration/registration-page/registration-page.spec.ts`

## Step 3: Validation and submit (Module 3, ~40 min)

Full task descriptions: [exercises/step-3.md](exercises/step-3.md)

- 3.1 cross-field: `confirmEmail` equals `email`
- 3.2 async: `validateHttp` for the username, `debounce: 400`, own username allowed when editing
- 3.3 rule on the whole agenda array: at least 2 sessions
- 3.4 payment: `applyWhenValue` per branch
- 3.5 invoice: `applyWhen` driven by another field (`wantsInvoice`) + `companySchema`
- 3.6 `submission` in `form()` options: save, map 422 errors with `serverErrorsToTree`, focus the first invalid field
- 3.7 `reloadValidation()` for "Re-check" and the simulation button

Tests: `registration/form/registration.schema.spec.ts`, `registration/registration-page/registration-submit.spec.ts`

Stretch: validate the card expiry date is in the future (`validate` + `Date`).

## Step 4: Scalable architecture (Module 4, ~50 min)

Full task descriptions: [exercises/step-4.md](exercises/step-4.md)

- 4.1 `personSchema` reused by the attendee and every companion
- 4.2 subform components receiving `FieldTree` inputs: attendee, payment, invoice
- 4.3 companions array: add/remove through the field's value signal, `track` the field
- 4.4 array rules: max 3, `applyEach`, companion email different from the attendee email
- 4.5 `parsePhone` / `formatPhone`
- 4.6 `PhoneInput`: `FormValueControl`, `transformedValue`, `touch` output, `focus()`

Tests: `shared/phone-input/phone-input.spec.ts`, `registration/fields/companions-fields/companions-fields.spec.ts`, `registration/fields/subforms.spec.ts`

## Step 5: Production and migration (Module 5, ~30 min)

Full task descriptions: [exercises/step-5.md](exercises/step-5.md)

- 5.1 use the legacy `lib-nip-input` (ControlValueAccessor + NG_VALIDATORS) with `[formField]`
- 5.2 legacy feedback form: migrate only `email` to `SignalFormControl`, keep the template
- 5.3 `provideSignalFormsConfig`: `is-invalid` / `is-valid` classes
- 5.4 required marks from field state + `HINT` custom metadata
- 5.5 stretch: expose the newsletter form (`newsletter/newsletter-signup.ts`) to agents with WebMCP (experimental).
  Not the registration form: WebMCP infers its input schema from the model's value and gives up on
  `null`, `undefined` and empty arrays, which the registration form model contains on purpose (Module 2).
- 5.6 write your own test for a rule you added

Tests: `legacy/migration.spec.ts`, `registration/registration-page/production.spec.ts`
