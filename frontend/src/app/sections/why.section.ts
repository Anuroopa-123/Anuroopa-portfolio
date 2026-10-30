import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { I18nService } from '../core/i18n.service';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective } from '../shared/interaction.directives';

interface WhyItem {
  id: number;
  num: string;
  icon: string;
  badge: string;
  gradient: string;
  accentColor: string;
}

const ITEMS: WhyItem[] = [
  {
    id: 1,
    num: '01',
    icon: 'layers',
    badge: 'Architectural Vision',
    gradient: 'linear-gradient(135deg, rgba(255, 191, 31, 0.22) 0%, rgba(255, 255, 255, 0.95) 100%)',
    accentColor: 'var(--turmeric)',
  },
  {
    id: 2,
    num: '02',
    icon: 'spark',
    badge: 'AI & Data Science',
    gradient: 'linear-gradient(135deg, rgba(38, 56, 201, 0.18) 0%, rgba(255, 255, 255, 0.95) 100%)',
    accentColor: 'var(--accent)',
  },
  {
    id: 3,
    num: '03',
    icon: 'check',
    badge: 'Value & Pragmatism',
    gradient: 'linear-gradient(135deg, rgba(10, 122, 94, 0.18) 0%, rgba(255, 255, 255, 0.95) 100%)',
    accentColor: 'var(--ok)',
  },
  {
    id: 4,
    num: '04',
    icon: 'loop',
    badge: 'Adaptive Mindset',
    gradient: 'linear-gradient(135deg, rgba(31, 47, 176, 0.18) 0%, rgba(255, 255, 255, 0.95) 100%)',
    accentColor: 'var(--royal)',
  },
  {
    id: 5,
    num: '05',
    icon: 'database',
    badge: 'Engineering Quality',
    gradient: 'linear-gradient(135deg, rgba(230, 57, 70, 0.18) 0%, rgba(255, 255, 255, 0.95) 100%)',
    accentColor: 'var(--signal)',
  },
];

const PERSPECTIVE = 1000;
const DEPTH_SPACING = 12;
const TILT_ANGLE = -36;
const TILT_ANGLE_START = 0;
const X_OFFSET = 120;
const SWIPE_THRESHOLD = 50;

