import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { I18nService } from '../core/i18n.service';

/** Sample-data demo: edit on the phone, go offline, go online, watch the change reach the server and admin. */
@Component({
  selector: 'app-sync-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo glass">
      <h3>{{ i18n.t('sync.title') }}</h3>
      <p class="sub">{{ i18n.t('sync.sub') }}</p>
      <div class="row">
        <div class="node" [class.new]="admin() !== 'v1'">
          <b>{{ i18n.t('sync.admin') }}</b><span>{{ i18n.t('sync.record') }}: {{ admin() }}</span>
        </div>
        <span class="link" [class.on]="online() && pending() === false" aria-hidden="true"></span>
        <div class="node" [class.new]="server() !== 'v1'">
          <b>{{ i18n.t('sync.server') }}</b><span>{{ i18n.t('sync.record') }}: {{ server() }}</span>
        </div>
        <span class="link" [class.on]="online()" aria-hidden="true"></span>
        <div class="node phone" [class.off]="!online()">
          <b>{{ i18n.t('sync.mobile') }}</b>
          <span>{{ i18n.t('sync.record') }}: {{ mobile() }}</span>
          @if (pending()) { <em>{{ i18n.t('sync.pending') }}</em> }
        </div>
      </div>
      <div class="actions">
        <button type="button" class="btn" (click)="edit()">{{ i18n.t('sync.edit') }}</button>
        <button type="button" class="btn" (click)="toggle()" [attr.aria-pressed]="!online()">
          {{ online() ? i18n.t('sync.offline') : i18n.t('sync.online') }}
        </button>
      </div>
      <p class="state" aria-live="polite">{{ online() ? i18n.t('sync.stateOnline') : i18n.t('sync.stateOffline') }}</p>
    </div>
  `,
  styles: `
    .demo { padding: clamp(18px, 3vw, 30px); border-radius: var(--r-lg); display: grid; gap: 14px; }
    h3 { margin: 0; font-family: var(--f-display); font-size: 1.15rem; }
    .sub { margin: 0; color: var(--ink-2); max-width: 64ch; }
    .row { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 10px; align-items: center; }
    .node { background: var(--paper); border: 1.5px solid var(--accent-line); border-radius: var(--r-md); padding: 14px; display: grid; gap: 4px; transition: border-color .3s, background .3s; }
    .node b { font-size: 0.86rem; } .node span { font-family: var(--f-code); font-size: 0.82rem; color: var(--ink-2); }
    .node em { font-style: normal; font-size: 0.78rem; font-weight: 800; color: var(--danger); }
    .node.new { border-color: var(--turmeric); background: #fff7dc; }
    .node.off { border-style: dashed; }
    .link { width: 36px; height: 3px; border-radius: 3px; background: repeating-linear-gradient(90deg, var(--accent-line) 0 6px, transparent 6px 10px); }
    .link.on { background: linear-gradient(90deg, var(--accent), var(--turmeric)); }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .state { margin: 0; font-weight: 700; font-size: 0.9rem; color: var(--ink-2); }
    @media (max-width: 760px) { .row { grid-template-columns: 1fr; } .link { width: 3px; height: 22px; margin-inline: auto; } }
  `,
})
export class SyncDemoComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly online = signal(true);
  protected readonly mobile = signal('v1');
  protected readonly server = signal('v1');
  protected readonly admin = signal('v1');
  protected readonly pending = signal(false);
  private n = 1;

  edit(): void {
    this.mobile.set(`v${++this.n}`);
    if (this.online()) this.push();
    else this.pending.set(true);
  }
  toggle(): void {
    this.online.update((v) => !v);
    if (this.online() && this.pending()) this.push();
  }
  private push(): void {
    this.pending.set(false);
    setTimeout(() => this.server.set(this.mobile()), 350);
    setTimeout(() => this.admin.set(this.mobile()), 800);
  }
}
