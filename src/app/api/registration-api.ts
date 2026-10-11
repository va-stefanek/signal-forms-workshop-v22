import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Registration } from './models';

@Service()
export class RegistrationApi {
  private readonly http = inject(HttpClient);

  save(registration: Registration): Promise<Registration> {
    return firstValueFrom(
      registration.id
        ? this.http.put<Registration>(`/api/registrations/${registration.id}`, registration)
        : this.http.post<Registration>('/api/registrations', registration),
    );
  }

  /** Simulates another user grabbing this username on the server. */
  takeUsername(username: string): Promise<unknown> {
    return firstValueFrom(this.http.post(`/api/usernames/${encodeURIComponent(username)}/take`, {}));
  }
}
