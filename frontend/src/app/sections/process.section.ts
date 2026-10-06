import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { I18nService } from '../core/i18n.service';
import { UiState } from '../core/ui-state.service';
import { RevealDirective } from '../shared/interaction.directives';

@Component({
  selector: 'app-process',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="process" class="section" aria-labelledby="proc-h">
      <div class="container">
        <div class="section-head" appReveal><h2 id="proc-h">{{ i18n.t('process.1.t') }} → {{ i18n.t('process.4.t') }}</h2></div>
        <ol class="steps">
          @for (n of items; track n; let i = $index) {
            <li [appReveal]="i * 90"><span class="no">{{ n }}</span><h3>{{ i18n.t('process.' + n + '.t') }}</h3><p>{{ i18n.t('process.' + n + '.d') }}</p></li>
          }
        </ol>
        <button type="button" class="btn btn-primary" (click)="ui.goToContact()">{{ i18n.t('process.cta') }}</button>
      </div>
    </section>
  `,
  styles: `
    h2 { font-family: var(--f-display); font-size: clamp(1.6rem, 3.6vw, 2.6rem); margin: 0; }
    .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px; counter-reset: x; }
    .steps li { position: relative; padding-top: 22px; border-top: 3px solid var(--accent); }
    .no { position: absolute; top: -17px; left: 0; width: 32px; height: 32px; border-radius: 50%; background: var(--turmeric); display: grid; place-items: center; font-weight: 800; }
    h3 { margin: 8px 0 4px; font-family: var(--f-display); font-size: 1rem; } p { margin: 0; color: var(--ink-2); }
    @media (max-width: 860px) { .steps { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 520px) { .steps { grid-template-columns: 1fr; } }
  `,
})
export class ProcessSection {
  protected readonly i18n = inject(I18nService);
  protected readonly ui = inject(UiState);
  protected readonly items = [1, 2, 3, 4];
}