@Component({
  selector: 'app-why',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, IconComponent],
  template: `
    <section id="why" class="section" aria-labelledby="why-h">
      <div class="container">
        <div class="section-head" appReveal>
          <div class="pill-tag">
            <span class="sparkle">✦</span>
            Value Proposition
          </div>
          <h2 id="why-h">{{ i18n.t('why.title') }}</h2>
          <p class="lede">{{ i18n.t('why.sub') }}</p>
        </div>

        <div class="why-layout glass" appReveal>
          <!-- Left Column: Interactive Navigation & Principle Selector -->
          <div class="why-sidebar">
            <div class="sidebar-intro">
              <span class="sidebar-count">{{ activeIndex() + 1 }} / {{ items.length }}</span>
              <p class="sidebar-hint">{{ i18n.t('why.swipe_hint') }}</p>
            </div>

            <nav class="principles-list" aria-label="Why work with me list">
              @for (item of items; track item.id; let idx = $index) {
                <button
                  type="button"
                  class="principle-item"
                  [class.active]="activeId() === item.id"
                  (click)="selectCard(item.id)"
                  [attr.aria-current]="activeId() === item.id ? 'true' : null"
                >
                  <span class="p-num">{{ item.num }}</span>
                  <div class="p-content">
                    <span class="p-title">{{ i18n.t('why.' + item.id + '.t') }}</span>
                    <span class="p-badge">{{ item.badge }}</span>
                  </div>
                  <span class="p-arrow" aria-hidden="true">→</span>
                </button>
              }
            </nav>

            <!-- Navigation Controls -->
            <div class="nav-controls">
              <button
                type="button"
                class="ctrl-btn"
                (click)="prevCard()"
                [title]="i18n.t('why.prev')"
                aria-label="Previous card"
              >
                ← {{ i18n.t('why.prev') }}
              </button>
              <div class="dot-indicators">
                @for (item of items; track item.id) {
                  <span
                    class="dot-indicator"
                    [class.on]="activeId() === item.id"
                    (click)="selectCard(item.id)"
                  ></span>
                }
              </div>
              <button
                type="button"
                class="ctrl-btn primary"
                (click)="nextCard()"
                [title]="i18n.t('why.next')"
                aria-label="Next card"
              >
                {{ i18n.t('why.next') }} →
              </button>
            </div>
          </div>

          <!-- Right Column: Originkit 3D Swipe Card Stack -->
          <div class="stack-viewport" [style.perspective.px]="perspective">
            <div class="stack-stage">
              @for (card of cards(); track card.id; let idx = $index) {
                <div
                  class="swipe-card"
                  [class.top-card]="idx === 0"
                  [class.is-dragging]="idx === 0 && isPressed()"
                  [class.snap-back]="idx === 0 && shouldReturnToCenter()"
                  [style.z-index]="cards().length - idx"
                  [style.transform]="computeCardTransform(idx)"
                  [style.opacity]="computeCardOpacity(idx)"
                  (pointerdown)="idx === 0 ? onPointerDown($event) : selectCard(card.id)"
                  (pointermove)="idx === 0 ? onPointerMove($event) : null"
                  (pointerup)="idx === 0 ? onPointerUp($event) : null"
                  (pointercancel)="idx === 0 ? onPointerCancel() : null"
                >
                  <div
                    class="card-inner"
                    [style.background]="card.gradient"
                  >
                    <!-- Decorative Background Watermark -->
                    <span class="watermark-num" aria-hidden="true">{{ card.num }}</span>

                    <!-- Card Header -->
                    <div class="card-head">
                      <div class="badge-pill" [style.border-color]="card.accentColor">
                        <app-icon [name]="card.icon" [size]="16" />
                        <span>{{ card.badge }}</span>
                      </div>
                      <span class="card-step-badge">{{ card.num }} / 05</span>
                    </div>

                    <!-- Card Core Body -->
                    <div class="card-body">
                      <div class="card-icon-avatar" [style.border-color]="card.accentColor">
                        <app-icon [name]="card.icon" [size]="28" />
                      </div>
                      <h3 class="card-title">{{ i18n.t('why.' + card.id + '.t') }}</h3>
                      <p class="card-desc">{{ i18n.t('why.' + card.id + '.d') }}</p>

                      <div class="tag-box">
                        <span class="tag-dot" [style.background]="card.accentColor"></span>
                        <span class="tag-text">{{ i18n.t('why.' + card.id + '.tag') }}</span>
                      </div>
                    </div>

                    <!-- Card Footer & Swipe Callout -->
                    <div class="card-foot">
                      <span class="swipe-prompt">
                        @if (idx === 0) {
                          <span class="prompt-icon">👆</span>
                          <span>{{ i18n.t('why.swipe_hint') }}</span>
                        } @else {
                          <span>Tap to view</span>
                        }
                      </span>
                      <span class="cycle-pill" (click)="cycleCard($event)">
                        Next →
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>
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

    .why-layout {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: 40px;
      padding: clamp(24px, 3.8vw, 44px);
      border-radius: var(--r-lg);
      align-items: center;
      position: relative;
      overflow: hidden;
    }

    /* Left Sidebar */
    .why-sidebar {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .sidebar-intro {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .sidebar-count {
      font-family: var(--f-display);
      font-weight: 800;
      font-size: 1.15rem;
      color: var(--accent);
    }
    .sidebar-hint {
      margin: 0;
      font-size: 0.84rem;
      color: var(--ink-3);
      font-style: italic;
    }

    .principles-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .principle-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 18px;
      border-radius: var(--r-md);
      border: 1.5px solid var(--accent-line);
      background: var(--glass);
      text-align: left;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .principle-item:hover {
      border-color: var(--accent);
      background: #ffffff;
      transform: translateX(4px);
    }
    .principle-item.active {
      background: var(--ink);
      color: #ffffff;
      border-color: var(--ink);
      box-shadow: 0 10px 24px -6px rgba(16, 26, 82, 0.3);
      transform: translateX(8px);
    }
    .p-num {
      font-family: var(--f-display);
      font-weight: 800;
      font-size: 0.95rem;
      color: var(--turmeric);
    }
    .principle-item.active .p-num {
      color: var(--turmeric);
    }
    .p-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .p-title {
      font-family: var(--f-display);
      font-weight: 700;
      font-size: 0.98rem;
      line-height: 1.25;
    }
    .p-badge {
      font-size: 0.74rem;
      color: var(--ink-3);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .principle-item.active .p-badge {
      color: rgba(255, 255, 255, 0.75);
    }
    .p-arrow {
      font-weight: 800;
      color: var(--ink-3);
      transition: transform 0.2s ease;
    }
    .principle-item:hover .p-arrow,
    .principle-item.active .p-arrow {
      transform: translateX(3px);
      color: var(--turmeric);
    }

    /* Controls */
    .nav-controls {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 8px;
    }
    .ctrl-btn {
      padding: 8px 18px;
      border-radius: 999px;
      border: 1.5px solid var(--accent-line);
      background: #fff;
      color: var(--ink);
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .ctrl-btn:hover {
      border-color: var(--ink);
      transform: translateY(-2px);
    }
    .ctrl-btn.primary {
      background: var(--ink);
      color: #fff;
      border-color: var(--ink);
    }
    .ctrl-btn.primary:hover {
      background: var(--accent);
      border-color: var(--accent);
    }
    .dot-indicators {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .dot-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-line);
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .dot-indicator.on {
      width: 22px;
      border-radius: 999px;
      background: var(--accent);
    }

    /* Right Column: Originkit 3D Viewport */
    .stack-viewport {
      position: relative;
      width: 100%;
      min-height: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      perspective: 1000px;
      user-select: none;
      touch-action: pan-y;
      padding: 20px 0;
    }
    .stack-stage {
      position: relative;
      width: min(340px, 86vw);
      height: 420px;
      transform-style: preserve-3d;
    }
    .swipe-card {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 24px;
      background: #ffffff;
      border: 1.5px solid var(--accent-line);
      box-shadow: 0 16px 36px -10px rgba(16, 26, 82, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04);
      will-change: transform, opacity;
      transform-style: preserve-3d;
      cursor: grab;
      transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.25s ease;
      overflow: hidden;
    }
    .swipe-card.is-dragging {
      cursor: grabbing !important;
      transition: none !important;
      box-shadow: 0 26px 50px -8px rgba(38, 56, 201, 0.32), 0 8px 20px rgba(0, 0, 0, 0.12);
    }
    .swipe-card.snap-back {
      transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
    }

    .card-inner {
      height: 100%;
      padding: 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      border-radius: 22px;
    }

    /* Watermark */
    .watermark-num {
      position: absolute;
      top: -14px;
      right: 12px;
      font-family: var(--f-display);
      font-size: 7.5rem;
      font-weight: 900;
      color: rgba(16, 26, 82, 0.05);
      line-height: 1;
      pointer-events: none;
      z-index: 0;
    }

    .card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 1;
    }
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.88);
      border: 1.5px solid var(--accent-line);
      font-size: 0.76rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--ink);
      backdrop-filter: blur(8px);
    }
    .card-step-badge {
      font-family: var(--f-display);
      font-weight: 800;
      font-size: 0.82rem;
      color: var(--ink-3);
    }

    .card-body {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      position: relative;
      z-index: 1;
      margin-top: 10px;
    }
    .card-icon-avatar {
      width: 58px;
      height: 58px;
      border-radius: 16px;
      background: #ffffff;
      border: 2px solid var(--accent-line);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ink);
      box-shadow: 0 8px 18px -4px rgba(16, 26, 82, 0.12);
    }
    .card-title {
      font-family: var(--f-display);
      font-size: clamp(1.4rem, 2.8vw, 1.7rem);
      color: var(--ink);
      line-height: 1.15;
      margin: 0;
    }
    .card-desc {
      margin: 0;
      font-size: 0.94rem;
      line-height: 1.55;
      color: var(--ink-2);
    }

    .tag-box {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: var(--r-sm);
      background: rgba(255, 255, 255, 0.9);
      border: 1px dashed var(--accent-line);
      margin-top: 6px;
      width: 100%;
    }
    .tag-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .tag-text {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--ink-2);
      letter-spacing: 0.02em;
    }

    .card-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--accent-line);
      padding-top: 14px;
      position: relative;
      z-index: 1;
      font-size: 0.8rem;
      color: var(--ink-3);
    }
    .swipe-prompt {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
    }
    .prompt-icon {
      animation: bounceHand 1.8s infinite ease-in-out;
    }
    @keyframes bounceHand {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(4px); }
    }
    .cycle-pill {
      cursor: pointer;
      font-weight: 800;
      color: var(--accent);
      padding: 4px 10px;
      border-radius: 999px;
      background: var(--accent-soft);
      transition: all 0.2s ease;
    }
    .cycle-pill:hover {
      background: var(--accent);
      color: #fff;
    }

    @media (max-width: 900px) {
      .why-layout {
        grid-template-columns: 1fr;
        gap: 32px;
      }
      .stack-viewport {
        min-height: 440px;
      }
    }
  `,
})
export class WhySection {
  protected readonly i18n = inject(I18nService);
  protected readonly items = ITEMS;

