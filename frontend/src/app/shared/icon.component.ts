import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Stroke icons drawn on a 24x24 grid. One component, so every icon shares size, weight and colour (currentColor). */
const PATHS: Record<string, string[]> = {
  layers: ['M12 3 3 8l9 5 9-5-9-5Z', 'M3 13l9 5 9-5', 'M3 17.5l9 5 9-5'],
  window: ['M3 5h18v14H3Z', 'M3 9h18', 'M6.5 7h.01', 'M9.5 7h.01'],
  plug: ['M9 3v5', 'M15 3v5', 'M6 8h12v3a6 6 0 0 1-12 0V8Z', 'M12 17v4'],
  database: ['M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z', 'M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6', 'M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3'],
  spark: ['M12 3v4', 'M12 17v4', 'M3 12h4', 'M17 12h4', 'M6 6l2.5 2.5', 'M15.5 15.5 18 18', 'M18 6l-2.5 2.5', 'M8.5 15.5 6 18', 'M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z'],
  loop: ['M17 3l4 4-4 4', 'M3 11V9a2 2 0 0 1 2-2h16', 'M7 21l-4-4 4-4', 'M21 13v2a2 2 0 0 1-2 2H3'],
  arrow: ['M4 12h15', 'M13 6l6 6-6 6'],
  download: ['M12 4v11', 'M7 11l5 5 5-5', 'M5 20h14'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  mail: ['M3 6h18v12H3Z', 'M3 7l9 6.5L21 7'],
  linkedin: ['M6 9.5V19', 'M6 5.2v.01', 'M10.5 9.5V19', 'M10.5 13a3 3 0 0 1 6 0v6'],
  github: ['M9 19c-4.3 1.4-4.3-2.5-6-3', 'M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  send: ['M21 3 3 10.5l7 3 3 7L21 3Z', 'M10 13.5 21 3'],
  alert: ['M12 8v5', 'M12 16.5v.01', 'M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z'],
  chevron: ['M6 9l6 6 6-6'],
  up: ['M12 19V5', 'M6 11l6-6 6 6'],
};

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      @for (d of paths(); track $index) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
  styles: [':host{display:inline-flex;line-height:0}'],
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly size = input(22);
  protected readonly paths = computed(() => PATHS[this.name()] ?? []);
}
