import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';

import { ContentService } from '../core/content.service';
import { I18nService } from '../core/i18n.service';
import { RevealDirective } from '../shared/interaction.directives';

interface RoleMeta {
  tone: 'cyan' | 'amber' | 'purple';
  icon: string;
  gradient: string;
  techTags: string[];
  metrics: string[];
}

const META_MAP: Record<string, RoleMeta> = {
  tansam: {
    tone: 'cyan',
    icon: 'briefcase',
    gradient: 'linear-gradient(90deg, #0284c7, #2563eb)',
    techTags: ['Angular', 'React', 'Node.js', 'Express', 'PostgreSQL', 'MySQL', 'RBAC Auth', 'Full-Stack'],
    metrics: ['Active Role', 'Enterprise Production', 'Web & Mobile Systems'],
  },
  photon: {
    tone: 'amber',
    icon: 'layers',
    gradient: 'linear-gradient(90deg, #f59e0b, #d97706)',
    techTags: ['Angular 18', 'TypeScript', 'Java REST APIs', 'Data Reporting', 'Enterprise UI'],
    metrics: ['Front-End Internship', 'Key Management System', 'Angular 18'],
  },
  hifour: {
    tone: 'purple',
    icon: 'cpu',
    gradient: 'linear-gradient(90deg, #a855f7, #7e22ce)',
    techTags: ['Python', 'SQL', 'Chatbot AI', 'Data Processing', 'NLP Basics'],
    metrics: ['AI Internship', 'Conversational Chatbot', 'SQL Relational Schemas'],
  },
};

