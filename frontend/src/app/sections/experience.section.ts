import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ContentService } from '../core/content.service';
import { I18nService } from '../core/i18n.service';
import { RevealDirective } from '../shared/interaction.directives';

@Component({
  selector: 'app-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="experience" class="section" aria-labelledby="exp-h">
      <div class="container">
        <div class="section-head" appReveal><h2 id="exp-h">{{ i18n.t('exp.title') }}</h2></div>
        <ol class="tl">
          @for (e of items(); track e.key; let i = $index) {
            <li class="glass" [appReveal]="i * 80">
              <p class="meta"><span class="chip">{{ i18n.t(e.kind === 'job' ? 'exp.job' : 'exp.internship') }}</span> {{ i18n.tr(e.period) }}</p>
              <h3>{{ i18n.tr(e.role) }}</h3>
              <p class="co">{{ e.company }}, {{ e.location }}</p>
              <ul>@for (h of e.highlights; track $index) { <li>{{ i18n.tr(h) }}</li> }</ul>
            </li>
          }
        </ol>
      </div>
    </section>
  `,
  styles: `
    h2 { font-family: var(--f-display); font-size: clamp(1.8rem, 4vw, 3rem); margin: 0; }
    .tl { display: grid; gap: 18px; border-left: 3px solid var(--turmeric); padding-left: clamp(14px, 3vw, 30px); }
    .tl > li { padding: 24px; border-radius: var(--r-lg); position: relative; }
    .tl > li::before { content: ''; position: absolute; left: calc(-1 * clamp(14px, 3vw, 30px) - 10px); top: 32px; width: 17px; height: 17px; border-radius: 50%; background: var(--accent); border: 4px solid var(--bg); }
    .meta { margin: 0; display: flex; gap: 10px; align-items: center; color: var(--ink-3); font-weight: 700; font-size: .88rem; }
    h3 { margin: 8px 0 0; font-family: var(--f-display); font-size: 1.15rem; } .co { margin: 2px 0 10px; color: var(--ink-2); font-weight: 700; }
    ul { display: grid; gap: 6px; color: var(--ink-2); } ul li { padding-left: 14px; border-left: 2px solid var(--accent-line); }
  `,
})
export class ExperienceSection {
  protected readonly i18n = inject(I18nService);
  private readonly cs = inject(ContentService);
  protected readonly items = () => this.cs.content()?.experience ?? [];
}
