import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, inject, signal } from '@angular/core';

import { I18nService } from '../core/i18n.service';
import { scrollToId } from '../core/motion';
import { ScrollSpy } from '../core/scroll-spy.service';
import { IconComponent } from '../shared/icon.component';
import { LangToggleComponent } from '../shared/lang-toggle.component';
import { MagneticDirective } from '../shared/interaction.directives';

const LINKS = ['home', 'about', 'skills', 'services', 'projects', 'experience', 'contact'];

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, LangToggleComponent, MagneticDirective],
  template: `
    <header class="bar" [class.solid]="scrolled()">
      <nav class="pill glass" [attr.aria-label]="'Main'">
        <a class="logo" href="#home" (click)="go($event, 'home')" aria-label="Anuroopa PV">AP</a>
        <ul class="links">
          @for (id of links; track id) {
            <li><a [href]="'#' + id" [class.on]="spy.active() === id" [attr.aria-current]="spy.active() === id ? 'true' : null" (click)="go($event, id)">{{ i18n.t('nav.' + id) }}</a></li>
          }
        </ul>
        <app-lang-toggle />
        <a class="btn btn-primary talk" href="#contact" appMagnetic (click)="go($event, 'contact')">{{ i18n.t('nav.talk') }}</a>
        <button type="button" class="burger" (click)="toggle()" [attr.aria-expanded]="open()" aria-controls="mobile-menu" [attr.aria-label]="open() ? i18n.t('nav.close') : i18n.t('nav.menu')">
          <app-icon [name]="open() ? 'close' : 'menu'" />
        </button>
      </nav>
    </header>
    <div id="mobile-menu" class="sheet" [class.open]="open()" [attr.aria-hidden]="!open()" [attr.inert]="open() ? null : ''">
      <ul>
        @for (id of links; track id; let i = $index) {
          <li [style.--i]="i"><a [href]="'#' + id" (click)="go($event, id)">{{ i18n.t('nav.' + id) }}</a></li>
        }
      </ul>
      <app-lang-toggle />
    </div>
  `,
  styles: `
    .bar { position: fixed; inset: 14px 0 auto; z-index: 50; display: flex; justify-content: center; padding-inline: 14px; pointer-events: none; }
    .pill { pointer-events: auto; display: flex; align-items: center; gap: 14px; padding: 8px 10px 8px 14px; border-radius: 999px; transition: box-shadow .3s; max-width: 100%; }
    .solid .pill { box-shadow: var(--shadow); }
    .logo { font-family: var(--f-display); font-weight: 800; text-decoration: none; color: var(--ink); background: var(--turmeric); border-radius: 50%; width: 38px; height: 38px; display: grid; place-items: center; font-size: .8rem; }
    .links { display: flex; gap: 2px; }
    .links a { display: block; padding: 8px 12px; border-radius: 999px; text-decoration: none; color: var(--ink-2); font-weight: 700; font-size: .88rem; transition: background .2s, color .2s; }
    .links a:hover { background: var(--accent-soft); }
    .links a.on { background: var(--ink); color: #fff; }
    .talk { padding: 9px 18px; font-size: .88rem; }
    .burger { display: none; width: 42px; height: 42px; border-radius: 50%; border: 1px solid var(--accent-line); background: var(--glass-strong); cursor: pointer; place-items: center; }
    .sheet { position: fixed; inset: 0; z-index: 40; background: var(--paper); display: grid; align-content: center; justify-items: start; gap: 28px; padding: 90px 32px 40px; clip-path: circle(0 at calc(100% - 40px) 40px); transition: clip-path .55s cubic-bezier(.7,0,.2,1); visibility: hidden; }
    .sheet.open { clip-path: circle(150% at calc(100% - 40px) 40px); visibility: visible; }
    .sheet ul { display: grid; gap: 6px; }
    .sheet li { opacity: 0; transform: translateY(14px); transition: opacity .4s, transform .4s; }
    .sheet.open li { opacity: 1; transform: none; transition-delay: calc(.18s + var(--i) * 50ms); }
    .sheet a { font-family: var(--f-display); font-size: clamp(1.6rem, 7vw, 2.2rem); text-decoration: none; color: var(--ink); }
    @media (max-width: 1020px) { .links, .talk { display: none; } .burger { display: grid; } .pill { gap: 10px; } .bar { justify-content: space-between; } .bar .pill { width: 100%; justify-content: space-between; } .pill app-lang-toggle { margin-left: auto; } }
    @media (prefers-reduced-motion: reduce) { .sheet, .sheet li { transition: none; } }
  `,
})
export class NavbarComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly spy = inject(ScrollSpy);
  protected readonly links = LINKS;
  protected readonly open = signal(false);
  protected readonly scrolled = signal(false);

  constructor() {
    inject(DestroyRef).onDestroy(() => document.documentElement.classList.remove('menu-open'));
  }

  @HostListener('window:scroll') onScroll(): void {
    this.scrolled.set(window.scrollY > 20);
  }
  @HostListener('document:keydown.escape') onEsc(): void {
    if (this.open()) this.toggle();
  }

  toggle(): void {
    this.open.update((v) => !v);
    document.documentElement.classList.toggle('menu-open', this.open());
  }

  go(e: Event, id: string): void {
    e.preventDefault();
    if (this.open()) this.toggle();
    scrollToId(id);
  }
}
