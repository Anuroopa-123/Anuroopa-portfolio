import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  signal,
} from '@angular/core';

export type CardVariant = 'pink' | 'yellow' | 'blue' | 'purple' | 'emerald' | 'cyan';

@Component({
  selector: 'app-animated-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div
      #cardEl
      class="anim-card"
      [attr.data-variant]="variant"
      [attr.data-slot]="deckSlot"
      [class.deck-mode]="isDeckMode"
      [class.is-active]="isActive"
      [style.transform]="computeCardTransform()"
      (mousemove)="onMouseMove($event)"
      (mouseleave)="onMouseLeave()"
      (click)="onClick()"
      (keydown.enter)="onClick()"
      (keydown.space)="onClick()"
      tabindex="0"
      role="button"
      [attr.aria-pressed]="isActive"
    >
      <!-- Top Colored Accent Border -->
      <div class="card-accent" aria-hidden="true"></div>

      <!-- Specular Cursor Glare -->
      <div
        class="card-glare"
        aria-hidden="true"
        [style.opacity]="glareOpacity()"
        [style.background]="glareStyle()"
      ></div>

      <!-- 3D Popout Content Surface -->
      <div class="card-surface">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      perspective: 1200px;
    }

    .anim-card {
      position: relative;
      width: 100%;
      border-radius: 24px;
      background: linear-gradient(155deg, rgba(255, 255, 255, 0.98) 0%, rgba(246, 249, 255, 0.94) 100%);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(38, 56, 201, 0.16);
      box-shadow: 0 18px 40px -12px rgba(24, 36, 140, 0.16),
                  0 0 1px 1px rgba(255, 255, 255, 0.9) inset;
      cursor: pointer;
      overflow: hidden;
      transform-style: preserve-3d;
      transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1),
                  box-shadow 0.35s ease,
                  border-color 0.35s ease,
                  opacity 0.35s ease;
      will-change: transform;
      outline: none;
    }

    .anim-card:focus-visible {
      outline: 2px solid var(--turmeric, #ffbf1f);
      outline-offset: 4px;
    }

    /* Top Accent Line */
    .card-accent {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      z-index: 5;
    }

    [data-variant="blue"] .card-accent {
      background: linear-gradient(90deg, #0284c7, #2563eb);
    }
    [data-variant="purple"] .card-accent {
      background: linear-gradient(90deg, #9333ea, #7e22ce);
    }
    [data-variant="pink"] .card-accent {
      background: linear-gradient(90deg, #ec4899, #db2777);
    }
    [data-variant="yellow"] .card-accent {
      background: linear-gradient(90deg, #eab308, #ca8a04);
    }
    [data-variant="emerald"] .card-accent {
      background: linear-gradient(90deg, #10b981, #059669);
    }
    [data-variant="cyan"] .card-accent {
      background: linear-gradient(90deg, #06b6d4, #0284c7);
    }

    /* Specular dynamic glare overlay */
    .card-glare {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 4;
      border-radius: inherit;
      transition: opacity 0.25s ease;
    }

    /* Inner 3D Content Container */
    .card-surface {
      position: relative;
      z-index: 3;
      padding: clamp(22px, 4vw, 30px);
      transform: translateZ(26px);
      transform-style: preserve-3d;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    /* Deck Mode Transformations */
    .anim-card.deck-mode {
      position: absolute;
      top: 0;
      left: 50%;
      width: clamp(310px, 86vw, 420px);
      margin-left: calc(clamp(310px, 86vw, 420px) / -2);
    }

    /* Slot positions for Deck view */
    .anim-card.deck-mode[data-slot="center"] {
      z-index: 25;
      border-color: rgba(38, 56, 201, 0.32);
      box-shadow: 0 28px 65px -15px rgba(24, 36, 140, 0.28),
                  0 0 25px rgba(38, 56, 201, 0.12);
    }

    .anim-card.deck-mode[data-slot="left"] {
      z-index: 10;
      opacity: 0.94;
      box-shadow: 0 16px 36px -12px rgba(24, 36, 140, 0.14);
    }

    .anim-card.deck-mode[data-slot="right"] {
      z-index: 15;
      opacity: 0.94;
      box-shadow: 0 16px 36px -12px rgba(24, 36, 140, 0.14);
    }

    .anim-card:hover {
      box-shadow: 0 30px 65px -15px rgba(24, 36, 140, 0.26),
                  0 0 1px 1px rgba(255, 255, 255, 1) inset;
      border-color: rgba(38, 56, 201, 0.3);
    }

    @media (prefers-reduced-motion: reduce) {
      .anim-card {
        transition: none !important;
        transform: none !important;
      }
      .card-surface {
        transform: none !important;
      }
    }
  `,
})
export class AnimatedCardComponent {
  @Input() variant: CardVariant = 'purple';
  @Input() isDeckMode = false;
  @Input() deckSlot: 'left' | 'center' | 'right' | 'none' = 'none';
  @Input() isActive = false;

  @Output() cardClick = new EventEmitter<void>();

  @ViewChild('cardEl') cardRef?: ElementRef<HTMLDivElement>;

  protected readonly rotateX = signal(0);
  protected readonly rotateY = signal(0);
  protected readonly glareOpacity = signal(0);
  protected readonly glareStyle = signal('none');

  onMouseMove(e: MouseEvent): void {
    if (!this.cardRef) return;
    const rect = this.cardRef.nativeElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    // Transform mouse coordinate into 3D spring tilt (-10 to 10 deg)
    const rX = -(mouseY / (rect.height / 2)) * 10;
    const rY = (mouseX / (rect.width / 2)) * 10;

    this.rotateX.set(Math.max(-12, Math.min(12, rX)));
    this.rotateY.set(Math.max(-12, Math.min(12, rY)));

    const glareX = e.clientX - rect.left;
    const glareY = e.clientY - rect.top;
    this.glareOpacity.set(0.18);
    this.glareStyle.set(
      `radial-gradient(circle 240px at ${glareX}px ${glareY}px, rgba(255,255,255,0.4), transparent 80%)`
    );
  }

  onMouseLeave(): void {
    this.rotateX.set(0);
    this.rotateY.set(0);
    this.glareOpacity.set(0);
  }

  onClick(): void {
    this.cardClick.emit();
  }

  computeCardTransform(): string {
    const rx = this.rotateX();
    const ry = this.rotateY();

    if (!this.isDeckMode) {
      return `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    }

    // Deck mode transformations
    if (this.deckSlot === 'left') {
      return `translateX(-34%) translateY(16px) rotate(-8deg) rotateX(${rx * 0.6}deg) rotateY(${ry * 0.6}deg) scale(0.92)`;
    }
    if (this.deckSlot === 'right') {
      return `translateX(34%) translateY(16px) rotate(8deg) rotateX(${rx * 0.6}deg) rotateY(${ry * 0.6}deg) scale(0.92)`;
    }
    // Center card
    return `translateX(0%) translateY(-10px) rotate(0deg) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
  }
}
