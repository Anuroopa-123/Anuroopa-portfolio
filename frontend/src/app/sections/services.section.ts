import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ContentService } from '../core/content.service';
import { I18nService } from '../core/i18n.service';
import { UiState } from '../core/ui-state.service';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective, TiltDirective } from '../shared/interaction.directives';

@Component({
  selector: 'app-services',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, RevealDirective, TiltDirective],
  template: `
    <section id="services" class="section" aria-labelledby="services-h">
      <div class="container">
        <div class="section-head" appReveal>
          <h2 id="services-h">{{ i18n.t('services.title') }}</h2>
          <p class="lede"><b>{{ i18n.t('services.msg1') }}</b> {{ i18n.t('services.msg2') }}</p>
        </div>
        <ul class="cards">
          @for (s of services(); track s.key; let i = $index) {
            <li class="card glass tilt" appTilt="5" [appReveal]="i * 70">
              <span class="ic"><app-icon [name]="s.icon" [size]="26" /></span>
              <h3>{{ i18n.tr(s.title) }}</h3>
              <p>{{ i18n.tr(s.description) }}</p>
              <button type="button" class="link" (click)="ui.goToContact(s.key)">{{ i18n.t('services.cardCta') }} <app-icon name="arrow" [size]="16" /></button>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    h2 { font-family: var(--f-display); font-size: clamp(1.8rem, 4vw, 3rem); margin: 0; line-height: 1.1; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
    .card { padding: 26px; border-radius: var(--r-lg); display: grid; gap: 10px; align-content: start; }
    .ic { width: 52px; height: 52px; border-radius: 16px; background: var(--turmeric); display: grid; place-items: center; color: var(--ink); }
    h3 { margin: 6px 0 0; font-family: var(--f-display); font-size: 1.05rem; }
    p { margin: 0; color: var(--ink-2); }
    .link { justify-self: start; margin-top: 6px; background: none; border: 0; padding: 4px 0; color: var(--accent); font-weight: 800; cursor: pointer; display: inline-flex; gap: 6px; align-items: center; border-bottom: 2px solid transparent; }
    .link:hover { border-bottom-color: var(--turmeric); }
    @media (max-width: 960px) { .cards { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 620px) { .cards { grid-template-columns: 1fr; } }
  `,
})
export class ServicesSection {
  protected readonly i18n = inject(I18nService);
  protected readonly ui = inject(UiState);
  private readonly cs = inject(ContentService);
  protected readonly services = () => this.cs.content()?.services ?? [];
}
