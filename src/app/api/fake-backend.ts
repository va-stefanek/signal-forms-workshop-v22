import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';
import { Observable, mergeMap, of, throwError, timer } from 'rxjs';
import { Agenda, Registration, ServerValidationErrors } from './models';

/**
 * FAKE BACKEND (deterministic, in memory)
 *
 * GET  /api/agenda                               -> Agenda
 * GET  /api/registrations/:id                    -> Registration (try "42")
 * POST /api/registrations                        -> Registration with id
 * PUT  /api/registrations/:id                    -> Registration
 * GET  /api/usernames/:name/availability         -> { available: boolean }
 *      ?registrationId=42                         -> a username owned by that registration counts as available
 * POST /api/usernames/:name/take                 -> simulates someone else taking a username
 *
 * Scenarios:
 * - usernames "admin", "angular" and "root" are always taken
 * - saving with attendee email "taken@conf.dev"  -> 422 with a field error on attendee.email
 * - saving with attendee email "crash@conf.dev"  -> 500
 * - username "offline"                           -> availability check fails with 503
 */

export const FAKE_BACKEND_DELAY = new InjectionToken<number>('FAKE_BACKEND_DELAY', {
  providedIn: 'root',
  factory: () => 600,
});

export const AGENDA: Agenda = {
  slots: [
    {
      id: 'slot-1', startsAt: '2026-11-20T09:30:00+01:00', endsAt: '2026-11-20T10:30:00+01:00',
      sessions: [
        { id: 's-keynote', title: 'Keynote: Angular in 2027', speaker: 'Anna Nowak', track: 'Main stage' },
        { id: 's-zoneless', title: 'Zoneless in a 10-year-old codebase', speaker: 'Piotr Lis', track: 'Deep dive' },
      ],
    },
    {
      id: 'slot-2', startsAt: '2026-11-20T11:00:00+01:00', endsAt: '2026-11-20T12:00:00+01:00',
      sessions: [
        { id: 's-forms', title: 'Signal Forms at scale', speaker: 'Ewa Wrona', track: 'Main stage' },
        { id: 's-aria', title: 'Accessible components with Angular Aria', speaker: 'Jan Kos', track: 'Deep dive' },
        { id: 's-ws-forms', title: 'Hands-on: custom form controls', speaker: 'Ola Mazur', track: 'Workshop' },
      ],
    },
    {
      id: 'slot-3', startsAt: '2026-11-20T13:00:00+01:00', endsAt: '2026-11-20T14:00:00+01:00',
      sessions: [
        { id: 's-resource', title: 'Resources and router resources', speaker: 'Tomasz Bury', track: 'Main stage' },
        { id: 's-testing', title: 'Vitest Browser Mode for Angular', speaker: 'Marta Zięba', track: 'Deep dive' },
      ],
    },
    {
      id: 'slot-4', startsAt: '2026-11-20T14:30:00+01:00', endsAt: '2026-11-20T15:30:00+01:00',
      sessions: [
        { id: 's-ai', title: 'Agents, MCP and WebMCP in Angular apps', speaker: 'Kamil Sowa', track: 'Main stage' },
        { id: 's-ssr', title: 'Incremental hydration in practice', speaker: 'Iga Dąb', track: 'Deep dive' },
        { id: 's-ws-ai', title: 'Hands-on: Angular skills for coding agents', speaker: 'Leon Gil', track: 'Workshop' },
      ],
    },
  ],
};

const SEED: Record<string, Registration> = {
  '42': {
    id: '42',
    attendee: {
      firstName: 'Katarzyna',
      lastName: 'Nowicka',
      email: 'kasia@example.com',
      username: 'kasia_dev',
      phone: '+48600700800',
    },
    companions: [{ firstName: 'Marek', lastName: 'Nowicki', email: 'marek@example.com' }],
    sessionIds: ['s-keynote', 's-ws-forms', 's-ai'],
    payment: { method: 'transfer', payerName: 'Nowicka Software Sp. z o.o.', iban: 'PL61109010140000071219812874' },
    invoice: {
      name: 'Nowicka Software Sp. z o.o.',
      nip: '5252248481',
      street: 'Prosta 1',
      city: 'Warszawa',
      postalCode: '00-850',
    },
  },
};

