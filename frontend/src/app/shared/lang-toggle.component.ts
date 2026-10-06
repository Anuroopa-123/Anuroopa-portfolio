import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { I18nService } from '../core/i18n.service';

/** EN | தமிழ். The coloured thumb slides to the chosen language. */
@Component({
  selector: 'app-lang-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toggle" role="group" [attr.aria-label]="i18n.t('lang.label')" [attr.data-lang]="i18n.lang()">
      <span class="thumb" aria-hidden="true"></span>
      <button type="button" [attr.aria-pressed]="i18n.lang() === 'en'" (click)="i18n.set('en')" lang="en">EN</button>
      <button type="button" [attr.aria-pressed]="i18n.lang() === 'ta'" (click)="i18n.set('ta')" lang="ta">தமிழ்</button>
    </div>
  `,
  styles: `
    .toggle { position: relative; display: inline-grid; grid-template-columns: 1fr 1fr; border-radius: 999px; padding: 3px; background: var(--glass-strong); border: 1px solid var(--accent-line); }
    .thumb { position: absolute; top: 3px; bottom: 3px; left: 3px; width: calc(50% - 3px); border-radius: 999px; background: var(--ink); transition: transform 0.3s cubic-bezier(0.3, 0.8, 0.3, 1); }
    [data-lang='ta'] .thumb { transform: translateX(100%); }
    button { position: relative; z-index: 1; min-width: 3.2em; padding: 0.4em 0.85em; border: 0; background: none; border-radius: 999px; font-weight: 800; font-size: 0.82rem; line-height: 1.3; cursor: pointer; color: var(--ink-2); transition: color 0.25s; }
    button[aria-pressed='true'] { color: #fff; }
  `,
})
export class LangToggleComponent {
  protected readonly i18n = inject(I18nService);
}
