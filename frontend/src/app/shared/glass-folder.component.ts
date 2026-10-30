import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  inject,
  signal,
} from '@angular/core';

import { I18nService } from '../core/i18n.service';
import { Project } from '../core/models';
import { ART_PRESETS, ArtPreset, renderArtToCanvas } from './folder-art';

const W = 340;
const H = 272;
const HEADROOM = 54;
const FRONT_H = H - 74;

const BACK_PATH =
  'M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z';
const FRONT_PATH =
  'M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 ' +
  (FRONT_H - 22) +
  'A22 22 0 0 1 318 ' +
  FRONT_H +
  'L22 ' +
  FRONT_H +
  'A22 22 0 0 1 0 ' +
  (FRONT_H - 22) +
  'Z';

export interface FolderSheet {
  id: string;
  name: string;
  meta: string;
  icon?: string;
}

@Component({
  selector: 'app-glass-folder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div
      #rootEl
      class="gf-root"
      [attr.data-tone]="tone"
      [attr.data-open]="open() ? 'true' : null"
      [attr.data-entered]="'true'"
      [style.width.px]="width"
      [style.height.px]="(H + HEADROOM) * scale"
    >
      <div
        class="gf-stage"
        [style.transform]="'translateY(' + HEADROOM * scale + 'px) scale(' + scale + ')'"
      >
        <div class="gf-tilt">
          <div class="gf-shadow" aria-hidden="true"></div>

          <!-- Back panel with domain-warped liquid canvas artwork -->
          <div
            class="gf-back"
            [style.clip-path]="'path(\\'' + BACK_PATH + '\\')'"
            aria-hidden="true"
          >
            <canvas
              #artCanvas
              class="gf-art"
              [style.width.px]="W + 24"
              [style.height.px]="H + 24"
            ></canvas>
            <div class="gf-back-sheen"></div>
          </div>
          <svg class="gf-rim gf-back-rim" viewBox="0 0 340 272" aria-hidden="true">
            <path [attr.d]="BACK_PATH" />
          </svg>

          <!-- Frosted front glass pocket, hinged on bottom edge -->
          <div
            class="gf-front"
            [style.clip-path]="'path(\\'' + FRONT_PATH + '\\')'"
          >
            <div class="gf-tint" aria-hidden="true"></div>
            <div class="gf-spec" aria-hidden="true"></div>
            <svg class="gf-rim gf-front-rim" viewBox="0 0 340 198" aria-hidden="true">
              <defs>
                <linearGradient [id]="'gf-rim-' + uid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#fff" stop-opacity="0.95" />
                  <stop offset="35%" stop-color="#fff" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="#fff" stop-opacity="0.12" />
                </linearGradient>
              </defs>
              <path [attr.d]="FRONT_PATH" [attr.stroke]="'url(#gf-rim-' + uid + ')'" />
            </svg>

            <!-- Click target to toggle open/closed -->
            <button
              type="button"
              class="gf-hit"
              [attr.aria-expanded]="open()"
              [attr.aria-label]="(open() ? 'Close ' : 'Open ') + i18n.tr(project.title)"
              (click)="toggleOpen()"
            ></button>

            <!-- Front Label & Category Info -->
            <div class="gf-label">
              <span class="gf-category-tag">
                <span class="status-dot" [attr.data-status]="project.status"></span>
                {{ i18n.t('status.' + project.status) }}
              </span>
              <h3 class="gf-title">{{ i18n.tr(project.title) }}</h3>
              <span class="gf-meta">{{ sheets.length }} project sheets</span>
            </div>
          </div>

          <!-- Interactive File Sheets in the Pocket -->
          <div class="gf-files" role="list">
            @for (sheet of sheets; track sheet.id; let idx = $index) {
              <div role="listitem" class="gf-sheet-slot">
                <button
                  type="button"
                  class="gf-sheet"
                  [style.--gf-slot]="computeFanSlot(idx, sheets.length)"
                  [style.--gf-depth]="sheets.length - 1 - idx"
                  [style.z-index]="idx + 1"
                  (click)="onSheetClick(sheet.id)"
                  [title]="'View ' + sheet.name"
                >
                  <span class="gf-sheet-head">
                    <span class="gf-sheet-name">{{ sheet.name }}</span>
                    <span class="gf-sheet-meta">{{ sheet.meta }}</span>
                  </span>

                  <!-- Visual Sheet Content -->
                  <div class="gf-sheet-body">
                    @if (sheet.id === 'overview') {
                      <p class="sheet-summary">{{ i18n.tr(project.summary) }}</p>
                    } @else if (sheet.id === 'stack') {
                      <div class="sheet-chips">
                        @for (tech of project.stack.slice(0, 4); track tech) {
                          <span class="sheet-chip">{{ tech }}</span>
                        }
                      </div>
                    } @else if (sheet.id === 'solution') {
                      <p class="sheet-summary">{{ i18n.tr(project.solution) }}</p>
                    } @else {
                      <div class="sheet-cta">
                        <span class="cta-badge">Click to view details →</span>
                      </div>
                    }
                  </div>

                  <!-- Sheet bottom tab indicator -->
                  <span class="gf-sheet-tab"></span>
                </button>
              </div>
            }
          </div>

          <!-- Bottom Action Button: Quick View / Open -->
          <button
            type="button"
            class="gf-key gf-key--more"
            [title]="open() ? 'Close folder' : 'Open folder & view sheets'"
            [attr.aria-expanded]="open()"
            (click)="toggleOpen()"
          >
            <svg class="gf-glyph gf-glyph--more" viewBox="0 0 30 12" aria-hidden="true">
              <rect x="1" y="1.5" width="8" height="9" rx="3.4" />
              <rect x="11" y="1.5" width="8" height="9" rx="3.4" />
              <rect x="21" y="1.5" width="8" height="9" rx="3.4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .gf-root {
      --gf-px: 0;
      --gf-py: 0;
      --gf-ease: cubic-bezier(.2, .8, .2, 1);
      --gf-spring: cubic-bezier(.34, 1.36, .5, 1);
      --gf-hinge: 0deg;
      --gf-lift: 38px;
      --gf-spread: 0px;
      --gf-fan: 0deg;
      --gf-stack: 14px;
      --gf-ink: #101a52;
      --gf-ink-soft: rgba(16, 26, 82, 0.6);
      position: relative;
      display: inline-block;
      vertical-align: top;
      font-family: var(--f-body);
      -webkit-font-smoothing: antialiased;
      isolation: isolate;
      user-select: none;
    }
    .gf-root[data-tone="dark"] {
      --gf-ink: #f5f8ff;
      --gf-ink-soft: rgba(245, 248, 255, 0.7);
    }
    .gf-root:hover,
    .gf-root:focus-within {
      --gf-hinge: -11deg;
      --gf-lift: -34px;
      --gf-spread: 12px;
      --gf-fan: 1.8deg;
      --gf-stack: 10px;
    }
    .gf-root[data-open] {
      --gf-hinge: -24deg;
      --gf-lift: -94px;
      --gf-spread: 38px;
      --gf-fan: 4.8deg;
      --gf-stack: 28px;
    }

    .gf-stage {
      position: absolute;
      left: 0;
      top: 0;
      width: 340px;
      height: 272px;
      transform-origin: 0 0;
    }
    .gf-tilt {
      position: absolute;
      inset: 0;
      transform: perspective(1400px) rotateX(calc(var(--gf-py) * -3deg)) rotateY(calc(var(--gf-px) * 4deg));
      transition: transform 0.8s var(--gf-ease);
    }

    .gf-shadow {
      position: absolute;
      left: 18px;
      right: 18px;
      bottom: -8px;
      height: 60px;
      border-radius: 40px;
      background: rgba(16, 26, 82, 0.32);
      filter: blur(20px);
      transform: translateX(calc(var(--gf-px) * -8px));
      transition: transform 0.8s var(--gf-ease);
    }

    .gf-back {
      position: absolute;
      inset: 0;
      overflow: hidden;
      background: linear-gradient(180deg, #f5f8ff 0%, #e8eeff 100%);
    }
    .gf-art {
      position: absolute;
      left: -12px;
      top: -12px;
      max-width: none;
      object-fit: cover;
      transform: translate(calc(var(--gf-px) * -6px), calc(var(--gf-py) * -5px));
      transition: transform 0.9s var(--gf-ease);
    }
    .gf-back-sheen {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 30%);
      pointer-events: none;
    }

    .gf-rim {
      position: absolute;
      left: 0;
      top: 0;
      max-width: none;
      pointer-events: none;
      fill: none;
    }
    .gf-back-rim { width: 340px; height: 272px; }
    .gf-back-rim path { stroke: rgba(255, 255, 255, 0.55); stroke-width: 1.2; }

    /* ---- Files / Sheets ---------------------------------------------------- */
    .gf-files {
      position: absolute;
      inset: 0;
      z-index: 5;
      pointer-events: none;
      clip-path: inset(-380px -380px 10px -380px);
    }
    .gf-sheet-slot { display: contents; }
    .gf-sheet {
      all: unset;
      box-sizing: border-box;
      position: absolute;
      left: 34px;
      top: 96px;
      width: 272px;
      height: 184px;
      border-radius: 18px;
      overflow: hidden;
      cursor: pointer;
      pointer-events: auto;
      background: linear-gradient(170deg, #ffffff 0%, rgba(245, 248, 255, 0.97) 100%);
      border: 1px solid rgba(38, 56, 201, 0.16);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.9),
        0 12px 28px -10px rgba(16, 26, 82, 0.22);
      transform-origin: 50% 100%;
      transform:
        translate(calc(var(--gf-slot) * var(--gf-spread)), calc(var(--gf-lift) + var(--gf-depth) * var(--gf-stack) * -1))
        rotate(calc(var(--gf-slot) * var(--gf-fan)));
      transition:
        transform 0.7s var(--gf-spring) calc(var(--gf-depth) * 35ms),
        box-shadow 0.35s var(--gf-ease);
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .gf-root[data-open] .gf-sheet:hover,
    .gf-root[data-open] .gf-sheet:focus-visible {
      transform:
        translate(calc(var(--gf-slot) * var(--gf-spread)), calc(var(--gf-lift) + var(--gf-depth) * var(--gf-stack) * -1 - 18px))
        rotate(calc(var(--gf-slot) * var(--gf-fan) * 0.7));
      box-shadow:
        inset 0 1px 0 #fff,
        0 20px 38px -10px rgba(38, 56, 201, 0.35);
      border-color: var(--accent);
    }

    .gf-sheet-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      border-bottom: 1px solid rgba(38, 56, 201, 0.1);
      padding-bottom: 6px;
    }
    .gf-sheet-name {
      font-family: var(--f-display);
      font-size: 13px;
      font-weight: 700;
      color: var(--ink);
    }
    .gf-sheet-meta {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--ink-3);
    }
    .gf-sheet-body {
      flex: 1;
      padding: 6px 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .sheet-summary {
      font-size: 11.5px;
      line-height: 1.45;
      color: var(--ink-2);
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .sheet-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .sheet-chip {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 999px;
      background: rgba(38, 56, 201, 0.08);
      color: var(--accent);
    }
    .sheet-cta {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cta-badge {
      font-size: 11px;
      font-weight: 800;
      color: var(--accent);
      background: var(--accent-soft);
      padding: 5px 12px;
      border-radius: 999px;
    }
    .gf-sheet-tab {
      display: block;
      height: 3px;
      width: 44px;
      border-radius: 2px;
      background: var(--accent-line);
      margin-top: 4px;
    }

    /* ---- Front Frosted Pocket ---------------------------------------------- */
    .gf-front {
      position: absolute;
      left: 0;
      top: 74px;
      width: 340px;
      height: 198px;
      z-index: 10;
      -webkit-backdrop-filter: blur(22px) saturate(1.5);
      backdrop-filter: blur(22px) saturate(1.5);
      transform-origin: 50% 100%;
      transform: perspective(760px) rotateX(var(--gf-hinge));
      transition: transform 0.75s var(--gf-spring);
    }
    .gf-tint {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.6) 42%, rgba(245, 248, 255, 0.94) 100%);
    }
    .gf-root[data-tone="dark"] .gf-tint {
      background: linear-gradient(180deg, rgba(16, 26, 82, 0.22) 0%, rgba(16, 26, 82, 0.72) 46%, rgba(16, 26, 82, 0.96) 100%);
    }
    .gf-spec {
      position: absolute;
      inset: 0;
      background: radial-gradient(260px 200px at calc(50% + var(--gf-px) * 46%) calc(30% + var(--gf-py) * 40%), rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0) 70%);
      mix-blend-mode: soft-light;
      pointer-events: none;
    }
    .gf-front-rim { width: 340px; height: 198px; }
    .gf-front-rim path { stroke-width: 2.2; }

    .gf-hit {
      all: unset;
      position: absolute;
      inset: 0;
      z-index: 1;
      cursor: pointer;
    }
    .gf-label {
      position: absolute;
      left: 24px;
      bottom: 24px;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 3px;
      max-width: 220px;
      pointer-events: none;
      color: var(--gf-ink);
    }
    .gf-category-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--accent);
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--turmeric);
    }
    .status-dot[data-status="in_progress"] { background: var(--ok); }
    .status-dot[data-status="internship"] { background: var(--signal); }

    .gf-title {
      font-family: var(--f-display);
      font-size: 17px;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.015em;
      margin: 0;
      color: var(--gf-ink);
    }
    .gf-meta {
      font-size: 11px;
      letter-spacing: 0.03em;
      color: var(--gf-ink-soft);
      font-weight: 600;
    }

    /* ---- Key Action Button ------------------------------------------------ */
    .gf-key {
      all: unset;
      box-sizing: border-box;
      position: absolute;
      right: 20px;
      bottom: 20px;
      z-index: 12;
      width: 52px;
      height: 52px;
      border-radius: 16px;
      display: grid;
      place-items: center;
      cursor: pointer;
      color: #111113;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(235, 240, 255, 0.85) 100%);
      border: 1px solid rgba(38, 56, 201, 0.2);
      box-shadow:
        inset 0 1px 0 #fff,
        0 10px 20px -8px rgba(16, 26, 82, 0.35);
      transition: transform 0.35s var(--gf-spring), box-shadow 0.35s var(--gf-ease);
    }
    .gf-key:hover {
      transform: translateY(-2px);
      border-color: var(--accent);
    }
    .gf-key:active { transform: translateY(0) scale(0.93); }
    .gf-glyph { display: block; fill: none; stroke: currentColor; stroke-linecap: round; }
    .gf-glyph--more { width: 28px; height: 11px; stroke-width: 1.8; }
  `,
})
export class GlassFolderComponent implements AfterViewInit, OnDestroy {
  protected readonly i18n = inject(I18nService);

  @Input({ required: true }) project!: Project;
  @Input() art: ArtPreset = 'aurora';
  @Input() seed = 3;
  @Input() tone: 'light' | 'dark' = 'light';
  @Input() width = 340;

  @Output() openDetails = new EventEmitter<Project>();

  @ViewChild('artCanvas') private artCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('rootEl') private rootEl?: ElementRef<HTMLDivElement>;

  readonly open = signal(false);
  readonly uid = Math.random().toString(36).substring(2, 9);

  readonly W = W;
  readonly H = H;
  readonly HEADROOM = HEADROOM;
  readonly FRONT_H = FRONT_H;
  readonly BACK_PATH = BACK_PATH;
  readonly FRONT_PATH = FRONT_PATH;

  get scale(): number {
    return this.width / W;
  }

  get sheets(): FolderSheet[] {
    return [
      { id: 'overview', name: 'Overview', meta: this.project.categories.join(' · ') },
      { id: 'stack', name: 'Tech Stack', meta: this.project.stack.length + ' technologies' },
      { id: 'solution', name: 'Architecture', meta: 'Solution details' },
      { id: 'features', name: 'Features & Demo', meta: this.project.features.length + ' features' },
    ];
  }

  private pointerCleanup?: () => void;

  ngAfterViewInit(): void {
    this.renderArt();
    this.setupParallax();
  }

  ngOnDestroy(): void {
    this.pointerCleanup?.();
  }

  private renderArt(): void {
    if (!this.artCanvas?.nativeElement) return;
    const recipe = ART_PRESETS[this.art] ?? ART_PRESETS.aurora;
    renderArtToCanvas(this.artCanvas.nativeElement, recipe, this.seed, W + 24, H + 24);
  }

  private setupParallax(): void {
    const el = this.rootEl?.nativeElement;
    if (!el) return;

    let raf = 0;
    let px = 0;
    let py = 0;

    const write = () => {
      raf = 0;
      el.style.setProperty('--gf-px', px.toFixed(3));
      el.style.setProperty('--gf-py', py.toFixed(3));
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const r = el.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width) * 2 - 1;
      py = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(write);
    };

    const leave = () => {
      px = 0;
      py = 0;
      if (!raf) raf = requestAnimationFrame(write);
    };

    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);

    this.pointerCleanup = () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      if (raf) cancelAnimationFrame(raf);
    };
  }

  toggleOpen(): void {
    this.open.update((v) => !v);
  }

  onSheetClick(sheetId: string): void {
    this.openDetails.emit(this.project);
  }

  computeFanSlot(index: number, count: number): number {
    return count <= 1 ? 0 : (index / (count - 1)) * 2 - 1;
  }
}
