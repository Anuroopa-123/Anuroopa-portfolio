import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { I18nService } from '../core/i18n.service';
import { RevealDirective, TiltDirective } from '../shared/interaction.directives';

@Component({
  selector: 'app-why',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, TiltDirective],
  template: `
    <section id="why" class="section" aria-labelledby="why-h">
      <div class="container">
        <div class="section-head" appReveal><h2 id="why-h">{{ i18n.t('why.title') }}</h2></div>
        <ul class="bento">
          @for (n of items; track n; let i = $index) {
            <li class="glass tilt" appTilt="4" [appReveal]="i * 70" [class.big]="i === 0">
              <h3>{{ i18n.t('why.' + n + '.t') }}</h3><p>{{ i18n.t('why.' + n + '.d') }}</p>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    h2 { font-family: var(--f-display); font-size: clamp(1.8rem, 4vw, 3rem); margin: 0; }
    .bento { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
    .bento li { grid-column: span 2; padding: 26px; border-radius: var(--r-lg); display: grid; gap: 8px; align-content: start; }
    .bento li.big { grid-column: span 4; background: var(--turmeric); border-color: var(--turmeric); }
    .bento li:nth-child(5) { grid-column: span 2; }
    h3 { margin: 0; font-family: var(--f-display); font-size: 1.05rem; } p { margin: 0; color: var(--ink-2); }
    .big p { color: var(--ink); }
    @media (max-width: 820px) { .bento li, .bento li.big { grid-column: span 6; } }
  `,
})
export class WhySection {
  protected readonly i18n = inject(I18nService);
  protected readonly items = [1, 2, 3, 4, 5];
}