  readonly perspective = PERSPECTIVE;
  readonly depthSpacing = DEPTH_SPACING;
  readonly tiltAngle = TILT_ANGLE;
  readonly tiltAngleStart = TILT_ANGLE_START;
  readonly xOffset = X_OFFSET;
  readonly swipeThreshold = SWIPE_THRESHOLD;

  readonly cards = signal<WhyItem[]>([...ITEMS]);
  readonly isPressed = signal(false);
  readonly shouldReturnToCenter = signal(false);

  readonly activeId = computed(() => this.cards()[0]?.id ?? 1);
  readonly activeIndex = computed(() => {
    const curId = this.activeId();
    return this.items.findIndex((x) => x.id === curId);
  });

  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;
  private activePointerId: number | null = null;

  computeCardTransform(index: number): string {
    const totalCards = this.cards().length;
    const stackOffset = index * 8;
    const scaleValue = 1 - index * 0.05;
    const rotationValue =
      totalCards > 1
        ? this.tiltAngleStart + (index / (totalCards - 1)) * (this.tiltAngle - this.tiltAngleStart)
        : this.tiltAngleStart;
    const xOffsetValue = totalCards > 1 ? (index / (totalCards - 1)) * this.xOffset : 0;
    const depthOffset = index * this.depthSpacing;

    const isTopCard = index === 0;

    if (isTopCard && this.isPressed()) {
      const dx = this.currentX - this.startX;
      const dy = this.currentY - this.startY;
      const dragRotate = dx * 0.08;
      return `translate3d(${dx}px, ${dy}px, 0px) rotate(${dragRotate}deg) scale(1.05)`;
    }

    if (isTopCard && this.shouldReturnToCenter()) {
      return `translate3d(0px, 0px, 0px) rotate(0deg) scale(1)`;
    }

    return `translate3d(${xOffsetValue}px, ${-stackOffset}px, ${-depthOffset}px) rotate(${rotationValue}deg) scale(${scaleValue})`;
  }

