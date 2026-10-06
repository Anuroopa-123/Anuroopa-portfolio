import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { I18nService } from '../core/i18n.service';
import { UiState } from '../core/ui-state.service';
import { SITE } from '../site.config';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective } from '../shared/interaction.directives';

const TYPES = ['fullstack', 'frontend', 'backend', 'database', 'ai', 'automation', 'job', 'other'];

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IconComponent, RevealDirective],
  template: `
    <section id="contact" class="section" aria-labelledby="contact-h">
      <div class="container grid">
        <div appReveal>
          <h2 id="contact-h">{{ i18n.t('contact.title') }}</h2>
          <p class="lede">{{ i18n.t('contact.body') }}</p>
          <ul class="ways">
            <li><a [href]="'mailto:' + site.email"><app-icon name="mail" [size]="20" /> {{ site.email }}</a></li>
            <li><a [href]="site.linkedin" target="_blank" rel="noopener noreferrer"><app-icon name="linkedin" [size]="20" /> {{ i18n.t('link.linkedin') }}</a></li>
            <li>
              @if (site.github) { <a [href]="site.github" target="_blank" rel="noopener noreferrer"><app-icon name="github" [size]="20" /> {{ i18n.t('link.github') }}</a> }
              @else { <span class="soon"><app-icon name="github" [size]="20" /> {{ i18n.t('link.github') }}: {{ i18n.t('link.soon') }}</span> }
            </li>
          </ul>
        </div>
        <div class="glass card" appReveal="100">
          @if (state() === 'ok') {
            <div class="done" role="status">
              <app-icon name="check" [size]="34" />
              <p>{{ i18n.t('form.ok') }}</p>
              <button type="button" class="btn" (click)="reset()">{{ i18n.t('form.another') }}</button>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
              <label>{{ i18n.t('form.name') }}
                <input formControlName="name" autocomplete="name" [attr.aria-invalid]="bad('name')" />
                @if (bad('name')) { <small class="err" role="alert">{{ i18n.t('err.name') }}</small> }
              </label>
              <label>{{ i18n.t('form.email') }}
                <input formControlName="email" type="email" autocomplete="email" [attr.aria-invalid]="bad('email')" />
                @if (bad('email')) { <small class="err" role="alert">{{ i18n.t('err.email') }}</small> }
              </label>
              <label>{{ i18n.t('form.type') }}
                <select formControlName="project_type">@for (t of types; track t) { <option [value]="t">{{ i18n.t('t.' + t) }}</option> }</select>
              </label>
              <label>{{ i18n.t('form.message') }}
                <textarea formControlName="message" rows="5" [placeholder]="i18n.t('form.placeholder')" [attr.aria-invalid]="bad('message')"></textarea>
                @if (bad('message')) { <small class="err" role="alert">{{ i18n.t('err.message') }}</small> }
              </label>
              <input class="hp" formControlName="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
              @if (error()) {
                <p class="err" role="alert">{{ i18n.t(error()!) }}
                  @if (error() === 'err.network') { <a [href]="'mailto:' + site.email">{{ i18n.t('form.mailInstead') }}</a> }
                </p>
              }
              <button class="btn btn-primary" type="submit" [disabled]="state() === 'sending'">
                {{ state() === 'sending' ? i18n.t('form.sending') : i18n.t('form.send') }} <span class="arr"><app-icon name="send" [size]="18" /></span>
              </button>
            </form>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: clamp(24px, 5vw, 64px); align-items: start; }
    h2 { font-family: var(--f-display); font-size: clamp(1.8rem, 4vw, 3rem); margin: 0 0 14px; line-height: 1.1; }
    .ways { display: grid; gap: 10px; margin-top: 22px; } .ways a, .soon { display: inline-flex; gap: 10px; align-items: center; font-weight: 700; color: var(--ink); text-decoration: none; } .ways a:hover { color: var(--accent); } .soon { color: var(--ink-3); }
    .card { padding: clamp(20px, 3vw, 34px); border-radius: var(--r-lg); }
    form { display: grid; gap: 14px; }
    label { display: grid; gap: 6px; font-weight: 800; font-size: .9rem; }
    input, select, textarea { font: inherit; font-weight: 500; padding: 12px 14px; border-radius: var(--r-sm); border: 1.5px solid var(--accent-line); background: #fff; color: var(--ink); }
    input[aria-invalid='true'], textarea[aria-invalid='true'] { border-color: var(--danger); }
    .err { color: var(--danger); font-weight: 700; font-size: .85rem; margin: 0; }
    .hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
    .btn { justify-self: start; }
    .done { display: grid; gap: 14px; justify-items: start; color: var(--ok); } .done p { margin: 0; color: var(--ink); font-weight: 700; }
    @media (max-width: 860px) { .grid { grid-template-columns: 1fr; } }
  `,
})
export class ContactSection {
  protected readonly i18n = inject(I18nService);
  private readonly http = inject(HttpClient);
  private readonly ui = inject(UiState);
  protected readonly site = SITE;
  protected readonly types = TYPES;
  protected readonly state = signal<'idle' | 'sending' | 'ok'>('idle');
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    project_type: ['fullstack'],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(4000)]],
    website: [''],
  });

  constructor() {
    effect(() => {
      const pick = this.ui.contactType();
      if (pick && TYPES.includes(pick.type)) this.form.controls.project_type.setValue(pick.type);
    });
  }

  protected bad(c: 'name' | 'email' | 'message'): boolean {
    const ctl = this.form.controls[c];
    return ctl.invalid && (ctl.touched || ctl.dirty);
  }

  submit(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.state.set('sending');
    this.http.post(`${SITE.apiBase}/contact`, this.form.getRawValue()).subscribe({
      next: () => {
        this.state.set('ok');
        this.form.reset({ project_type: 'fullstack' });
      },
      error: (e: { status?: number }) => {
        this.state.set('idle');
       const st = e.status ?? 0;
this.error.set(st === 429 ? 'err.rate' : st === 422 || st === 400 ? 'err.generic' : 'err.network');
      },
    });
  }

  reset(): void {
    this.state.set('idle');
  }
}
