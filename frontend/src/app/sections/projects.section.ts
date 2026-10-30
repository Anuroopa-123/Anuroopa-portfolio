import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { ContentService } from '../core/content.service';
import { I18nService } from '../core/i18n.service';
import { Project } from '../core/models';
import { SITE } from '../site.config';
import { GlassFolderComponent } from '../shared/glass-folder.component';
import { ArtPreset } from '../shared/folder-art';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective } from '../shared/interaction.directives';
import { SyncDemoComponent } from '../shared/sync-demo.component';

const FILTERS = ['all', 'fullstack', 'frontend', 'backend', 'ai'];

interface ProjectArtConfig {
  art: ArtPreset;
  seed: number;
}

const ART_MAP: Record<string, ProjectArtConfig> = {
  'ai-knowledge-platform': { art: 'aurora', seed: 4 },
  pcva: { art: 'ember', seed: 9 },
  'dph-lms': { art: 'dusk', seed: 17 },
  'hlc-usr': { art: 'glacier', seed: 23 },
  'key-management-report': { art: 'verdant', seed: 35 },
};

@Component({
  selector: 'app-projects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, RevealDirective, GlassFolderComponent, SyncDemoComponent],
  template: `
    <section id="projects" class="section" aria-labelledby="projects-h">
      <div class="container">
        <div class="section-head" appReveal>
          <div class="pill-tag">
            <span class="sparkle">✦</span>
            Interactive Project Archive
          </div>
          <h2 id="projects-h">{{ i18n.t('projects.title') }}</h2>
          <p class="lede">{{ i18n.t('projects.sub') }}</p>
        </div>

        <!-- Filter Chips -->
        <div class="filters" role="group" aria-label="Filter projects">
          @for (f of filters; track f) {
            <button
              type="button"
              class="chip fl"
              [class.on]="filter() === f"
              [attr.aria-pressed]="filter() === f"
              (click)="filter.set(f)"
            >
              {{ i18n.t('f.' + f) }}
            </button>
          }
        </div>

        <!-- Clean, Compact 21st.dev Glass Folder Cards Grid -->
        <div class="folders-grid" appReveal>
          @for (p of shown(); track p.slug; let i = $index) {
            <div class="folder-cell">
              <app-glass-folder
                [project]="p"
                [art]="getArt(p.slug).art"
                [seed]="getArt(p.slug).seed"
                [width]="320"
                (openDetails)="openProjectModal($event)"
              />
            </div>
          } @empty {
            <p class="lede empty-msg">{{ i18n.t('projects.empty') }}</p>
          }
        </div>

        <!-- Helpful interaction hint -->
        <p class="grid-hint">
          <span>💡 Hover to lean glass · Click to open folder · Click any sheet to view full details</span>
        </p>

        <!-- Project Detail Slide-Over Modal -->
        @if (selectedProject(); as p) {
          <div class="modal-backdrop" (click)="closeModal()">
            <div class="modal-panel glass" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
              <!-- Modal Header -->
              <div class="modal-header">
                <div>
                  <span class="modal-status" [attr.data-s]="p.status">
                    {{ i18n.t('status.' + p.status) }}
                  </span>
                  <h3 class="modal-title">{{ i18n.tr(p.title) }}</h3>
                </div>
                <button
                  type="button"
                  class="close-btn"
                  (click)="closeModal()"
                  aria-label="Close modal"
                >
                  <app-icon name="close" [size]="18" />
                </button>
              </div>

              <!-- Modal Body Content -->
              <div class="modal-body">
                <p class="modal-summary">{{ i18n.tr(p.summary) }}</p>

                <!-- Tech Stack Chips -->
                <div class="modal-section">
                  <h4 class="section-label">Technologies Used</h4>
                  <ul class="stack-list">
                    @for (t of p.stack; track t) {
                      <li class="chip">{{ t }}</li>
                    }
                  </ul>
                </div>

                <!-- Problem & Solution Cards -->
                <div class="problem-solution-grid">
                  <div class="info-card">
                    <span class="info-label">{{ i18n.t('project.problem') }}</span>
                    <p>{{ i18n.tr(p.problem) }}</p>
                  </div>
                  <div class="info-card highlight">
                    <span class="info-label">{{ i18n.t('project.solution') }}</span>
                    <p>{{ i18n.tr(p.solution) }}</p>
                  </div>
                </div>

                <!-- Key Features -->
                <div class="modal-section">
                  <h4 class="section-label">{{ i18n.t('project.features') }}</h4>
                  <ul class="features-list">
                    @for (f of p.features; track $index) {
                      <li [class.todo]="f.done === false">
                        @if (f.done !== undefined) {
                          <span class="feat-badge" [class.done]="f.done">
                            {{ f.done ? i18n.t('project.built') : i18n.t('project.planned') }}
                          </span>
                        }
                        <span>{{ i18n.tr(f) }}</span>
                      </li>
                    }
                  </ul>
                </div>

                <!-- Interactive Sync Demo (if PCVA) -->
                @if (p.slug === 'pcva') {
                  <div class="sync-demo-wrap">
                    <app-sync-demo />
                  </div>
                }

                <!-- Action Links -->
                <div class="modal-links">
                  @if (p.github_url) {
                    <a class="btn btn-primary" [href]="p.github_url" target="_blank" rel="noopener noreferrer">
                      <app-icon name="github" [size]="18" /> {{ i18n.t('project.github') }}
                    </a>
                  } @else if (p.status === 'in_progress') {
                    <span class="chip status-badge">{{ i18n.t('project.githubSoon') }}</span>
                  }
                  @if (p.live_url) {
                    <a class="btn" [href]="p.live_url" target="_blank" rel="noopener noreferrer">
                      {{ i18n.t('project.live') }}
                    </a>
                  }
                </div>
              </div>
            </div>
          </div>
        }
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
    .pill-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 800;
      color: var(--accent);
      padding: 4px 14px;
      background: var(--accent-soft);
      border-radius: 999px;
      width: fit-content;
      margin-bottom: 6px;
    }
    .sparkle {
      animation: pulseSparkle 2s infinite ease-in-out;
    }
    @keyframes pulseSparkle {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.3); opacity: 1; }
    }

    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 32px;
    }
    .fl {
      cursor: pointer;
      border: 1.5px solid var(--accent-line);
      background: var(--glass);
      font-weight: 800;
      transition: all 0.2s ease;
    }
    .fl:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
    }
    .fl.on {
      background: var(--ink);
      color: #fff;
      border-color: var(--ink);
      box-shadow: 0 4px 12px rgba(16, 26, 82, 0.25);
    }

    /* Clean Folders Grid */
    .folders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 36px 28px;
      justify-items: center;
      align-items: start;
      margin-bottom: 24px;
    }
    .folder-cell {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .grid-hint {
      text-align: center;
      font-size: 0.82rem;
      color: var(--ink-3);
      margin-top: 18px;
      font-style: italic;
    }

    /* Modal / Drawer Overlay */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 100;
      background: rgba(16, 26, 82, 0.45);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeInBackdrop 0.25s ease-out;
    }
    @keyframes fadeInBackdrop {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-panel {
      position: relative;
      width: min(720px, 94vw);
      max-height: 88vh;
      overflow-y: auto;
      border-radius: var(--r-lg);
      padding: clamp(20px, 3.5vw, 36px);
      box-shadow: 0 24px 60px -12px rgba(16, 26, 82, 0.4);
      background: #ffffff;
      animation: slideUpModal 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    @keyframes slideUpModal {
      from { opacity: 0; transform: translateY(24px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 1px solid var(--accent-line);
      padding-bottom: 18px;
    }
    .modal-status {
      font-size: 0.78rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--accent);
    }
    .modal-status[data-s="in_progress"] { color: var(--ok); }
    .modal-status[data-s="internship"] { color: var(--signal); }

    .modal-title {
      margin: 4px 0 0;
      font-family: var(--f-display);
      font-size: clamp(1.4rem, 2.5vw, 1.9rem);
      color: var(--ink);
    }
    .close-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid var(--accent-line);
      background: var(--paper);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--ink);
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .close-btn:hover {
      background: var(--accent);
      color: #fff;
      transform: scale(1.08);
    }

    .modal-body {
      display: flex;
      flex-direction: column;
      gap: 22px;
      margin-top: 18px;
    }
    .modal-summary {
      font-size: 1.05rem;
      line-height: 1.6;
      color: var(--ink-2);
      margin: 0;
    }

    .section-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 800;
      color: var(--ink-3);
      margin: 0 0 10px 0;
    }
    .stack-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .problem-solution-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .info-card {
      padding: 16px;
      border-radius: var(--r-md);
      background: var(--paper);
      border: 1px solid var(--accent-line);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .info-card.highlight {
      background: rgba(38, 56, 201, 0.04);
      border-color: rgba(38, 56, 201, 0.3);
    }
    .info-label {
      font-size: 0.76rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent);
    }
    .info-card p {
      margin: 0;
      font-size: 0.92rem;
      line-height: 1.5;
      color: var(--ink);
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .features-list li {
      display: flex;
      align-items: baseline;
      gap: 8px;
      font-size: 0.92rem;
      color: var(--ink-2);
      line-height: 1.45;
    }
    .feat-badge {
      font-size: 0.68rem;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--turmeric);
      color: var(--ink);
    }
    .feat-badge.done {
      background: rgba(10, 122, 94, 0.15);
      color: var(--ok);
    }

    .sync-demo-wrap {
      margin-top: 12px;
      border-top: 1px dashed var(--accent-line);
      padding-top: 18px;
    }

    .modal-links {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      margin-top: 6px;
      border-top: 1px solid var(--accent-line);
      padding-top: 18px;
    }
    .btn-primary {
      background: var(--ink);
      color: #fff;
    }
    .btn-primary:hover {
      background: var(--accent);
    }
    .status-badge {
      background: rgba(38, 56, 201, 0.08);
      color: var(--accent);
      font-weight: 700;
    }

    @media (max-width: 680px) {
      .problem-solution-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class ProjectsSection {
  protected readonly i18n = inject(I18nService);
  private readonly cs = inject(ContentService);
  protected readonly site = SITE;

  protected readonly filters = FILTERS;
  protected readonly filter = signal('all');
  protected readonly selectedProject = signal<Project | null>(null);

  protected readonly shown = computed(() => {
    const all = this.cs.content()?.projects ?? [];
    const f = this.filter();
    return f === 'all' ? all : all.filter((p) => p.categories.includes(f));
  });

  getArt(slug: string): ProjectArtConfig {
    return ART_MAP[slug] ?? { art: 'aurora', seed: 3 };
  }

  openProjectModal(project: Project): void {
    this.selectedProject.set(project);
  }

  closeModal(): void {
    this.selectedProject.set(null);
  }
}
