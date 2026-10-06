import { Injectable, signal } from '@angular/core';

/** Small shared state: lets a service card pre-select the project type in the contact form. */
@Injectable({ providedIn: 'root' })
export class UiState {
  readonly contactType = signal<{ type: string; n: number } | null>(null);
  private n = 0;

  /** Scroll to the contact form, optionally choosing a project type first. */
  goToContact(type?: string): void {
    if (type) this.contactType.set({ type, n: ++this.n });
    document.getElementById('contact')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
}
