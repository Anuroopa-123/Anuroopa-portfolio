import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { I18nService } from '../core/i18n.service';
import { RevealDirective } from '../shared/interaction.directives';

@Component({
  selector: 'app-ai',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="ai" class="section" aria-labelledby="ai-h">
      <div class="container">
        <div class="board" appReveal>
          <h2 id="ai-h">{{ i18n.t('ai.title') }}</h2>
          <p class="lede">{{ i18n.t('ai.body') }}</p>
          <h3>{{ i18n.t('ai.pipeline') }}</h3>
          <ol class="pipe">
            @for (n of steps; track n) {
              <li><span class="n">{{ n }}</span>{{ i18n.t('ai.s' + n) }}</li>
            }
          </ol>
          <h3>{{ i18n.t('ai.interests') }}</h3>
          <ul class="tags">@for (n of tags; track n) { <li>{{ i18n.t('ai.i' + n) }}</li> }</ul>
          <p class="status">{{ i18n.t('ai.status') }}</p>
        </div>
      </div>
    </section>
  `,
  styles: `
    .board { background: linear-gradient(150deg, var(--royal), var(--royal-2)); color: #fff; border-radius: var(--r-lg); padding: clamp(24px, 5vw, 60px); display: grid; gap: 18px; box-shadow: var(--shadow); }
    h2 { margin: 0; font-family: var(--f-display); font-size: clamp(1.8rem, 4vw, 3rem); line-height: 1.1; }
    .lede { color: #dbe3ff; margin: 0; } h3 { margin: 12px 0 0; font-size: .95rem; color: var(--turmeric-hi); }
    .pipe { display: flex; flex-wrap: wrap; gap: 10px 0; counter-reset: s; }
    .pipe li { position: relative; display: flex; align-items: center; gap: 10px; padding: 12px 16px; margin-right: 34px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.3); border-radius: 14px; font-weight: 700; font-size: .9rem; }
    .pipe li:not(:last-child)::after { content: ''; position: absolute; left: 100%; top: 50%; width: 34px; height: 3px; background: repeating-linear-gradient(90deg, var(--turmeric) 0 5px, transparent 5px 10px); background-size: 20px 3px; animation: flow 1s linear infinite; }
    @keyframes flow { to { background-position: 20px 0; } }
    .n { width: 26px; height: 26px; border-radius: 50%; background: var(--turmeric); color: var(--ink); display: grid; place-items: center; font-size: .8rem; font-weight: 800; flex: none; }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; } .tags li { border: 1px solid rgba(255,255,255,.4); border-radius: 999px; padding: 7px 14px; font-size: .88rem; font-weight: 700; }
    .status { margin: 8px 0 0; color: var(--turmeric-hi); font-weight: 700; }
    @media (max-width: 800px) { .pipe { flex-direction: column; gap: 30px; } .pipe li { margin-right: 0; } .pipe li:not(:last-child)::after { left: 24px; top: 100%; width: 3px; height: 30px; background: repeating-linear-gradient(180deg, var(--turmeric) 0 5px, transparent 5px 10px); animation: none; } }
    @media (prefers-reduced-motion: reduce) { .pipe li::after { animation: none !important; } }
  `,
})
export class AiSection {
  protected readonly i18n = inject(I18nService);
  protected readonly steps = [1, 2, 3, 4, 5, 6, 7];
  protected readonly tags = [1, 2, 3, 4, 5, 6];
}
