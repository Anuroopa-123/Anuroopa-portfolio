import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, tap, timeout } from 'rxjs';

import { SITE } from '../site.config';
import { Content } from './models';

/**
 * Loads the portfolio content (projects, skills, services, experience).
 * First choice is the FastAPI backend, which reads PostgreSQL. If the backend is slow or down,
 * the page falls back to /content.json, a copy of the same data shipped with the site,
 * so the portfolio never shows an empty screen.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);

  readonly content = signal<Content | null>(null);
  /** 'api' = came from the database, 'fallback' = came from the bundled file. */
  readonly source = signal<'api' | 'fallback' | null>(null);

  load(): void {
    this.http
      .get<Content>(`${SITE.apiBase}/content`)
      .pipe(
        timeout(4000),
        tap(() => this.source.set('api')),
        catchError(() => this.http.get<Content>('/content.json').pipe(tap(() => this.source.set('fallback')))),
      )
      .subscribe({
        next: (data) => this.content.set(data),
        error: () => this.content.set({ services: [], skills: [], projects: [], experience: [] }),
      });
  }
}