interface BackendState {
  registrations: Record<string, Registration>;
  /** username -> id of the registration that owns it (null = owned by someone else) */
  takenUsernames: Map<string, string | null>;
  nextId: number;
}

function createState(): BackendState {
  return {
    registrations: structuredClone(SEED),
    takenUsernames: new Map<string, string | null>([
      ['admin', null],
      ['angular', null],
      ['root', null],
      ['kasia_dev', '42'],
    ]),
    nextId: 100,
  };
}

let state = createState();

/** Resets the in-memory database. Call it in beforeEach of your tests. */
export function resetFakeBackend(): void {
  state = createState();
}

export const fakeBackend: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }
  const ms = inject(FAKE_BACKEND_DELAY);
  return timer(ms).pipe(mergeMap(() => handle(req)));
};

function handle(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  const parsed = new URL(req.urlWithParams, 'http://fake.local');
  const url = parsed.pathname;
  let m: RegExpMatchArray | null;

  if (req.method === 'GET' && url === '/api/agenda') {
    return ok(AGENDA);
  }
  if (req.method === 'GET' && (m = url.match(/^\/api\/registrations\/([^/]+)$/))) {
    const found = state.registrations[m[1]];
    return found ? ok(structuredClone(found)) : fail(404, { message: 'Not found' });
  }
  if ((req.method === 'POST' && url === '/api/registrations') ||
      (req.method === 'PUT' && (m = url.match(/^\/api\/registrations\/([^/]+)$/)))) {
    return save(req.body as Registration, req.method === 'PUT' ? m![1] : null);
  }
  if (req.method === 'GET' && (m = url.match(/^\/api\/usernames\/([^/]+)\/availability$/))) {
    const name = decodeURIComponent(m[1]).toLowerCase();
    if (name === 'offline') {
      return fail(503, { message: 'Username service unavailable' });
    }
    const owner = state.takenUsernames.get(name);
    const ownId = parsed.searchParams.get('registrationId');
    const available = owner === undefined || (owner !== null && owner === ownId);
    return ok({ available });
  }
  if (req.method === 'POST' && (m = url.match(/^\/api\/usernames\/([^/]+)\/take$/))) {
    state.takenUsernames.set(decodeURIComponent(m[1]).toLowerCase(), null);
    return ok({ taken: true });
  }
  return fail(404, { message: `No fake handler for ${req.method} ${url}` });
}

function save(body: Registration, id: string | null): Observable<HttpEvent<unknown>> {
  const email = body?.attendee?.email?.toLowerCase();
  if (email === 'crash@conf.dev') {
    return fail(500, { message: 'Internal server error' });
  }
  const errors: ServerValidationErrors['errors'] = [];
  if (email === 'taken@conf.dev') {
    errors.push({ path: 'attendee.email', message: 'This email is already registered' });
  }
  const sameSlotTwice = new Set(body.sessionIds).size !== body.sessionIds.length;
  if (sameSlotTwice) {
    errors.push({ path: 'sessionIds', message: 'Duplicated session' });
  }
  if (errors.length) {
    return fail(422, { errors } satisfies ServerValidationErrors);
  }
  const saved: Registration = { ...structuredClone(body), id: id ?? String(state.nextId++) };
  state.registrations[saved.id!] = saved;
  state.takenUsernames.set(saved.attendee.username.toLowerCase(), saved.id);
  return ok(structuredClone(saved));
}

function ok<T>(body: T): Observable<HttpEvent<T>> {
  return of(new HttpResponse({ status: 200, body }));
}

function fail(status: number, error: unknown): Observable<never> {
  return throwError(() => new HttpErrorResponse({ status, error }));
}
