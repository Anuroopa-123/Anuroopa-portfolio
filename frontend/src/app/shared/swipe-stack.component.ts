import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';

import { I18nService } from '../core/i18n.service';
import { Skill } from '../core/models';

const PERSPECTIVE = 1000;
const DEPTH_SPACING = 12;

export interface CardStyle {
  zIndex: number;
  transform: string;
  opacity: number;
}

@Component({
  selector: 'app-swipe-stack',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="stack-viewport"
      [style.perspective.px]="perspective"
    >
      <div class="stack-stage">
        @for (card of cards(); track card.name; let idx = $index) {
          @if (idx < 5) {
            <div
              class="swipe-card"
              [class.top-card]="idx === 0"
              [class.is-dragging]="idx === 0 && isPressed()"
              [class.snap-back]="idx === 0 && shouldReturnToCenter()"
              [style.z-index]="cards().length - idx"
              [style.transform]="computeCardTransform(idx)"
              [style.opacity]="computeCardOpacity(idx)"
              (pointerdown)="idx === 0 ? onPointerDown($event) : bringToFront(idx)"
              (pointermove)="idx === 0 ? onPointerMove($event) : null"
              (pointerup)="idx === 0 ? onPointerUp($event) : null"
              (pointercancel)="idx === 0 ? onPointerCancel() : null"
            >
              <div class="card-inner">
                <div class="card-header">
                  <span class="category-pill">{{ card.category }}</span>
                  <span class="level-badge" [attr.data-level]="card.level">
                    <span class="dot"></span>
                    {{ i18n.t('lvl.' + card.level) }}
                  </span>
                </div>

                <div class="card-body">
                  <div class="skill-icon-wrap" [attr.data-level]="card.level">
                    <span class="initials">{{ getInitials(card.name) }}</span>
                  </div>
                  <h3 class="skill-name">{{ card.name }}</h3>
                  <div class="skill-note">
                    <span class="note-label">{{ i18n.t('skills.used_in') }}</span>
                    <p>{{ i18n.tr(card.note) }}</p>
                  </div>
                </div>

                <div class="card-footer">
                  <span class="counter">
                    {{ idx + 1 }} {{ i18n.t('skills.card_of') }} {{ cards().length }}
                  </span>
                  @if (idx === 0) {
                    <span class="hint">{{ i18n.t('skills.swipe_hint') }}</span>
                  }
                </div>
              </div>
            </div>
          }
        }
      </div>

      <!-- Quick Nav Buttons for Accessibility & Fast Browsing -->
      <div class="stack-controls">
        <button
          type="button"
          class="ctrl-btn"
          (click)="prevCard()"
          [title]="i18n.t('skills.prev')"
          aria-label="Previous skill"
        >
          ← {{ i18n.t('skills.prev') }}
        </button>
        <span class="nav-count">{{ currentTopIndex() + 1 }} / {{ cards().length }}</span>
        <button
          type="button"
          class="ctrl-btn primary"
          (click)="nextCard()"
          [title]="i18n.t('skills.next')"
          aria-label="Next skill"
        >
          {{ i18n.t('skills.next') }} →
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .stack-viewport {
      position: relative;
      width: 100%;
      min-height: 440px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px 0;
      user-select: none;
      touch-action: pan-y;
    }
    .stack-stage {
      position: relative;
      width: min(340px, 86vw);
      height: 400px;
      perspective: 1000px;
    }
    .swipe-card {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 20px;
      background: var(--paper);
      background: linear-gradient(145deg, #ffffff 0%, rgba(248, 246, 240, 0.96) 100%);
      border: 1.5px solid var(--accent-line);
      box-shadow: 0 14px 34px -10px rgba(27, 26, 23, 0.15), 0 2px 6px rgba(27, 26, 23, 0.05);
      will-change: transform, opacity;
      transform-style: preserve-3d;
      cursor: grab;
      transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.25s ease;
    }
    .swipe-card.is-dragging {
      cursor: grabbing !important;
      transition: none !important;
      box-shadow: 0 24px 44px -8px rgba(153, 103, 255, 0.25), 0 8px 16px rgba(0, 0, 0, 0.1);
    }
    .swipe-card.snap-back {
      transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
    }
    .card-inner {
      height: 100%;
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-radius: 18px;
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .category-pill {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 800;
      color: var(--ink-3);
      padding: 4px 10px;
      background: rgba(27, 26, 23, 0.05);
      border-radius: 999px;
    }
    .level-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 999px;
      border: 1px solid var(--accent-line);
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    [data-level='daily'] .dot { background: var(--accent); }
    [data-level='daily'] { color: var(--accent); border-color: rgba(184, 51, 42, 0.3); background: rgba(184, 51, 42, 0.06); }
    [data-level='working'] .dot { background: var(--turmeric); }
    [data-level='working'] { color: #9c6c00; border-color: rgba(217, 119, 6, 0.3); background: rgba(217, 119, 6, 0.08); }
    [data-level='exploring'] .dot { background: var(--signal); }
    [data-level='exploring'] { color: var(--signal); border-color: rgba(37, 99, 235, 0.3); background: rgba(37, 99, 235, 0.06); }

    .card-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 10px 0;
      gap: 12px;
    }
    .skill-icon-wrap {
      width: 68px;
      height: 68px;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(27, 26, 23, 0.04);
      border: 1.5px solid var(--accent-line);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
    }
    .initials {
      font-family: var(--f-display);
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--ink);
    }
    .skill-name {
      margin: 0;
      font-family: var(--f-display);
      font-size: clamp(1.5rem, 3vw, 1.85rem);
      color: var(--ink);
      line-height: 1.15;
    }
    .skill-note {
      background: rgba(255, 255, 255, 0.85);
      border: 1px dashed var(--accent-line);
      border-radius: 12px;
      padding: 12px 14px;
      text-align: left;
      width: 100%;
    }
    .note-label {
      display: block;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 800;
      color: var(--ink-3);
      margin-bottom: 4px;
    }
    .skill-note p {
      margin: 0;
      font-size: 0.88rem;
      color: var(--ink-2);
      line-height: 1.4;
    }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--accent-line);
      padding-top: 12px;
      font-size: 0.8rem;
      color: var(--ink-3);
    }
    .counter {
      font-weight: 800;
      color: var(--ink);
    }
    .hint {
      font-size: 0.75rem;
      opacity: 0.8;
    }
    .stack-controls {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 24px;
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
    .nav-count {
      font-weight: 800;
      font-size: 0.9rem;
      color: var(--ink-2);
    }
  `,
})
export class SwipeStackComponent implements OnChanges {
  protected readonly i18n = inject(I18nService);
  private readonly el = inject(ElementRef);

  @Input() skills: Skill[] = [];
  @Input() selectedSkill: string | null = null;
  @Output() skillSelected = new EventEmitter<string>();

  // Config parameters matching Originkit
  readonly perspective = PERSPECTIVE;
  readonly depthSpacing = DEPTH_SPACING;
  readonly swipeThreshold = 50;
  readonly tiltAngle = -28; // Degree of stack rotation
  readonly tiltAngleStart = 0;
  readonly xOffset = 90; // Stack offset along X

  readonly cards = signal<Skill[]>([]);
  readonly isPressed = signal(false);
  readonly shouldReturnToCenter = signal(false);
  readonly currentTopIndex = signal(0);

  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;
  private activePointerId: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['skills'] && this.skills) {
      this.cards.set([...this.skills]);
      this.currentTopIndex.set(0);
    }

    if (changes['selectedSkill'] && this.selectedSkill) {
      this.focusSkill(this.selectedSkill);
    }
  }

  computeCardTransform(index: number): string {
    const totalCards = Math.min(this.cards().length, 5);
    const stackOffset = index * 8;
    const scaleValue = 1 - index * 0.05;
    const rotationValue =
      totalCards > 1
        ? this.tiltAngleStart + (index / (totalCards - 1)) * (this.tiltAngle - this.tiltAngleStart)
        : this.tiltAngleStart;
    const xOffsetValue = totalCards > 1 ? (index / (totalCards - 1)) * this.xOffset : 0;
    const depthOffset = index * this.depthSpacing;

    const isTop = index === 0;

    if (isTop && this.isPressed()) {
      const dx = this.currentX - this.startX;
      const dy = this.currentY - this.startY;
      const dragRotate = dx * 0.08;
      return `translate3d(${dx}px, ${dy}px, 0px) rotate(${dragRotate}deg) scale(1.05)`;
    }

    if (isTop && this.shouldReturnToCenter()) {
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
    const nextList = [...rest, top];
    this.cards.set(nextList);
    this.currentTopIndex.set((this.currentTopIndex() + 1) % list.length);
    this.skillSelected.emit(nextList[0].name);
  }

  nextCard(): void {
    this.cycleTopCard();
  }

  prevCard(): void {
    const list = this.cards();
    if (list.length <= 1) return;
    const last = list[list.length - 1];
    const rest = list.slice(0, list.length - 1);
    const nextList = [last, ...rest];
    this.cards.set(nextList);
    const prevIdx = (this.currentTopIndex() - 1 + list.length) % list.length;
    this.currentTopIndex.set(prevIdx);
    this.skillSelected.emit(nextList[0].name);
  }

  bringToFront(index: number): void {
    const list = this.cards();
    if (index <= 0 || index >= list.length) return;
    const selected = list[index];
    const rest = list.filter((_, i) => i !== index);
    const nextList = [selected, ...rest];
    this.cards.set(nextList);
    this.skillSelected.emit(selected.name);
  }

  focusSkill(name: string): void {
    const list = this.cards();
    const idx = list.findIndex((s) => s.name === name);
    if (idx > 0) {
      this.bringToFront(idx);
    }
  }

  getInitials(name: string): string {
    const cleaned = name.replace(/[^a-zA-Z0-9]/g, '');
    return cleaned.slice(0, 2).toUpperCase() || name.slice(0, 2).toUpperCase();
  }
}
