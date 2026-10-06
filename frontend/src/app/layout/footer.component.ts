import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { I18nService } from '../core/i18n.service';
import { scrollToId } from '../core/motion';
import { SITE } from '../site.config';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <footer class="foot">
      <div class="container inner">
        <div>
          <p class="tag">{{ i18n.t('footer.tag') }}</p>
          <p class="who">{{ site.name }} · {{ i18n.t('footer.role') }}</p>
          <p class="who">© {{ year }} {{ site.name }}. {{ i18n.t('footer.rights') }}</p>
        </div>
        <div class="links">
          <a [href]="site.linkedin" target="_blank" rel="noopener noreferrer" [attr.aria-label]="i18n.t('link.linkedin')"><app-icon name="linkedin" /></a>
          <a [href]="'mailto:' + site.email" [attr.aria-label]="i18n.t('link.email')"><app-icon name="mail" /></a>
          <button type="button" class="top" (click)="top()"><app-icon name="up" [size]="18" /> {{ i18n.t('footer.top') }}</button>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .foot { background: var(--royal-2); color: #e8eeff; padding: 48px 0; }
    .inner { display: flex; flex-wrap: wrap; gap: 24px; justify-content: space-between; align-items: end; }
    .tag { margin: 0 0 10px; font-family: var(--f-display); font-size: clamp(1.3rem, 3vw, 2rem); color: var(--turmeric); }
    .who { margin: 2px 0; color: #c7d2ff; font-size: .92rem; }
    .links { display: flex; gap: 10px; align-items: center; }
    .links a, .top { color: #fff; display: inline-flex; gap: 6px; align-items: center; padding: 10px 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,.3); background: none; cursor: pointer; text-decoration: none; font-weight: 700; font-size: .88rem; }
    .links a:hover, .top:hover { background: rgba(255,255,255,.12); }
  `,
})
export class FooterComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly site = SITE;
  protected readonly year = new Date().getFullYear();
  top(): void {
    scrollToId('home');
  }
}
