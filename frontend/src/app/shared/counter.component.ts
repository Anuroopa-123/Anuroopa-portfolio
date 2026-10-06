import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, input, signal } from '@angular/core';

import { prefersReducedMotion } from '../core/motion';

/** A number that counts up once, the first time it is visible. */
@Component({
  selector: 'app-counter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `{{ shown() }}{{ suffix() }}`,
})
export class CounterComponent {
  readonly to = input.required<number>();
  readonly decimals = input(0);
  readonly suffix = input('');

  private readonly value = signal(0);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly shown = () => this.value().toFixed(this.decimals());

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
        this.value.set(this.to());
        return;
      }
      let raf = 0;
      const io = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const duration = 1400;
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          this.value.set(this.to() * (1 - Math.pow(1 - p, 3))); // ease-out
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      });
      io.observe(this.host);
      destroy.onDestroy(() => {
        io.disconnect();
        cancelAnimationFrame(raf);
      });
    });
  }
}
