import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';

import { I18nService } from '../core/i18n.service';
import { AnimatedCardComponent } from '../shared/animated-card.component';
import { RevealDirective } from '../shared/interaction.directives';

@Component({
  selector: 'app-ai',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, AnimatedCardComponent],
  template: `
    <section id="ai" class="ai-section" aria-labelledby="ai-h">
      <div class="container" appReveal>
        <!-- Section Header -->
        <header class="section-header">
          <div class="header-badge">
            <span class="badge-dot"></span>
            <span>{{ i18n.t('ai.badge') }}</span>
          </div>
          <h2 id="ai-h" class="section-title">{{ i18n.t('ai.title') }}</h2>
          <p class="section-desc">{{ i18n.t('ai.body') }}</p>

          <!-- View Mode Switcher -->
          <div class="mode-switcher" role="tablist" aria-label="Card view mode">
            <button
              type="button"
              class="mode-btn"
              [class.active]="viewMode() === 'deck'"
              (click)="viewMode.set('deck')"
              role="tab"
              [attr.aria-selected]="viewMode() === 'deck'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              <span>{{ i18n.t('ai.view_deck') }}</span>
            </button>
            <button
              type="button"
              class="mode-btn"
              [class.active]="viewMode() === 'grid'"
              (click)="viewMode.set('grid')"
              role="tab"
              [attr.aria-selected]="viewMode() === 'grid'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>{{ i18n.t('ai.view_grid') }}</span>
            </button>
          </div>
        </header>

        <!-- Cards Container (Deck Mode vs Grid Mode) -->
        <div class="cards-wrapper" [class.is-deck]="viewMode() === 'deck'" [class.is-grid]="viewMode() === 'grid'">
          <!-- CARD 1: Pipeline Flow (Cyan/Blue) -->
          <app-animated-card
            variant="cyan"
            [isDeckMode]="viewMode() === 'deck'"
            [deckSlot]="computeDeckSlot(0)"
            [isActive]="activeCardIndex() === 0"
            (cardClick)="selectCard(0)"
          >
            <div class="card-header">
              <div class="card-icon-wrap cyan">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                </svg>
              </div>
              <div class="card-titles">
                <span class="card-category cyan">{{ i18n.t('ai.card1.category') }}</span>
                <h3 class="card-title">{{ i18n.t('ai.pipeline') }}</h3>
              </div>
            </div>

            <!-- Pipeline Mini Stepper -->
            <div class="pipeline-track">
              @for (n of steps; track n) {
                <div class="pipe-step" [attr.data-step]="n">
                  <span class="step-num">{{ n }}</span>
                  <span class="step-text">{{ i18n.t('ai.s' + n) }}</span>
                </div>
              }
            </div>

            <!-- Tags -->
            <div class="card-tags">
              <span class="tag">Audio / Voice</span>
              <span class="tag">Vision / Media</span>
              <span class="tag">AI / ML</span>
              <span class="tag">FastAPI</span>
              <span class="tag">Real-Time</span>
            </div>

            <div class="card-footer">
              <span class="footer-meta">7-Stage End-to-End Orchestration</span>
            </div>
          </app-animated-card>

          <!-- CARD 2: Frontier AI & Applied Research (Purple/Pink) -->
          <app-animated-card
            variant="purple"
            [isDeckMode]="viewMode() === 'deck'"
            [deckSlot]="computeDeckSlot(1)"
            [isActive]="activeCardIndex() === 1"
            (cardClick)="selectCard(1)"
          >
            <div class="card-header">
              <div class="card-icon-wrap purple">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4 21l3.39-.97C8.93 20.66 10.42 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"></path>
                  <path d="M12 8v4l3 3"></path>
                </svg>
              </div>
              <div class="card-titles">
                <span class="card-category purple">{{ i18n.t('ai.card2.category') }}</span>
                <h3 class="card-title">{{ i18n.t('ai.interests') }}</h3>
              </div>
            </div>

            <!-- Focus Items List -->
            <div class="interests-grid">
              @for (n of tags; track n) {
                <div class="interest-chip">
                  <span class="chip-bullet" [attr.data-idx]="n"></span>
                  <span class="chip-text">{{ i18n.t('ai.i' + n) }}</span>
                </div>
              }
            </div>

            <!-- Tags -->
            <div class="card-tags">
              <span class="tag">Tamil Speech AI</span>
              <span class="tag">YOLOv8</span>
              <span class="tag">Gesture AI</span>
              <span class="tag">Python</span>
              <span class="tag">PyTorch</span>
            </div>

            <div class="card-footer">
              <span class="footer-meta">B.Tech AI & Data Science Foundation</span>
            </div>
          </app-animated-card>

          <!-- CARD 3: Production Roadmap & Milestones (Emerald/Yellow) -->
          <app-animated-card
            variant="emerald"
            [isDeckMode]="viewMode() === 'deck'"
            [deckSlot]="computeDeckSlot(2)"
            [isActive]="activeCardIndex() === 2"
            (cardClick)="selectCard(2)"
          >
            <div class="card-header">
              <div class="card-icon-wrap emerald">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div class="card-titles">
                <span class="card-category emerald">{{ i18n.t('ai.card3.category') }}</span>
                <h3 class="card-title">{{ i18n.t('ai.card3.title') }}</h3>
              </div>
            </div>

            <!-- Milestones Tracker -->
            <div class="milestones-track">
              <!-- Phase 1 -->
              <div class="milestone-item is-done">
                <div class="m-status-icon done">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div class="m-info">
                  <div class="m-top">
                    <span class="m-title">{{ i18n.t('ai.card3.m1') }}</span>
                    <span class="m-badge done">{{ i18n.t('ai.card3.m1_status') }}</span>
                  </div>
                </div>
              </div>

              <!-- Phase 2 -->
              <div class="milestone-item is-active">
                <div class="m-status-icon active">
                  <span class="pulse-ring"></span>
                </div>
                <div class="m-info">
                  <div class="m-top">
                    <span class="m-title">{{ i18n.t('ai.card3.m2') }}</span>
                    <span class="m-badge active">{{ i18n.t('ai.card3.m2_status') }}</span>
                  </div>
                </div>
              </div>

              <!-- Phase 3 -->
              <div class="milestone-item is-next">
                <div class="m-status-icon next">
                  <span class="dot-next"></span>
                </div>
                <div class="m-info">
                  <div class="m-top">
                    <span class="m-title">{{ i18n.t('ai.card3.m3') }}</span>
                    <span class="m-badge next">{{ i18n.t('ai.card3.m3_status') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quote/Status note -->
            <div class="status-quote">
              <p>{{ i18n.t('ai.status') }}</p>
            </div>

            <!-- Tags -->
            <div class="card-tags">
              <span class="tag">Auth: Built</span>
              <span class="tag">Chat/Docs: Active</span>
              <span class="tag">Video QA: Next</span>
            </div>

            <div class="card-footer">
              <span class="footer-meta">Continuous Delivery & Production</span>
            </div>
          </app-animated-card>
        </div>

        <!-- Deck Controls & Hint (Visible only in deck mode) -->
        @if (viewMode() === 'deck') {
          <div class="deck-controls">
            <button
              type="button"
              class="deck-nav-btn"
              (click)="cyclePrev()"
              aria-label="Previous Card"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div class="deck-dots" role="tablist">
              @for (card of [0, 1, 2]; track card) {
                <button
                  type="button"
                  class="deck-dot"
                  [class.active]="activeCardIndex() === card"
                  (click)="selectCard(card)"
                  [attr.aria-label]="'Go to card ' + (card + 1)"
                ></button>
              }
            </div>

            <button
              type="button"
              class="deck-nav-btn"
              (click)="cycleNext()"
              aria-label="Next Card"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
          <p class="deck-hint">{{ i18n.t('ai.hint') }}</p>
        }
      </div>
    </section>
  `,
  styles: `
    .ai-section {
      padding: clamp(60px, 8vw, 100px) 0;
      position: relative;
    }

    .section-header {
      max-width: 760px;
      margin: 0 auto clamp(36px, 5vw, 56px);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
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

    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent, #2638c9);
      box-shadow: 0 0 8px rgba(38, 56, 201, 0.6);
      animation: pulse-dot 2s infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
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

    /* Mode Switcher */
    .mode-switcher {
      display: inline-flex;
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(38, 56, 201, 0.18);
      box-shadow: 0 4px 14px rgba(24, 36, 140, 0.06);
      padding: 4px;
      border-radius: 999px;
      margin-top: 10px;
      gap: 4px;
    }

    .mode-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 8px 18px;
      border-radius: 999px;
      border: none;
      background: transparent;
      color: var(--ink-2, #38437a);
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .mode-btn:hover {
      color: var(--ink, #101a52);
      background: rgba(38, 56, 201, 0.05);
    }

    .mode-btn.active {
      background: var(--royal, #1f2fb0);
      color: #fff;
      box-shadow: 0 4px 14px rgba(31, 47, 176, 0.35);
    }

    /* Cards Layout Wrappers */
    .cards-wrapper.is-deck {
      position: relative;
      height: 580px;
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      perspective: 1200px;
    }

    .cards-wrapper.is-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Card Content Styling */
    .card-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 18px;
    }

    .card-icon-wrap {
      width: 46px;
      height: 46px;
      border-radius: 14px;
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }

    .card-icon-wrap.cyan {
      background: #e0f2fe;
      color: #0284c7;
      border: 1px solid #bae6fd;
    }

    .card-icon-wrap.purple {
      background: #f3e8ff;
      color: #7e22ce;
      border: 1px solid #e9d5ff;
    }

    .card-icon-wrap.emerald {
      background: #d1fae5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }

    .card-titles {
      display: flex;
      flex-direction: column;
    }

    .card-category {
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--ink-2, #38437a);
    }

    .card-category.cyan { color: #0284c7; }
    .card-category.purple { color: #7e22ce; }
    .card-category.emerald { color: #047857; }

    .card-title {
      font-size: 1.25rem;
      font-weight: 800;
      margin: 3px 0 0;
      color: var(--ink, #101a52);
      line-height: 1.25;
    }

    /* Pipeline Track (Card 1) */
    .pipeline-track {
      display: flex;
      flex-direction: column;
      gap: 7px;
      margin: 6px 0 16px;
      position: relative;
    }

    .pipe-step {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 12px;
      background: #ffffff;
      border: 1px solid rgba(38, 56, 201, 0.12);
      box-shadow: 0 2px 6px rgba(24, 36, 140, 0.04);
      border-radius: 10px;
      transition: all 0.2s ease;
    }

    .pipe-step:hover {
      background: #f0f9ff;
      border-color: #0284c7;
      transform: translateX(2px);
    }

    .step-num {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #0284c7;
      color: #ffffff;
      display: grid;
      place-items: center;
      font-size: 0.75rem;
      font-weight: 800;
      flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(2, 132, 199, 0.3);
    }

    .step-text {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--ink, #101a52);
    }

    /* Interests List (Card 2) */
    .interests-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 6px 0 16px;
    }

    .interest-chip {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 12px;
      background: #ffffff;
      border: 1px solid rgba(126, 34, 206, 0.14);
      box-shadow: 0 2px 6px rgba(24, 36, 140, 0.04);
      transition: all 0.2s ease;
    }

    .interest-chip:hover {
      background: #faf5ff;
      border-color: #7e22ce;
      transform: translateX(2px);
    }

    .chip-bullet {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .chip-bullet[data-idx="1"] { background: #0284c7; box-shadow: 0 0 6px rgba(2, 132, 199, 0.5); }
    .chip-bullet[data-idx="2"] { background: #7e22ce; box-shadow: 0 0 6px rgba(126, 34, 206, 0.5); }
    .chip-bullet[data-idx="3"] { background: #db2777; box-shadow: 0 0 6px rgba(219, 39, 119, 0.5); }
    .chip-bullet[data-idx="4"] { background: #d97706; box-shadow: 0 0 6px rgba(217, 119, 6, 0.5); }
    .chip-bullet[data-idx="5"] { background: #059669; box-shadow: 0 0 6px rgba(5, 150, 105, 0.5); }
    .chip-bullet[data-idx="6"] { background: #ea580c; box-shadow: 0 0 6px rgba(234, 88, 12, 0.5); }

    .chip-text {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--ink, #101a52);
    }

    /* Milestones Track (Card 3) */
    .milestones-track {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 6px 0 16px;
    }

    .milestone-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 12px;
      background: #ffffff;
      border: 1px solid rgba(4, 120, 87, 0.14);
      box-shadow: 0 2px 6px rgba(24, 36, 140, 0.04);
    }

    .m-status-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }

    .m-status-icon.done {
      background: #dcfce7;
      color: #15803d;
    }

    .m-status-icon.active {
      background: #e0f2fe;
      color: #0284c7;
      position: relative;
    }

    .pulse-ring {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #0284c7;
      box-shadow: 0 0 8px rgba(2, 132, 199, 0.6);
      animation: pulse-ring 1.8s infinite;
    }

    @keyframes pulse-ring {
      0% { transform: scale(0.9); opacity: 1; }
      50% { transform: scale(1.4); opacity: 0.4; }
      100% { transform: scale(0.9); opacity: 1; }
    }

    .m-status-icon.next {
      background: #f1f5f9;
      color: #64748b;
    }

    .dot-next {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #94a3b8;
    }

    .m-info {
      flex: 1;
    }

    .m-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .m-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--ink, #101a52);
    }

    .m-badge {
      font-size: 0.72rem;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .m-badge.done {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }

    .m-badge.active {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #7dd3fc;
    }

    .m-badge.next {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }

    .status-quote {
      padding: 12px 16px;
      border-radius: 12px;
      background: #fefce8;
      border: 1px solid #fef08a;
      border-left: 4px solid #ca8a04;
      box-shadow: 0 2px 6px rgba(202, 138, 4, 0.08);
      margin-bottom: 14px;
    }

    .status-quote p {
      margin: 0;
      font-size: 0.85rem;
      line-height: 1.55;
      color: #713f12;
      font-weight: 600;
      font-style: normal;
    }

    /* Tags container */
    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin-top: auto;
      padding-top: 10px;
    }

    .tag {
      font-size: 0.76rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 999px;
      background: rgba(38, 56, 201, 0.08);
      color: #1e3a8a;
      border: 1px solid rgba(38, 56, 201, 0.18);
    }

    /* Footer */
    .card-footer {
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1px solid rgba(38, 56, 201, 0.1);
      display: flex;
      justify-content: flex-end;
    }

    .footer-meta {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--ink-2, #38437a);
    }

    /* Deck Controls */
    .deck-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 18px;
      margin-top: 28px;
    }

    .deck-nav-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 1px solid rgba(38, 56, 201, 0.2);
      background: #ffffff;
      color: var(--ink, #101a52);
      box-shadow: 0 4px 14px rgba(24, 36, 140, 0.08);
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .deck-nav-btn:hover {
      background: var(--royal, #1f2fb0);
      color: #fff;
      border-color: transparent;
      transform: scale(1.08);
    }

    .deck-dots {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .deck-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      border: none;
      background: rgba(38, 56, 201, 0.22);
      cursor: pointer;
      transition: all 0.25s ease;
      padding: 0;
    }

    .deck-dot.active {
      width: 32px;
      background: var(--turmeric, #ffbf1f);
      box-shadow: 0 0 8px rgba(255, 191, 31, 0.5);
    }

    .deck-hint {
      text-align: center;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--ink-2, #38437a);
      margin: 14px 0 0;
    }

    @media (max-width: 768px) {
      .cards-wrapper.is-deck {
        height: auto;
        min-height: 540px;
      }
      .mode-switcher {
        display: none;
      }
    }
  `,
})
export class AiSection {
  protected readonly i18n = inject(I18nService);
  protected readonly steps = [1, 2, 3, 4, 5, 6, 7];
  protected readonly tags = [1, 2, 3, 4, 5, 6];

  protected readonly viewMode = signal<'deck' | 'grid'>('deck');
  protected readonly activeCardIndex = signal(1); // Card 2 (index 1) in center by default

  selectCard(index: number): void {
    this.activeCardIndex.set(index);
  }

  cyclePrev(): void {
    this.activeCardIndex.update((curr) => (curr === 0 ? 2 : curr - 1));
  }

  cycleNext(): void {
    this.activeCardIndex.update((curr) => (curr === 2 ? 0 : curr + 1));
  }

  computeDeckSlot(cardIndex: number): 'left' | 'center' | 'right' | 'none' {
    if (this.viewMode() !== 'deck') return 'none';
    const active = this.activeCardIndex();
    if (cardIndex === active) return 'center';

    // If active is 1: 0 is left, 2 is right
    // If active is 0: 2 is left, 1 is right
    // If active is 2: 1 is left, 0 is right
    if ((active + 2) % 3 === cardIndex) {
      return 'left';
    }
    return 'right';
  }
}
