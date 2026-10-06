import { Injectable, effect, signal } from '@angular/core';

import { I18nText, Lang } from './models';
import { UI } from './translations';

/**
 * Runtime English / Tamil switch.
 *
 * Why not Angular's built-in i18n? It builds one copy of the site per language, so changing language
 * reloads another URL. A visitor-facing toggle that swaps text instantly needs a runtime approach.
 * The choice is saved in localStorage so it survives a refresh.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(this.initial());

  constructor() {
    effect(() => {
      document.documentElement.lang = this.lang();
    });
  }

  /** Fixed interface text by key. Reading lang() makes every template that calls this update on switch. */
  t(key: string): string {
    const row = UI[key];
    return row ? row[this.lang()] : key;
  }

  /** Content text that arrives as { en, ta } from content.json or the API. Falls back to English. */
  tr(value: I18nText | undefined | null): string {
    return value ? value[this.lang()] || value.en : '';
  }

  set(next: Lang): void {
    if (next === this.lang()) return;
    const root = document.documentElement;
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fade the page out, swap the text while it is invisible, then fade back in.
    root.classList.add('lang-switching');
    setTimeout(
      () => {
        this.lang.set(next);
        try {
          localStorage.setItem('pf-lang', next);
        } catch {
          /* storage can be blocked; the choice just won't persist */
        }
        requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('lang-switching')));
      },
      calm ? 0 : 190,
    );
  }

  private initial(): Lang {
    try {
      const saved = localStorage.getItem('pf-lang');
      if (saved === 'en' || saved === 'ta') return saved;
    } catch {
      /* ignore */
    }
    return navigator.language?.toLowerCase().startsWith('ta') ? 'ta' : 'en';
  }
}
