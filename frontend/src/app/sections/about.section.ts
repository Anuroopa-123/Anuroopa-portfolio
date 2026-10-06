import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ContentService } from '../core/content.service';
import { I18nService } from '../core/i18n.service';
import { CounterComponent } from '../shared/counter.component';
import { RevealDirective } from '../shared/interaction.directives';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CounterComponent, RevealDirective],
  template: `
    <section id="about" class="section" aria-labelledby="about-h">
      <div class="container grid">
        <div class="text" appReveal>
          <h2 id="about-h">{{ i18n.t('about.title') }}</h2>
          <p class="lede">{{ i18n.t('about.body') }}</p>
          <ul class="stats">
            <li><b><app-counter [to]="1.6" [decimals]="1" /></b><span>{{ i18n.t('stat.years') }}</span></li>
            <li><b><app-counter [to]="8.56" [decimals]="2" /></b><span>{{ i18n.t('stat.cgpa') }}</span></li>
            <li><b><app-counter [to]="techCount()" suffix="+" /></b><span>{{ i18n.t('stat.tech') }}</span></li>
            <li><b class="small">{{ i18n.t('stat.focusValue') }}</b><span>{{ i18n.t('stat.focus') }}</span></li>
          </ul>
        </div>
        <div class="side">
          <h3 appReveal>{{ i18n.t('about.layers') }}</h3>
          <ol class="layers">
            @for (l of layers; track l; let i = $index) {
              <li class="glass" [appReveal]="i * 90"><b>{{ i18n.t('layer.' + l + '.t') }}</b><span>{{ i18n.t('layer.' + l + '.d') }}</span></li>
            }
          </ol>
          <ol class="timeline">
            <li appReveal><i>2024</i>{{ i18n.t('tl.2024') }}</li>
            <li appReveal="80"><i>2024+</i>{{ i18n.t('tl.start') }}</li>
            <li appReveal="160"><i>{{ i18n.t('tl.present') }}</i>{{ i18n.t('tl.now') }}</li>
          </ol>
        </div>
      </div>
    </section>
  `,
  styles: `
    .grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: clamp(28px, 5vw, 72px); align-items: start; }
    h2 { font-family: var(--f-display); font-size: clamp(1.8rem, 4vw, 3rem); margin: 0 0 16px; line-height: 1.1; }
    h3 { font-size: .95rem; margin: 0 0 12px; color: var(--ink-2); }
    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 28px; }
    .stats li { background: var(--paper); border: 1px solid var(--accent-line); border-radius: var(--r-md); padding: 16px; display: grid; gap: 4px; }
    .stats b { font-family: var(--f-display); font-size: 2rem; color: var(--accent); }
    .stats b.small { font-size: 1.1rem; padding-block: .55rem; }
    .stats span { color: var(--ink-2); font-size: .88rem; font-weight: 600; }
    .layers { display: grid; gap: 10px; }
    .layers li { padding: 14px 18px; border-radius: var(--r-md); display: grid; gap: 2px; }
    .layers b { font-family: var(--f-display); font-size: .95rem; } .layers span { color: var(--ink-2); font-size: .92rem; }
    .timeline { margin-top: 26px; border-left: 3px solid var(--turmeric); display: grid; gap: 14px; padding-left: 18px; }
    .timeline i { display: block; font-style: normal; font-weight: 800; color: var(--accent); font-size: .85rem; }
    @media (max-width: 860px) { .grid { grid-template-columns: 1fr; } }
  `,
})
export class AboutSection {
  protected readonly i18n = inject(I18nService);
  private readonly cs = inject(ContentService);
  protected readonly layers = ['interface', 'api', 'data', 'intelligence'];
  protected readonly techCount = computed(() => this.cs.content()?.skills.length ?? 20);
}
