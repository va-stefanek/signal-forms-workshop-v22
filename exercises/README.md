# Exercises

One application, the Signal Conf 2026 registration, built in five steps. Each step belongs to one workshop module.

| Step | Module | Planned | Description |
|---|---|---|---|
| 1 | Foundations | ~25 min | [step-1.md](step-1.md): your first Signal Form |
| 2 | Form model design | ~35 min | [step-2.md](step-2.md): form model ≠ domain model |
| 3 | Validation and submit | ~40 min | [step-3.md](step-3.md): cross-field, async, conditional rules, submission |
| 4 | Scalable architecture | ~50 min | [step-4.md](step-4.md): schemas, subforms, arrays, a custom control |
| 5 | Production and migration | ~30 min | [step-5.md](step-5.md): legacy interop, config, metadata, your own test |

## Before the first step

```bash
nvm use          # in every new terminal; reads .nvmrc (needs Node ^22.22.3, ^24.15.0 or >=26)
npm install
npm start        # http://localhost:4200
```

## How a step works

```bash
git add -A && git commit -m "my step 2"   # or git stash: keep your work before switching
git switch -c my-step-3 step-3-start   # start the step
npm test                               # the step's tests are red, earlier steps are green
```

- Every task has a number (`3.4`) and a `TODO 3.4` comment at the place in the code where you work.
- Each step file lists, per task: what to do, where, the exact values the tests check, a hint and the tests that check it.
- Every step exists as a tag and as a branch with the same name (`step-3-start`, `step-3-solution`).
- A step is done when its tests are green. Stretch goals are optional and have no tests.
- Stuck or late? Start the next step from its tag. `git diff step-N-start step-N-solution` shows the reference solution.

## Fake backend

There is no real server. `src/app/api/fake-backend.ts` answers after 600 ms in the app and immediately in tests.

| Scenario | How to trigger |
|---|---|
| Edit an existing registration | "Edit registration #42" |
| Username taken | `admin`, `angular`, `root` |
| Username check fails (503) | `offline` |
| Someone takes your username meanwhile | "Simulate: someone takes it" |
| Field error from the server (422) | attendee email `taken@conf.dev` |
| Server crash (500) | attendee email `crash@conf.dev` |

## Where things live

```
src/app/
  api/                 models, RegistrationApi, fake backend
  registration/
    registration-page/ the page component and its integration tests
    form/              form model + mapping, validation schema, server error mapping
    fields/            subform components (attendee, companions, payment, invoice)
    agenda-picker/
  shared/              field-errors, phone-input, HINT metadata
  legacy/              Reactive Forms code being migrated: feedback-form, nip-input (from step 5)
  newsletter/          small flat form for the WebMCP stretch goal (from step 5)
  testing/             test helpers (setupPage, settle, fillValidForm)
```