  computeCardOpacity(index: number): number {
    return index < 4 ? 1 : 0.4;
  }

  onPointerDown(event: PointerEvent): void {
    if (this.cards().length <= 1) return;
    this.activePointerId = event.pointerId;
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.currentX = event.clientX;
    this.currentY = event.clientY;
    this.isPressed.set(true);
    this.shouldReturnToCenter.set(false);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isPressed()) return;
    this.currentX = event.clientX;
    this.currentY = event.clientY;
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.isPressed()) return;
    this.isPressed.set(false);
    if (this.activePointerId !== null) {
      try {
        (event.target as HTMLElement).releasePointerCapture?.(this.activePointerId);
      } catch {}
      this.activePointerId = null;
    }

    const dx = this.currentX - this.startX;
    const dy = this.currentY - this.startY;
    const distance = Math.hypot(dx, dy);

    if (distance > this.swipeThreshold) {
      this.cycleTopCard();
    } else {
      this.shouldReturnToCenter.set(true);
      setTimeout(() => this.shouldReturnToCenter.set(false), 300);
    }
  }

  onPointerCancel(): void {
    this.isPressed.set(false);
    this.shouldReturnToCenter.set(true);
    setTimeout(() => this.shouldReturnToCenter.set(false), 300);
  }

  cycleTopCard(): void {
    const list = this.cards();
    if (list.length <= 1) return;
    const [top, ...rest] = list;
    this.cards.set([...rest, top]);
  }

  nextCard(): void {
    this.cycleTopCard();
  }

  prevCard(): void {
    const list = this.cards();
    if (list.length <= 1) return;
    const last = list[list.length - 1];
    const rest = list.slice(0, -1);
    this.cards.set([last, ...rest]);
  }

  cycleCard(event: Event): void {
    event.stopPropagation();
    this.cycleTopCard();
  }

  selectCard(id: number): void {
    const list = this.cards();
    const idx = list.findIndex((x) => x.id === id);
    if (idx === 0) return;
    if (idx > 0) {
      const selected = list[idx];
      const rest = list.filter((_, i) => i !== idx);
      this.cards.set([selected, ...rest]);
    }
  }
}
