import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { ContentService } from '../core/content.service';
import { I18nService } from '../core/i18n.service';
import { RevealDirective } from '../shared/interaction.directives';
import { SwipeStackComponent } from '../shared/swipe-stack.component';

const CATS = ['frontend', 'backend', 'database', 'programming', 'ai_ml', 'tools'];

@Component({
  selector: 'app-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, SwipeStackComponent],
  template: `
    <section id="skills" class="section" aria-labelledby="skills-h">
      <div class="container">
        <div class="section-head" appReveal>
          <h2 id="skills-h">{{ i18n.t('skills.title') }}</h2>
          <p class="lede">{{ i18n.t('skills.sub') }}</p>
        </div>

        <!-- Category Tabs -->
        <div class="tabs" role="tablist">
          @for (c of cats; track c) {
            <button
              type="button"
              role="tab"
              class="chip tab"
              [class.on]="cat() === c"
              [attr.aria-selected]="cat() === c"
              (click)="onSelectCategory(c)"
            >
              {{ i18n.t('cat.' + c) }}
            </button>
          }
        </div>

        <div class="skills-layout glass">
          <!-- Left Column: Skill Pills & Category Info -->
          <div class="skills-sidebar">
            <div class="category-meta">
              <span class="count-badge">{{ list().length }} {{ i18n.t('skills.count') }}</span>
              <p class="category-hint">{{ i18n.t('skills.swipe_hint') }}</p>
            </div>

            <ul class="nodes">
              @for (s of list(); track s.name) {
                <li>
                  <button
                    type="button"
                    class="node"
                    [class.on]="sel() === s.name"
                    [attr.data-level]="s.level"
                    (click)="onSelectSkill(s.name)"
                    (mouseenter)="onSelectSkill(s.name)"
                    (focus)="onSelectSkill(s.name)"
                  >
                    <i class="dot"></i>{{ s.name }}
                  </button>
                </li>
              }
            </ul>

            <div class="legend-box">
              <span class="legend-title">Proficiency Levels</span>
              <ul class="key">
                @for (l of levels; track l) {
                  <li [attr.data-level]="l">
                    <i class="dot"></i>{{ i18n.t('lvl.' + l) }}
                  </li>
                }
              </ul>
            </div>
          </div>

          <!-- Right Column: Originkit Swipe Card Stack -->
          <div class="stack-column">
            <app-swipe-stack
              [skills]="list()"
              [selectedSkill]="sel()"
              (skillSelected)="onSkillSwiped($event)"
            />
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    h2 {
      font-family: var(--f-display);
      font-size: clamp(1.8rem, 4vw, 3rem);
      margin: 0;
      line-height: 1.1;
    }
    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }
    .tab {
      cursor: pointer;
      border: 1px solid var(--accent-line);
      font-weight: 800;
      transition: all 0.2s ease;
    }
    .tab.on {
      background: var(--ink);
      color: #fff;
      transform: translateY(-2px);
    }
    .skills-layout {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 32px;
      padding: clamp(20px, 3.5vw, 36px);
      border-radius: var(--r-lg);
      align-items: center;
    }
    .skills-sidebar {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .category-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .count-badge {
      font-family: var(--f-display);
      font-weight: 800;
      font-size: 1.1rem;
      color: var(--accent);
    }
    .category-hint {
      margin: 0;
      font-size: 0.82rem;
      color: var(--ink-3);
      font-style: italic;
    }
    .nodes {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .node {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 999px;
      border: 1.5px solid var(--accent-line);
      background: var(--paper);
      font-weight: 800;
      cursor: pointer;
      transition: transform 0.2s, border-color 0.2s, background 0.2s;
    }
    .node:hover,
    .node.on {
      transform: translateY(-3px);
      border-color: var(--accent);
      background: #fff;
      box-shadow: 0 6px 14px -4px rgba(27, 26, 23, 0.1);
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--ink-3);
      display: inline-block;
    }
    [data-level='daily'] .dot { background: var(--accent); }
    [data-level='working'] .dot { background: var(--turmeric); }
    [data-level='exploring'] .dot { background: transparent; border: 2px solid var(--signal); }

    .legend-box {
      border-top: 1px dashed var(--accent-line);
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .legend-title {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 800;
      color: var(--ink-3);
    }
    .key {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 0.82rem;
      color: var(--ink-3);
      font-weight: 700;
    }
    .key li {
      display: inline-flex;
      gap: 6px;
      align-items: center;
    }
    .stack-column {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 440px;
    }
    @media (max-width: 900px) {
      .skills-layout {
        grid-template-columns: 1fr;
        gap: 24px;
      }
      .stack-column {
        order: -1;
      }
    }
  `,
})
export class SkillsSection {
  protected readonly i18n = inject(I18nService);
  private readonly cs = inject(ContentService);

  protected readonly cats = CATS;
  protected readonly levels = ['daily', 'working', 'exploring'];
  protected readonly cat = signal('frontend');
  protected readonly sel = signal<string | null>('Angular');

  protected readonly list = computed(() =>
    (this.cs.content()?.skills ?? []).filter((s) => s.category === this.cat()),
  );

  onSelectCategory(category: string): void {
    this.cat.set(category);
    const firstSkill = this.list()[0]?.name ?? null;
    this.sel.set(firstSkill);
  }

  onSelectSkill(name: string): void {
    this.sel.set(name);
  }

  onSkillSwiped(name: string): void {
    this.sel.set(name);
  }
}
