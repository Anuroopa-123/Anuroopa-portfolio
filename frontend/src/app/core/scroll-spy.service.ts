import { Injectable, signal } from '@angular/core';

/** Tells the navigation which section is on screen. Sections without a nav link highlight their closest parent. */
@Injectable({ providedIn: 'root' })
export class ScrollSpy {
  readonly active = signal('home');
  private observer?: IntersectionObserver;
  private readonly alias: Record<string, string> = { ai: 'projects', why: 'experience', process: 'experience' };

  observe(ids: string[]): void {
    this.observer?.disconnect();
    // A thin band across the middle of the screen: whichever section crosses it is "current".
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) this.active.set(this.alias[entry.target.id] ?? entry.target.id);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) this.observer.observe(el);
    }
  }
}
