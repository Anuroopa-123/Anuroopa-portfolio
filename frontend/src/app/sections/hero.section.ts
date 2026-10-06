import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, effect, inject, signal, viewChild } from '@angular/core';

import { I18nService } from '../core/i18n.service';
import { prefersReducedMotion, scrollToId } from '../core/motion';
import { UiState } from '../core/ui-state.service';
import { SITE } from '../site.config';
import type { HeroScene } from '../three/hero-scene';
import { IconComponent } from '../shared/icon.component';
import { MagneticDirective } from '../shared/interaction.directives';

const STAGES = ['code', 'data', 'ai', 'product'];

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, MagneticDirective],
  template: `
    <section id="home" class="hero" aria-labelledby="hero-h">
      <canvas #cv class="scene" role="img" [attr.aria-label]="i18n.t('hero.scene.alt')"></canvas>
      @if (noWebgl()) {
        <div class="fallback" aria-hidden="true"><span>CODE</span><span>DATA</span><span>AI</span><span>PRODUCT</span></div>
      }
      <div class="container copy">
        <p class="chip">{{ i18n.t('hero.role') }}</p>
        <h1 id="hero-h">
          @for (w of words(); track $index) {
            <span class="w"><span class="wi" [style.--i]="$index">{{ w }}&nbsp;</span></span>
          }
        </h1>
        <p class="name">ANUROOPA PV</p>
        <p class="lede">{{ i18n.t('hero.sub') }}</p>
        <div class="cta">
          <a class="btn btn-primary" href="#projects" appMagnetic (click)="go($event, 'projects')">{{ i18n.t('hero.cta.work') }} <span class="arr"><app-icon name="arrow" [size]="18" /></span></a>
          <a class="btn" href="#contact" appMagnetic (click)="ui.goToContact(); $event.preventDefault()">{{ i18n.t('hero.cta.together') }}</a>
          <a class="btn" [href]="site.resumeFile" download appMagnetic><app-icon name="download" [size]="18" /> {{ i18n.t('hero.cta.resume') }}</a>
        </div>
        <div class="legend" role="group" [attr.aria-label]="i18n.t('hero.flow')">
          @for (s of stages; track s; let i = $index) {
            <button type="button" class="chip stage" [class.on]="stage() === i" [attr.aria-pressed]="stage() === i" (click)="pick(i)">{{ i18n.t('legend.' + s) }}</button>
            @if (i < 3) { <span class="sep" aria-hidden="true">›</span> }
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .hero { position: relative; min-height: 100svh; display: flex; align-items: center; padding: calc(var(--nav-h) + 20px) 0 60px; overflow: clip; }
    .scene { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
    .copy { position: relative; z-index: 2; display: grid; gap: 18px; justify-items: start; pointer-events: none; }
    .copy > * { pointer-events: auto; }
    h1 { margin: 0; font-family: var(--f-display); font-weight: 800; font-size: clamp(2.1rem, 5.6vw, 4.6rem); line-height: 1.06; letter-spacing: -.02em; max-width: 12ch; }
    .w { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: .12em; }
    .wi { display: inline-block; animation: rise .8s cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(.1s + var(--i) * 90ms); }
    @keyframes rise { from { transform: translateY(110%); } to { transform: none; } }
    .name { margin: 0; font-family: var(--f-display); letter-spacing: .12em; color: var(--accent); font-weight: 700; }
    .lede { margin: 0; max-width: 46ch; }
    .cta, .legend { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
    .stage { cursor: pointer; border: 1px solid var(--accent-line); font-weight: 800; transition: background .25s, color .25s; }
    .stage.on { background: var(--ink); color: #fff; }
    .sep { color: var(--ink-3); }
    .fallback { position: absolute; right: 6%; top: 50%; transform: translateY(-50%); display: grid; gap: 10px; font-family: var(--f-display); color: var(--accent); opacity: .5; }
    @media (max-width: 759px) { .hero { align-items: flex-end; padding-top: 52vh; } .scene { height: 60%; } .copy { padding-top: 12px; } }
    @media (prefers-reduced-motion: reduce) { .wi { animation: none; } }
  `,
})
export class HeroSection {
  protected readonly i18n = inject(I18nService);
  protected readonly ui = inject(UiState);
  protected readonly site = SITE;
  protected readonly stages = STAGES;
  protected readonly stage = signal(0);
  protected readonly noWebgl = signal(false);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');
  private scene: HeroScene | null = null;

  protected words = () => this.i18n.t('hero.headline').split(' ');

  constructor() {
    const destroy = inject(DestroyRef);
    const labels = () => STAGES.map((s) => this.i18n.t('legend.' + s));
    afterNextRender(async () => {
      const { createHeroScene } = await import('../three/hero-scene');
      this.scene = await createHeroScene(this.canvas().nativeElement, {
        reduced: prefersReducedMotion(),
        labels: labels(),
        onStage: (i) => this.stage.set(i),
      });
      if (!this.scene) this.noWebgl.set(true);
    });
    effect(() => {
      const l = labels(); // re-read on language change
      this.scene?.setLabels(l);
    });
    destroy.onDestroy(() => this.scene?.dispose());
  }

  pick(i: number): void {
    this.scene?.focus(i);
    this.stage.set(i);
  }
  go(e: Event, id: string): void {
    e.preventDefault();
    scrollToId(id);
  }
}
