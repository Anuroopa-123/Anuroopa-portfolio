import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';

import { hasFinePointer, prefersReducedMotion } from '../core/motion';

/** A small glowing dot with a ring that trails it and grows over clickable things. Only for mouse users. */
@Component({
  selector: 'app-cursor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #ring class="ring"></div><div #dot class="dot"></div>`,
  styles: `
    :host { position: fixed; inset: 0; pointer-events: none; z-index: 200; }
    .dot, .ring { position: fixed; top: 0; left: 0; border-radius: 50%; opacity: 0; will-change: transform; transition: opacity 0.25s; }
    .dot { width: 8px; height: 8px; margin: -4px 0 0 -4px; background: var(--ink); box-shadow: 0 0 12px 3px rgba(255, 191, 31, 0.9); }
    .ring { width: 38px; height: 38px; margin: -19px 0 0 -19px; border: 1.5px solid var(--ink); transition: opacity 0.25s, width 0.25s, height 0.25s, margin 0.25s, background 0.25s, border-color 0.25s; }
    :host(.on) .dot, :host(.on) .ring { opacity: 1; }
    :host(.hover) .ring { width: 64px; height: 64px; margin: -32px 0 0 -32px; background: rgba(255, 191, 31, 0.25); border-color: var(--accent); }
    :host(.text) .dot { opacity: 0; }
    :host(.text) .ring { width: 3px; height: 28px; margin: -14px 0 0 -1px; border-radius: 3px; background: var(--ink); }
  `,
})
export class CursorComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly dot = viewChild.required<ElementRef<HTMLElement>>('dot');
  private readonly ring = viewChild.required<ElementRef<HTMLElement>>('ring');

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      if (!hasFinePointer()) return;
      const dot = this.dot().nativeElement;
      const ring = this.ring().nativeElement;
      const calm = prefersReducedMotion();
      let x = 0, y = 0, rx = 0, ry = 0, raf = 0, started = false;

      const loop = () => {
        // The ring eases toward the dot; with reduced motion it simply follows.
        rx += (x - rx) * (calm ? 1 : 0.18);
        ry += (y - ry) * (calm ? 1 : 0.18);
        dot.style.transform = `translate(${x}px, ${y}px)`;
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        raf = requestAnimationFrame(loop);
      };
      const move = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        x = e.clientX;
        y = e.clientY;
        if (!started) {
          started = true;
          rx = x;
          ry = y;
          document.documentElement.classList.add('has-cursor'); // hide the system cursor only once ours is running
          this.host.classList.add('on');
          raf = requestAnimationFrame(loop);
        }
      };
      const over = (e: PointerEvent) => {
        const t = e.target as Element | null;
        this.host.classList.toggle('hover', !!t?.closest('a, button, summary, select, label, [data-cursor]'));
        this.host.classList.toggle('text', !!t?.closest('input, textarea'));
      };
      const leave = () => this.host.classList.remove('on');
      const enter = () => started && this.host.classList.add('on');

      document.addEventListener('pointermove', move, { passive: true });
      document.addEventListener('pointerover', over, { passive: true });
      document.documentElement.addEventListener('mouseleave', leave);
      document.documentElement.addEventListener('mouseenter', enter);
      destroy.onDestroy(() => {
        cancelAnimationFrame(raf);
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerover', over);
        document.documentElement.removeEventListener('mouseleave', leave);
        document.documentElement.removeEventListener('mouseenter', enter);
        document.documentElement.classList.remove('has-cursor');
      });
    });
  }
}
