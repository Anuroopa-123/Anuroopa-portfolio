import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

import { hasFinePointer, prefersReducedMotion } from '../core/motion';

/** Fades an element in once, when it first scrolls into view. Optional delay in ms: appReveal="120". */
@Directive({ selector: '[appReveal]', host: { class: 'rv', '[style.--d]': 'delay() + "ms"' } })
export class RevealDirective {
  readonly delay = input(0, { alias: 'appReveal', transform: (v: unknown) => Number(v) || 0 });
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
        this.el.classList.add('in');
        return;
      }
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.el.classList.add('in');
            io.disconnect();
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
      );
      io.observe(this.el);
      destroy.onDestroy(() => io.disconnect());
    });
  }
}

/** Slight 3D tilt toward the mouse, plus a light spot that follows it. Mouse only; touch and reduced motion skip it. */
@Directive({
  selector: '[appTilt]',
  host: { class: 'tilt', '(pointermove)': 'move($event)', '(pointerleave)': 'reset()' },
})
export class TiltDirective {
  /** Maximum angle in degrees: appTilt="5" */
  readonly max = input(5, { alias: 'appTilt', transform: (v: unknown) => Number(v) || 5 });
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly active = hasFinePointer() && !prefersReducedMotion();

  move(e: PointerEvent): void {
    if (!this.active || e.pointerType !== 'mouse') return;
    const r = this.el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const m = this.max();
    this.el.style.setProperty('--ry', `${((x - 0.5) * 2 * m).toFixed(2)}deg`);
    this.el.style.setProperty('--rx', `${(-(y - 0.5) * 2 * m).toFixed(2)}deg`);
    this.el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    this.el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
  }

  reset(): void {
    this.el.style.setProperty('--rx', '0deg');
    this.el.style.setProperty('--ry', '0deg');
  }
}

/** The element leans toward the pointer when it is close, like a magnet. */
@Directive({
  selector: '[appMagnetic]',
  host: { '(pointermove)': 'move($event)', '(pointerleave)': 'reset()' },
})
export class MagneticDirective {
  readonly strength = input(0.28, { alias: 'appMagnetic', transform: (v: unknown) => Number(v) || 0.28 });
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly active = hasFinePointer() && !prefersReducedMotion();

  move(e: PointerEvent): void {
    if (!this.active || e.pointerType !== 'mouse') return;
    const r = this.el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const s = this.strength();
    this.el.style.transform = `translate(${(dx * s).toFixed(1)}px, ${(dy * s).toFixed(1)}px)`;
  }

  reset(): void {
    this.el.style.transform = '';
  }
}
