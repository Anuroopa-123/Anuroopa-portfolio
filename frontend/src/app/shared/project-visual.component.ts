import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { I18nService } from '../core/i18n.service';

/** Simple vector mock-ups for each project. They are drawings, not screenshots, and are labelled that way. */
@Component({
  selector: 'app-project-visual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure>
      <svg viewBox="0 0 320 200" role="img" [attr.aria-label]="i18n.t('project.illustration')">
        <rect x="6" y="6" width="308" height="188" rx="16" fill="#f5f8ff" stroke="#2638c9" stroke-opacity=".25" stroke-width="2" />
        <rect x="6" y="6" width="308" height="30" rx="16" fill="#2638c9" fill-opacity=".1" />
        <circle cx="26" cy="21" r="4" fill="#e63946" /><circle cx="40" cy="21" r="4" fill="#ffbf1f" /><circle cx="54" cy="21" r="4" fill="#0a9a76" />
        @switch (kind()) {
          @case ('ai') {
            <rect x="24" y="52" width="170" height="26" rx="13" fill="#2638c9" fill-opacity=".14" />
            <rect x="126" y="86" width="170" height="26" rx="13" fill="#ffbf1f" />
            <rect x="24" y="120" width="200" height="26" rx="13" fill="#2638c9" fill-opacity=".14" />
            <rect x="24" y="156" width="272" height="22" rx="11" fill="#fff" stroke="#2638c9" stroke-opacity=".35" />
            <circle cx="278" cy="167" r="7" fill="#e63946" />
          }
          @case ('sync') {
            <rect x="24" y="56" width="90" height="110" rx="10" fill="#fff" stroke="#2638c9" stroke-opacity=".35" />
            <rect x="206" y="48" width="90" height="126" rx="14" fill="#fff" stroke="#2638c9" stroke-opacity=".5" stroke-width="2" />
            <path d="M118 100h84M118 120h84" stroke="#2638c9" stroke-width="2.5" stroke-dasharray="5 5" />
            <path d="M194 94l8 6-8 6M126 114l-8 6 8 6" fill="none" stroke="#e63946" stroke-width="2.5" />
            <rect x="34" y="68" width="70" height="8" rx="4" fill="#2638c9" fill-opacity=".3" /><rect x="34" y="86" width="50" height="8" rx="4" fill="#2638c9" fill-opacity=".2" />
            <rect x="216" y="68" width="70" height="8" rx="4" fill="#ffbf1f" /><rect x="216" y="86" width="50" height="8" rx="4" fill="#2638c9" fill-opacity=".2" />
          }
          @case ('learn') {
            <rect x="24" y="52" width="272" height="64" rx="12" fill="#2638c9" fill-opacity=".12" />
            <path d="M152 70l40 14-40 14-40-14z" fill="#ffbf1f" />
            <rect x="24" y="128" width="84" height="50" rx="10" fill="#fff" stroke="#2638c9" stroke-opacity=".3" />
            <rect x="118" y="128" width="84" height="50" rx="10" fill="#fff" stroke="#2638c9" stroke-opacity=".3" />
            <rect x="212" y="128" width="84" height="50" rx="10" fill="#fff" stroke="#2638c9" stroke-opacity=".3" />
            <rect x="32" y="162" width="50" height="6" rx="3" fill="#0a9a76" />
          }
          @case ('portal') {
            <rect x="24" y="50" width="62" height="128" rx="10" fill="#2638c9" fill-opacity=".14" />
            <rect x="98" y="50" width="198" height="30" rx="10" fill="#fff" stroke="#2638c9" stroke-opacity=".3" />
            @for (i of [0, 1, 2]; track i) {
              <rect x="98" [attr.y]="92 + i * 28" width="198" height="20" rx="6" fill="#fff" stroke="#2638c9" stroke-opacity=".2" />
              <circle [attr.cx]="110" [attr.cy]="102 + i * 28" r="5" [attr.fill]="i === 1 ? '#ffbf1f' : '#0a9a76'" />
            }
          }
          @default {
            <path d="M32 170V120M72 170V90M112 170V132M152 170V70M192 170V104" stroke="#2638c9" stroke-width="16" stroke-linecap="round" stroke-opacity=".5" />
            <path d="M32 120l40-30 40 42 40-62 40 34" fill="none" stroke="#e63946" stroke-width="3" />
            <rect x="236" y="60" width="60" height="110" rx="10" fill="#ffbf1f" fill-opacity=".55" />
          }
        }
      </svg>
      <figcaption>{{ i18n.t('project.illustration') }}</figcaption>
    </figure>
  `,
  styles: `
    figure { margin: 0; }
    svg { display: block; width: 100%; height: auto; }
    figcaption { margin-top: 6px; font-size: 0.74rem; color: var(--ink-3); }
  `,
})
export class ProjectVisualComponent {
  protected readonly i18n = inject(I18nService);
  readonly kind = input.required<string>();
}
