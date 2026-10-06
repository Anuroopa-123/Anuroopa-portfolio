import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { ContentService } from '../core/content.service';
import { I18nService } from '../core/i18n.service';
import { RevealDirective } from '../shared/interaction.directives';

const CATS = ['frontend', 'backend', 'database', 'programming', 'ai_ml', 'tools'];

@Component({
  selector: 'app-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="skills" class="section" aria-labelledby="skills-h">
      <div class="container">
        <div class="section-head" appReveal>
          <h2 id="skills-h">{{ i18n.t('skills.title') }}</h2>
          <p class="lede">{{ i18n.t('skills.sub') }}</p>
        </div>
        <div class="tabs" role="tablist">
          @for (c of cats; track c) {
            <button type="button" role="tab" class="chip tab" [class.on]="cat() === c" [attr.aria-selected]="cat() === c" (click)="cat.set(c); sel.set(null)">{{ i18n.t('cat.' + c) }}</button>
          }
        </div>
        <div class="panel glass">
          <ul class="nodes">
            @for (s of list(); track s.name) {
              <li>
                <button type="button" class="node" [class.on]="sel() === s.name" [attr.data-level]="s.level" (click)="sel.set(s.name)" (mouseenter)="sel.set(s.name)" (focus)="sel.set(s.name)">
                  <i class="dot"></i>{{ s.name }}
                </button>
              </li>
            }
          </ul>
          <div class="detail" aria-live="polite">
            @if (current(); as s) {
              <h3>{{ s.name }}</h3>
              <p class="lvl" [attr.data-level]="s.level">{{ i18n.t('lvl.' + s.level) }}</p>
              <p>{{ i18n.tr(s.note) }}</p>
            } @else {
              <p class="lede">{{ list().length }} {{ i18n.t('skills.count') }}</p>
            }
            <ul class="key">
              @for (l of levels; track l) { <li [attr.data-level]="l"><i class="dot"></i>{{ i18n.t('lvl.' + l) }}</li> }
            </ul>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    h2 { font-family: var(--f-display); font-size: clamp(1.8rem, 4vw, 3rem); margin: 0; line-height: 1.1; }
    .tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .tab { cursor: pointer; border: 1px solid var(--accent-line); font-weight: 800; }
    .tab.on { background: var(--ink); color: #fff; }
    .panel { display: grid; grid-template-columns: 1.4fr 1fr; gap: 28px; padding: clamp(18px, 3vw, 34px); border-radius: var(--r-lg); min-height: 280px; }
    .nodes { display: flex; flex-wrap: wrap; gap: 10px; align-content: flex-start; }
    .node { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 999px; border: 1.5px solid var(--accent-line); background: var(--paper); font-weight: 800; cursor: pointer; transition: transform .2s, border-color .2s, background .2s; }
    .node:hover, .node.on { transform: translateY(-3px); border-color: var(--accent); background: #fff; }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--ink-3); display: inline-block; }
    [data-level='daily'] .dot { background: var(--accent); }
    [data-level='working'] .dot { background: var(--turmeric); }
    [data-level='exploring'] .dot { background: transparent; border: 2px solid var(--signal); }
    .detail { border-left: 2px dashed var(--accent-line); padding-left: 24px; display: grid; gap: 8px; align-content: start; }
    .detail h3 { margin: 0; font-family: var(--f-display); } .detail p { margin: 0; color: var(--ink-2); }
    .lvl { font-weight: 800; color: var(--accent) !important; }
    .key { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 12px; font-size: .82rem; color: var(--ink-3); font-weight: 700; }
    .key li { display: inline-flex; gap: 6px; align-items: center; }
    @media (max-width: 800px) { .panel { grid-template-columns: 1fr; } .detail { border-left: 0; padding-left: 0; border-top: 2px dashed var(--accent-line); padding-top: 18px; } }
  `,
})
export class SkillsSection {
  protected readonly i18n = inject(I18nService);
  private readonly cs = inject(ContentService);
  protected readonly cats = CATS;
  protected readonly levels = ['daily', 'working', 'exploring'];
  protected readonly cat = signal('frontend');
  protected readonly sel = signal<string | null>(null);
  protected readonly list = computed(() => (this.cs.content()?.skills ?? []).filter((s) => s.category === this.cat()));
  protected readonly current = computed(() => this.list().find((s) => s.name === this.sel()) ?? null);
}