@Component({
  selector: 'app-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="experience" class="exp-section" aria-labelledby="exp-h">
      <div class="container">
        <!-- Section Header -->
        <header class="section-head" appReveal>
          <div class="header-badge">
            <span class="badge-sparkle">✦</span>
            <span>{{ i18n.t('exp.badge') }}</span>
          </div>
          <h2 id="exp-h" class="section-title">{{ i18n.t('exp.title') }}</h2>
          <p class="section-desc">{{ i18n.t('exp.sub') }}</p>

          <!-- Interactive Milestone Filter Pills -->
          <div class="filter-pills" role="tablist" aria-label="Filter career milestones">
            <button
              type="button"
              class="filter-pill"
              [class.active]="selectedKey() === 'all'"
              (click)="selectedKey.set('all')"
              role="tab"
              [attr.aria-selected]="selectedKey() === 'all'"
            >
              {{ i18n.t('exp.filter_all') }}
            </button>
            @for (e of items(); track e.key) {
              <button
                type="button"
                class="filter-pill"
                [class.active]="selectedKey() === e.key"
                (click)="selectedKey.set(e.key)"
                role="tab"
                [attr.aria-selected]="selectedKey() === e.key"
              >
                {{ e.company }}
                @if (e.key === 'tansam') {
                  <span class="pill-dot live"></span>
                }
              </button>
            }
          </div>
        </header>

        <!-- 3D Interactive Cyber-Spine Timeline -->
        <div class="timeline-container" appReveal>
          <div class="timeline-spine" aria-hidden="true">
            <div class="spine-beam"></div>
          </div>

          <div class="cards-stream">
            @for (e of filteredItems(); track e.key; let i = $index) {
              <div
                class="timeline-item"
                [attr.data-key]="e.key"
                [attr.data-tone]="getMeta(e.key).tone"
                [class.is-current]="e.key === 'tansam'"
              >
                <!-- 3D Spine Milestone Beacon Node -->
                <div class="timeline-beacon" aria-hidden="true">
                  <div class="beacon-outer">
                    @if (e.key === 'tansam') {
                      <span class="radar-pulse"></span>
                    }
                    <div class="beacon-inner">
                      @if (e.key === 'tansam') {
                        <span class="live-dot"></span>
                      } @else {
                        <span class="history-dot"></span>
                      }
                    </div>
                  </div>
                  <span class="beacon-line"></span>
                </div>

                <!-- 3D Interactive Experience Card with Spring Tilt -->
                <div
                  #cardEl
                  class="exp-card-3d"
                  [style.transform]="computeCardTransform(e.key)"
                  (mousemove)="onMouseMove(e.key, $event, cardEl)"
                  (mouseleave)="onMouseLeave(e.key)"
                  tabindex="0"
                >
                  <!-- Top Colored Gradient Accent Line -->
                  <div
                    class="card-top-accent"
                    [style.background]="getMeta(e.key).gradient"
                    aria-hidden="true"
                  ></div>

                  <!-- Specular Glare Overlay -->
                  <div
                    class="card-specular-glare"
                    aria-hidden="true"
                    [style.background]="computeGlare(e.key)"
                  ></div>

                  <!-- 3D Inner Content Layers -->
                  <div class="card-layers">
                    <!-- Top Bar: Company Badge + Period Pill -->
                    <div class="card-head-row">
                      <div class="company-badge-wrap">
                        <div class="company-icon-box" [attr.data-tone]="getMeta(e.key).tone">
                          @if (getMeta(e.key).icon === 'briefcase') {
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                            </svg>
                          } @else if (getMeta(e.key).icon === 'layers') {
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                              <polyline points="2 17 12 22 22 17"></polyline>
                              <polyline points="2 12 12 17 22 12"></polyline>
                            </svg>
                          } @else {
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                              <rect x="9" y="9" width="6" height="6"></rect>
                              <line x1="9" y1="1" x2="9" y2="4"></line>
                              <line x1="15" y1="1" x2="15" y2="4"></line>
                              <line x1="9" y1="20" x2="9" y2="23"></line>
                              <line x1="15" y1="20" x2="15" y2="23"></line>
                            </svg>
                          }
                        </div>
                        <div class="company-text-meta">
                          <h4 class="company-name">{{ e.company }}</h4>
                          <span class="company-loc">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            {{ e.location }}
                          </span>
                        </div>
                      </div>

                      <div class="role-timing-wrap">
                        <span class="role-kind-pill" [attr.data-tone]="getMeta(e.key).tone">
                          {{ i18n.t(e.kind === 'job' ? 'exp.job' : 'exp.internship') }}
                        </span>
                        <span class="period-text">{{ i18n.tr(e.period) }}</span>
                      </div>
                    </div>

                    <!-- Role Heading -->
                    <div class="role-title-block">
                      <h3 class="role-title">{{ i18n.tr(e.role) }}</h3>
                      @if (e.key === 'tansam') {
                        <span class="current-indicator">
                          <span class="live-ping"></span>
                          {{ i18n.t('exp.active_role') }}
                        </span>
                      }
                    </div>

                    <!-- Highlights & Contributions -->
                    <div class="highlights-box">
                      <span class="highlights-title">{{ i18n.t('exp.highlights_title') }}</span>
                      <ul class="highlights-list">
                        @for (h of e.highlights; track $index) {
                          <li class="highlight-item">
                            <span class="highlight-bullet" [attr.data-tone]="getMeta(e.key).tone"></span>
                            <span class="highlight-text">{{ i18n.tr(h) }}</span>
                          </li>
                        }
                      </ul>
                    </div>

                    <!-- Tech Stack Pills -->
                    <div class="tech-tags-wrap">
                      @for (tag of getMeta(e.key).techTags; track tag) {
                        <span class="tech-pill">{{ tag }}</span>
                      }
                    </div>

                    <!-- Metric Ribbon Footer -->
                    <div class="card-footer-ribbon">
                      @for (m of getMeta(e.key).metrics; track m) {
                        <span class="metric-tag">
                          <span class="metric-check">✓</span>
                          {{ m }}
                        </span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .exp-section {
      padding: clamp(60px, 8vw, 100px) 0;
      position: relative;
    }

    /* Section Header */
    .section-head {
      max-width: 760px;
      margin: 0 auto clamp(36px, 5vw, 54px);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 999px;
      background: rgba(38, 56, 201, 0.08);
      border: 1px solid rgba(38, 56, 201, 0.22);
      color: var(--accent, #2638c9);
      font-size: 0.84rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .badge-sparkle {
      color: var(--turmeric, #ffbf1f);
      animation: pulseSparkle 2s infinite ease-in-out;
    }

    @keyframes pulseSparkle {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.3); opacity: 1; }
    }

    .section-title {
      font-family: var(--f-display);
      font-size: clamp(2rem, 4.5vw, 3.2rem);
      line-height: 1.15;
      margin: 0;
      color: var(--ink, #101a52);
    }

    .section-desc {
      color: var(--ink-2, #38437a);
      font-size: clamp(1rem, 1.8vw, 1.15rem);
      font-weight: 500;
      line-height: 1.6;
      margin: 0;
      max-width: 660px;
    }

    /* Filter Pills */
    .filter-pills {
      display: inline-flex;
      background: rgba(255, 255, 255, 0.88);
      border: 1px solid rgba(38, 56, 201, 0.18);
      box-shadow: 0 4px 14px rgba(24, 36, 140, 0.06);
      padding: 4px;
      border-radius: 999px;
      margin-top: 10px;
      gap: 4px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .filter-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px;
      border-radius: 999px;
      border: none;
      background: transparent;
      color: var(--ink-2, #38437a);
      font-size: 0.86rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .filter-pill:hover {
      color: var(--ink, #101a52);
      background: rgba(38, 56, 201, 0.05);
    }

    .filter-pill.active {
      background: var(--royal, #1f2fb0);
      color: #fff;
      box-shadow: 0 4px 14px rgba(31, 47, 176, 0.35);
    }

    .pill-dot.live {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }

    /* 3D Timeline Container */
    .timeline-container {
      position: relative;
      max-width: 900px;
      margin: 0 auto;
      padding-left: clamp(24px, 5vw, 60px);
    }

    /* Glowing Spine Line */
    .timeline-spine {
      position: absolute;
      left: clamp(10px, 2.5vw, 24px);
      top: 24px;
      bottom: 40px;
      width: 4px;
      background: rgba(38, 56, 201, 0.15);
      border-radius: 999px;
      overflow: hidden;
    }

    .spine-beam {
      width: 100%;
      height: 45%;
      background: linear-gradient(180deg, transparent, #2563eb, #0284c7, transparent);
      animation: beamFlow 3s infinite linear;
    }

    @keyframes beamFlow {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(300%); }
    }

    /* Cards Stream */
    .cards-stream {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .timeline-item {
      position: relative;
    }

    /* Beacon Node on Spine */
    .timeline-beacon {
      position: absolute;
      left: calc(-1 * clamp(24px, 5vw, 60px) + clamp(10px, 2.5vw, 24px) - 10px);
      top: 32px;
      z-index: 10;
    }

    .beacon-outer {
      position: relative;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #ffffff;
      border: 3px solid #2563eb;
      box-shadow: 0 0 12px rgba(37, 99, 235, 0.4);
      display: grid;
      place-items: center;
    }

    .radar-pulse {
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      border: 2px solid #10b981;
      animation: radarPing 2s infinite cubic-bezier(0, 0, 0.2, 1);
    }

    @keyframes radarPing {
      0% { transform: scale(0.9); opacity: 0.9; }
      100% { transform: scale(1.8); opacity: 0; }
    }

    .beacon-inner {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #2563eb;
    }

    .live-dot {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }

    [data-tone="amber"] .beacon-outer { border-color: #f59e0b; box-shadow: 0 0 12px rgba(245, 158, 11, 0.4); }
    [data-tone="amber"] .beacon-inner { background: #f59e0b; }

    [data-tone="purple"] .beacon-outer { border-color: #a855f7; box-shadow: 0 0 12px rgba(168, 85, 247, 0.4); }
    [data-tone="purple"] .beacon-inner { background: #a855f7; }

    /* 3D Interactive Card */
    .exp-card-3d {
      position: relative;
      width: 100%;
      border-radius: 24px;
      background: linear-gradient(155deg, rgba(255, 255, 255, 0.98) 0%, rgba(246, 249, 255, 0.94) 100%);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(38, 56, 201, 0.16);
      box-shadow: 0 18px 45px -12px rgba(24, 36, 140, 0.14),
                  0 0 1px 1px rgba(255, 255, 255, 0.9) inset;
      cursor: pointer;
      overflow: hidden;
      transform-style: preserve-3d;
      transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1),
                  box-shadow 0.35s ease,
                  border-color 0.35s ease;
      will-change: transform;
      outline: none;
    }

    .exp-card-3d:hover {
      box-shadow: 0 30px 65px -15px rgba(24, 36, 140, 0.24),
                  0 0 1px 1px rgba(255, 255, 255, 1) inset;
      border-color: rgba(38, 56, 201, 0.32);
    }

    .exp-card-3d:focus-visible {
      outline: 2px solid var(--turmeric, #ffbf1f);
      outline-offset: 4px;
    }

    /* Top Accent Line */
    .card-top-accent {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      z-index: 5;
    }

    /* Specular Glare */
    .card-specular-glare {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 4;
      border-radius: inherit;
      transition: opacity 0.25s ease;
    }

    /* 3D Layers Container */
    .card-layers {
      position: relative;
      z-index: 3;
      padding: clamp(22px, 4vw, 32px);
      transform: translateZ(24px);
      transform-style: preserve-3d;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Top Row */
    .card-head-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      transform: translateZ(30px);
    }

    .company-badge-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .company-icon-box {
      width: 46px;
      height: 46px;
      border-radius: 14px;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }

    .company-icon-box[data-tone="cyan"] {
      background: #e0f2fe;
      color: #0284c7;
      border: 1px solid #bae6fd;
    }

    .company-icon-box[data-tone="amber"] {
      background: #fef3c7;
      color: #d97706;
      border: 1px solid #fde68a;
    }

    .company-icon-box[data-tone="purple"] {
      background: #f3e8ff;
      color: #7e22ce;
      border: 1px solid #e9d5ff;
    }

    .company-text-meta {
      display: flex;
      flex-direction: column;
    }

    .company-name {
      margin: 0;
      font-family: var(--f-display);
      font-size: 1.22rem;
      font-weight: 800;
      color: var(--ink, #101a52);
    }

    .company-loc {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--ink-2, #38437a);
      margin-top: 2px;
    }

    .role-timing-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .role-kind-pill {
      font-size: 0.74rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 999px;
    }

    .role-kind-pill[data-tone="cyan"] {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #7dd3fc;
    }

    .role-kind-pill[data-tone="amber"] {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fcd34d;
    }

    .role-kind-pill[data-tone="purple"] {
      background: #f3e8ff;
      color: #6b21a8;
      border: 1px solid #d8b4fe;
    }

    .period-text {
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--ink-2, #38437a);
    }

    /* Role Title & Current Indicator */
    .role-title-block {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      transform: translateZ(28px);
    }

    .role-title {
      margin: 0;
      font-size: clamp(1.2rem, 2.4vw, 1.45rem);
      font-weight: 800;
      color: var(--ink, #101a52);
      line-height: 1.3;
    }

    .current-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 999px;
      background: #dcfce7;
      border: 1px solid #86efac;
      color: #15803d;
      font-size: 0.74rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .live-ping {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
      animation: pulse-dot 1.8s infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }

    /* Highlights Box */
    .highlights-box {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 14px 18px;
      border-radius: 16px;
      background: #ffffff;
      border: 1px solid rgba(38, 56, 201, 0.12);
      box-shadow: 0 2px 8px rgba(24, 36, 140, 0.04);
      transform: translateZ(22px);
    }

    .highlights-title {
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--ink-3, #566190);
    }

    .highlights-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .highlight-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 0.9rem;
      line-height: 1.5;
      color: var(--ink, #101a52);
      font-weight: 600;
    }

    .highlight-bullet {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-top: 7px;
      flex-shrink: 0;
    }

    .highlight-bullet[data-tone="cyan"] { background: #0284c7; box-shadow: 0 0 6px rgba(2, 132, 199, 0.5); }
    .highlight-bullet[data-tone="amber"] { background: #d97706; box-shadow: 0 0 6px rgba(217, 119, 6, 0.5); }
    .highlight-bullet[data-tone="purple"] { background: #7e22ce; box-shadow: 0 0 6px rgba(126, 34, 206, 0.5); }

    .highlight-text {
      flex: 1;
    }

    /* Tech Stack Pills */
    .tech-tags-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      transform: translateZ(24px);
    }

    .tech-pill {
      font-size: 0.76rem;
      font-weight: 700;
      padding: 4px 11px;
      border-radius: 999px;
      background: rgba(38, 56, 201, 0.07);
      color: #1e3a8a;
      border: 1px solid rgba(38, 56, 201, 0.16);
      transition: all 0.2s ease;
    }

    .tech-pill:hover {
      background: var(--royal, #1f2fb0);
      color: #ffffff;
      border-color: transparent;
      transform: translateY(-1px);
    }

    /* Ribbon Footer */
    .card-footer-ribbon {
      display: flex;
      align-items: center;
      gap: 14px;
      padding-top: 10px;
      border-top: 1px solid rgba(38, 56, 201, 0.1);
      flex-wrap: wrap;
      transform: translateZ(18px);
    }

    .metric-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--ink-2, #38437a);
    }

    .metric-check {
      color: #059669;
      font-weight: 800;
    }

    @media (max-width: 680px) {
      .timeline-container {
        padding-left: 0;
      }
      .timeline-spine, .timeline-beacon {
        display: none;
      }
      .card-head-row {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .exp-card-3d {
        transform: none !important;
        transition: none !important;
      }
      .spine-beam {
        animation: none !important;
      }
    }
  `,
})
export class ExperienceSection {
  protected readonly i18n = inject(I18nService);
  private readonly cs = inject(ContentService);

  readonly selectedKey = signal<string>('all');
  protected readonly tiltState = signal<
    Record<string, { rx: number; ry: number; glareX: number; glareY: number; opacity: number }>
  >({});

  protected readonly items = () => this.cs.content()?.experience ?? [];

  protected filteredItems(): any[] {
    const all = this.items();
    const sel = this.selectedKey();
    if (sel === 'all') return all;
    return all.filter((x: any) => x.key === sel);
  }

  protected getMeta(key: string): RoleMeta {
    return (
      META_MAP[key] ?? {
        tone: 'cyan',
        icon: 'briefcase',
        gradient: 'linear-gradient(90deg, #0284c7, #2563eb)',
        techTags: ['Full-Stack', 'Software Engineering'],
        metrics: ['Production Delivery'],
      }
    );
  }

  onMouseMove(key: string, e: MouseEvent, cardEl: HTMLElement): void {
    const rect = cardEl.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    const maxTilt = 8;
    const rx = -(mouseY / (rect.height / 2)) * maxTilt;
    const ry = (mouseX / (rect.width / 2)) * maxTilt;
    const glareX = e.clientX - rect.left;
    const glareY = e.clientY - rect.top;

    this.tiltState.update((prev) => ({
      ...prev,
      [key]: { rx, ry, glareX, glareY, opacity: 0.16 },
    }));
  }

  onMouseLeave(key: string): void {
    this.tiltState.update((prev) => ({
      ...prev,
      [key]: { rx: 0, ry: 0, glareX: 0, glareY: 0, opacity: 0 },
    }));
  }

  computeCardTransform(key: string): string {
    const t = this.tiltState()[key];
    if (!t) return 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
    return `perspective(1200px) rotateX(${t.rx}deg) rotateY(${t.ry}deg)`;
  }

  computeGlare(key: string): string {
    const t = this.tiltState()[key];
    if (!t || t.opacity === 0) return 'none';
    return `radial-gradient(circle 300px at ${t.glareX}px ${t.glareY}px, rgba(255,255,255,0.7), transparent 75%)`;
  }
}
