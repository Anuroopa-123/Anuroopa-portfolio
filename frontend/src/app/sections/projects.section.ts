import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { ContentService } from '../core/content.service';
import { I18nService } from '../core/i18n.service';
import { SITE } from '../site.config';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective } from '../shared/interaction.directives';
import { ProjectVisualComponent } from '../shared/project-visual.component';
import { SyncDemoComponent } from '../shared/sync-demo.component';

const FILTERS = ['all', 'fullstack', 'frontend', 'backend', 'ai'];

@Component({
  selector: 'app-projects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, RevealDirective, ProjectVisualComponent, SyncDemoComponent],
  template: `
    <section id="projects" class="section" aria-labelledby="projects-h">
      <div class="container">
        <div class="section-head" appReveal>
          <h2 id="projects-h">{{ i18n.t('projects.title') }}</h2>
          <p class="lede">{{ i18n.t('projects.sub') }}</p>
        </div>
        <div class="filters" role="group">
          @for (f of filters; track f) {
            <button type="button" class="chip fl" [class.on]="filter() === f" [attr.aria-pressed]="filter() === f" (click)="filter.set(f)">{{ i18n.t('f.' + f) }}</button>
          }
        </div>
        <div class="list">
          @for (p of shown(); track p.slug; let i = $index) {
            <article class="proj glass" [class.flip]="i % 2 === 1" appReveal>
              <app-project-visual class="vis" [kind]="p.visual" />
              <div class="body">
                <p class="status" [attr.data-s]="p.status">{{ i18n.t('status.' + p.status) }}</p>
                <h3>{{ i18n.tr(p.title) }}</h3>
                <p>{{ i18n.tr(p.summary) }}</p>
                <ul class="stack">@for (t of p.stack; track t) { <li class="chip">{{ t }}</li> }</ul>
                <button type="button" class="more" [attr.aria-expanded]="open() === p.slug" [attr.aria-controls]="'d-' + p.slug" (click)="open.set(open() === p.slug ? null : p.slug)">
                  {{ open() === p.slug ? i18n.t('project.hide') : i18n.t('project.show') }}
                  <span class="chev" [class.up]="open() === p.slug"><app-icon name="chevron" [size]="16" /></span>
                </button>
                @if (open() === p.slug) {
                  <div class="details" [id]="'d-' + p.slug">
                    <h4>{{ i18n.t('project.problem') }}</h4><p>{{ i18n.tr(p.problem) }}</p>
                    <h4>{{ i18n.t('project.solution') }}</h4><p>{{ i18n.tr(p.solution) }}</p>
                    <h4>{{ i18n.t('project.features') }}</h4>
                    <ul class="feat">
                      @for (f of p.features; track $index) {
                        <li [class.todo]="f.done === false">
                          @if (f.done !== undefined) { <small>{{ f.done ? i18n.t('project.built') : i18n.t('project.planned') }}</small> }
                          {{ i18n.tr(f) }}
                        </li>
                      }
                    </ul>
                    <div class="links">
                      @if (p.github_url) {
                        <a class="btn" [href]="p.github_url" target="_blank" rel="noopener noreferrer"><app-icon name="github" [size]="18" /> {{ i18n.t('project.github') }}</a>
                      } @else if (p.status === 'in_progress') {
                        <span class="chip">{{ i18n.t('project.githubSoon') }}</span>
                      }
                      @if (p.live_url) {
                        <a class="btn" [href]="p.live_url" target="_blank" rel="noopener noreferrer">{{ i18n.t('project.live') }}</a>
                      }
                    </div>
                  </div>
                }
              </div>
            </article>
          } @empty {
            <p class="lede">{{ i18n.t('projects.empty') }}</p>
          }
        </div>
        <div class="demo"><app-sync-demo /></div>
      </div>
    </section>
  `,
  styles: `
    h2 { font-family: var(--f-display); font-size: clamp(1.8rem, 4vw, 3rem); margin: 0; line-height: 1.1; }
    .filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }
    .fl { cursor: pointer; border: 1px solid var(--accent-line); font-weight: 800; }
    .fl.on { background: var(--ink); color: #fff; }
    .list { display: grid; gap: 22px; }
    .proj { display: grid; grid-template-columns: 5fr 7fr; gap: clamp(18px, 3vw, 40px); padding: clamp(18px, 3vw, 34px); border-radius: var(--r-lg); align-items: start; }
    .proj.flip { grid-template-columns: 7fr 5fr; } .proj.flip .vis { order: 2; }
    h3 { margin: 4px 0 0; font-family: var(--f-display); font-size: clamp(1.2rem, 2.4vw, 1.7rem); }
    .body { display: grid; gap: 12px; } .body p { margin: 0; color: var(--ink-2); }
    .status { font-weight: 800; font-size: .82rem; color: var(--accent) !important; }
    .status[data-s='in_progress'] { color: var(--ok) !important; }
    .stack { display: flex; flex-wrap: wrap; gap: 6px; }
    .more { justify-self: start; background: none; border: 0; padding: 6px 0; font-weight: 800; color: var(--accent); cursor: pointer; display: inline-flex; gap: 6px; align-items: center; }
    .chev { display: inline-flex; transition: transform .3s; } .chev.up { transform: rotate(180deg); }
    .details { display: grid; gap: 8px; padding-top: 10px; border-top: 1px dashed var(--accent-line); animation: open .35s ease both; }
    .details h4 { margin: 6px 0 0; font-size: .9rem; }
    .feat { display: grid; gap: 6px; color: var(--ink-2); }
    .feat li { padding-left: 14px; border-left: 3px solid var(--accent); }
    .feat li.todo { border-left-color: var(--turmeric); }
    .feat small { font-weight: 800; margin-right: 6px; color: var(--ink-3); }
    .links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; }
    .demo { margin-top: 36px; }
    @keyframes open { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
    @media (max-width: 860px) { .proj, .proj.flip { grid-template-columns: 1fr; } .proj.flip .vis { order: 0; } }
    @media (prefers-reduced-motion: reduce) { .details { animation: none; } }
  `,
})
export class ProjectsSection {
  protected readonly i18n = inject(I18nService);
  private readonly cs = inject(ContentService);
  protected readonly site = SITE;
  protected readonly filters = FILTERS;
  protected readonly filter = signal('all');
  protected readonly open = signal<string | null>(null);
  protected readonly shown = computed(() => {
    const all = this.cs.content()?.projects ?? [];
    const f = this.filter();
    return f === 'all' ? all : all.filter((p) => p.categories.includes(f));
  });
}
