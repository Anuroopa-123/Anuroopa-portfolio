import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ChatService } from '../core/chat.service';
import { I18nService } from '../core/i18n.service';
import { RevealDirective } from '../shared/interaction.directives';

@Component({
  selector: 'app-ai-bot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RevealDirective],
  template: `
    <section id="ask-ai" class="ai-bot-section" aria-labelledby="chat-h">
      <div class="container">
        <!-- Compact Section Header -->
        <header class="section-head" appReveal>
          <div class="ai-badge">
            <span class="sparkle">✦</span>
            <span>{{ i18n.t('chat.badge') }}</span>
          </div>
          <h2 id="chat-h" class="section-title">{{ i18n.t('chat.title') }}</h2>
          <p class="section-desc">{{ i18n.t('chat.sub') }}</p>
        </header>

        <!-- Compact AI Copilot Card -->
        <div class="copilot-card" appReveal>
          <!-- Top Control Header -->
          <div class="copilot-header">
            <div class="agent-profile">
              <div class="agent-avatar-wrap">
                <div class="avatar-gradient">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                  </svg>
                </div>
                <span class="online-status" [title]="i18n.t('chat.online')"></span>
              </div>
              <div class="agent-meta">
                <div class="agent-name-row">
                  <h3 class="agent-name">Anuroopa AI</h3>
                  <span class="live-pill">{{ i18n.t('chat.online') }}</span>
                </div>
                <span class="agent-subtitle">{{ i18n.t('chat.verified') }}</span>
              </div>
            </div>

            <div class="header-actions">
              <!-- Direct Resume Link -->
              <a
                href="/Anuroopa_PV_Resume.pdf"
                download
                class="icon-action-btn"
                title="Download Resume PDF"
                aria-label="Download Resume PDF"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path>
                </svg>
              </a>

              <!-- Clear Conversation -->
              <button
                type="button"
                class="icon-action-btn"
                (click)="chat.reset()"
                [title]="i18n.t('chat.clear')"
                [attr.aria-label]="i18n.t('chat.clear')"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Quick Action Prompt Grid (Shown when starting) -->
          @if (chat.messages().length <= 1) {
            <div class="quick-prompts-grid">
              @for (card of quickCards; track card.query) {
                <button
                  type="button"
                  class="prompt-card"
                  (click)="askSuggestion(card.query)"
                  [disabled]="chat.isLoading()"
                >
                  <div class="prompt-icon">
                    @if (card.icon === 'briefcase') {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                    } @else if (card.icon === 'rocket') {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                      </svg>
                    } @else if (card.icon === 'grad') {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                      </svg>
                    } @else {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                      </svg>
                    }
                  </div>
                  <div class="prompt-text">
                    <span class="prompt-title">{{ i18n.t(card.titleKey) }}</span>
                    <span class="prompt-sub">{{ i18n.t(card.subKey) }}</span>
                  </div>
                  <span class="prompt-arrow">→</span>
                </button>
              }
            </div>
          } @else {
            <!-- Compact Suggestion Rail when in active chat -->
            <div class="compact-rail">
              <span class="rail-tag">Suggestions:</span>
              <div class="rail-scroll">
                @for (q of chat.suggested(); track q) {
                  <button
                    type="button"
                    class="rail-pill"
                    (click)="askSuggestion(q)"
                    [disabled]="chat.isLoading()"
                  >
                    {{ q }}
                  </button>
                }
              </div>
            </div>
          }

          <!-- Messages Feed -->
          <div #scrollContainer class="chat-feed" [class.is-empty]="chat.messages().length <= 1">
            @for (msg of chat.messages(); track $index; let idx = $index) {
              <div class="feed-row" [class.is-user]="msg.role === 'user'">
                @if (msg.role === 'assistant') {
                  <div class="mini-bot-icon">✦</div>
                }
                <div class="msg-bubble" [class.is-user-bubble]="msg.role === 'user'">
                  <div class="msg-content" [innerHTML]="formatMarkdown(msg.content)"></div>

                  <!-- Quick Copy Button on Assistant Message -->
                  @if (msg.role === 'assistant' && msg.content.length > 20) {
                    <div class="msg-actions">
                      <button
                        type="button"
                        class="copy-btn"
                        (click)="copyMessage(msg.content, idx)"
                        [title]="i18n.t('chat.copy')"
                      >
                        @if (copiedIndex() === idx) {
                          <span class="copied-indicator">✓ {{ i18n.t('chat.copied') }}</span>
                        } @else {
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          <span>{{ i18n.t('chat.copy') }}</span>
                        }
                      </button>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Typing State -->
            @if (chat.isLoading()) {
              <div class="feed-row">
                <div class="mini-bot-icon">✦</div>
                <div class="msg-bubble typing-bubble">
                  <div class="typing-wave">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span class="typing-text">{{ i18n.t('chat.thinking') }}</span>
                </div>
              </div>
            }
          </div>

          <!-- Modern Bottom Spotlight Input -->
          <form class="input-bar" (ngSubmit)="onSubmit()">
            <div class="input-capsule">
              <span class="input-icon">✦</span>
              <input
                type="text"
                class="text-input"
                name="userQuery"
                [(ngModel)]="userQuery"
                [placeholder]="i18n.t('chat.placeholder')"
                [disabled]="chat.isLoading()"
                autocomplete="off"
              />
              <button
                type="submit"
                class="send-action-btn"
                [disabled]="!userQuery.trim() || chat.isLoading()"
                [attr.aria-label]="i18n.t('chat.send')"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
            <div class="input-meta">
              <span>Dynamic OpenAI engine</span>
              <span class="dot-sep">•</span>
              <span>Verified from Resume & Portfolio</span>
            </div>
          </form>
        </div>
      </div>

      <!-- Quick Jump Floating Button in Corner -->
      <div class="dock-launcher">
        <a
          href="#ask-ai"
          class="dock-btn"
          title="Ask Anuroopa's AI"
          aria-label="Ask Anuroopa's AI"
        >
          <span class="dock-sparkle">✦</span>
          <span>{{ i18n.t('chat.floatingToggle') }}</span>
        </a>
      </div>
    </section>
  `,
  styles: `
    .ai-bot-section {
      padding: clamp(50px, 7vw, 90px) 0;
      position: relative;
    }

    /* Section Head */
    .section-head {
      text-align: center;
      max-width: 660px;
      margin: 0 auto clamp(24px, 4vw, 36px);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .ai-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 5px 14px;
      border-radius: 999px;
      background: rgba(38, 56, 201, 0.08);
      border: 1px solid rgba(38, 56, 201, 0.22);
      color: var(--accent, #2638c9);
      font-weight: 800;
      font-size: 0.82rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .sparkle {
      color: #7e22ce;
      animation: pulseSparkle 2s infinite ease-in-out;
    }

    @keyframes pulseSparkle {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.3); opacity: 1; }
    }

    .section-title {
      font-family: var(--f-display);
      font-size: clamp(1.8rem, 3.8vw, 2.7rem);
      line-height: 1.18;
      margin: 0;
      color: var(--ink, #101a52);
    }

    .section-desc {
      color: var(--ink-2, #38437a);
      font-size: clamp(0.95rem, 1.6vw, 1.05rem);
      font-weight: 500;
      line-height: 1.5;
      margin: 0;
    }

    /* Main Copilot Card (Compact & Modern) */
    .copilot-card {
      max-width: 760px;
      margin: 0 auto;
      border-radius: 24px;
      background: linear-gradient(155deg, rgba(255, 255, 255, 0.98) 0%, rgba(246, 249, 255, 0.94) 100%);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(38, 56, 201, 0.16);
      box-shadow: 0 18px 45px -12px rgba(24, 36, 140, 0.14),
                  0 0 1px 1px rgba(255, 255, 255, 0.9) inset;
      padding: clamp(16px, 2.8vw, 24px);
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: box-shadow 0.3s ease;
    }

    /* Header Bar */
    .copilot-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(38, 56, 201, 0.1);
    }

    .agent-profile {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .agent-avatar-wrap {
      position: relative;
      width: 40px;
      height: 40px;
    }

    .avatar-gradient {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      background: linear-gradient(135deg, #2563eb, #7e22ce);
      color: #fff;
      display: grid;
      place-items: center;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
    }

    .online-status {
      position: absolute;
      bottom: -1px;
      right: -1px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #10b981;
      border: 2px solid #fff;
      box-shadow: 0 0 6px #10b981;
    }

    .agent-meta {
      display: flex;
      flex-direction: column;
    }

    .agent-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .agent-name {
      margin: 0;
      font-family: var(--f-display);
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--ink, #101a52);
    }

    .live-pill {
      font-size: 0.68rem;
      font-weight: 800;
      text-transform: uppercase;
      padding: 1px 7px;
      border-radius: 999px;
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }

    .agent-subtitle {
      font-size: 0.76rem;
      font-weight: 600;
      color: var(--ink-2, #38437a);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .icon-action-btn {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      border: 1px solid rgba(38, 56, 201, 0.14);
      background: #ffffff;
      color: var(--ink-2, #38437a);
      display: grid;
      place-items: center;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .icon-action-btn:hover {
      background: var(--royal, #1f2fb0);
      color: #ffffff;
      border-color: transparent;
      transform: translateY(-1px);
    }

    /* Quick Prompt Showcase (2x2 Grid) */
    .quick-prompts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin: 4px 0 8px;
    }

    .prompt-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      background: #ffffff;
      border: 1px solid rgba(38, 56, 201, 0.12);
      border-radius: 14px;
      text-align: left;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(24, 36, 140, 0.04);
      transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .prompt-card:hover:not(:disabled) {
      border-color: var(--accent, #2638c9);
      background: #f8faff;
      transform: translateY(-2px);
      box-shadow: 0 6px 14px rgba(38, 56, 201, 0.08);
    }

    .prompt-card:hover .prompt-arrow {
      transform: translateX(3px);
      color: var(--accent, #2638c9);
    }

    .prompt-icon {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: rgba(38, 56, 201, 0.08);
      color: var(--accent, #2638c9);
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }

    .prompt-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .prompt-title {
      font-size: 0.84rem;
      font-weight: 800;
      color: var(--ink, #101a52);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .prompt-sub {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--ink-2, #38437a);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .prompt-arrow {
      color: var(--ink-3, #566190);
      font-size: 0.95rem;
      font-weight: 700;
      transition: transform 0.2s ease, color 0.2s ease;
    }

    /* Compact Rail for Ongoing Chat */
    .compact-rail {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-bottom: 2px;
    }

    .rail-tag {
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--ink-3, #566190);
      white-space: nowrap;
    }

    .rail-scroll {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .rail-scroll::-webkit-scrollbar { display: none; }

    .rail-pill {
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--ink, #101a52);
      background: #ffffff;
      border: 1px solid rgba(38, 56, 201, 0.14);
      padding: 4px 12px;
      border-radius: 999px;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .rail-pill:hover:not(:disabled) {
      background: var(--royal, #1f2fb0);
      color: #ffffff;
      border-color: transparent;
      transform: translateY(-1px);
    }

    /* Message Feed */
    .chat-feed {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 180px;
      max-height: 380px;
      overflow-y: auto;
      padding: 4px 6px;
      scroll-behavior: smooth;
    }

    .chat-feed.is-empty {
      min-height: 100px;
    }

    .feed-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      max-width: 88%;
      animation: fadeInMsg 0.2s ease-out;
    }

    .feed-row.is-user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    @keyframes fadeInMsg {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .mini-bot-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #7e22ce);
      color: #fff;
      display: grid;
      place-items: center;
      font-size: 0.72rem;
      flex-shrink: 0;
      margin-top: 4px;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
    }

    .msg-bubble {
      background: #ffffff;
      border: 1px solid rgba(38, 56, 201, 0.12);
      border-radius: 16px;
      border-top-left-radius: 4px;
      padding: 10px 14px;
      box-shadow: 0 2px 6px rgba(24, 36, 140, 0.04);
      color: var(--ink, #101a52);
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .msg-bubble.is-user-bubble {
      background: linear-gradient(135deg, #1f2fb0, #141d86);
      color: #ffffff;
      border-color: #1f2fb0;
      border-top-left-radius: 16px;
      border-top-right-radius: 4px;
      box-shadow: 0 4px 12px rgba(31, 47, 176, 0.22);
    }

    .msg-content {
      word-break: break-word;
    }

    .msg-content ::ng-deep p { margin: 0 0 6px 0; }
    .msg-content ::ng-deep p:last-child { margin-bottom: 0; }
    .msg-content ::ng-deep strong { font-weight: 800; color: inherit; }
    .msg-content ::ng-deep ul { margin: 4px 0; padding-left: 18px; }
    .msg-content ::ng-deep li { margin-bottom: 3px; }
    .msg-content ::ng-deep a {
      color: var(--accent, #2638c9);
      font-weight: 700;
      text-decoration: underline;
    }
    .msg-bubble.is-user-bubble ::ng-deep a {
      color: #fef08a;
    }

    .msg-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 6px;
      padding-top: 4px;
      border-top: 1px solid rgba(38, 56, 201, 0.06);
    }

    .copy-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: transparent;
      border: none;
      color: var(--ink-3, #566190);
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .copy-btn:hover {
      color: var(--accent, #2638c9);
      background: rgba(38, 56, 201, 0.06);
    }

    .copied-indicator {
      color: #059669;
      font-weight: 800;
    }

    /* Typing Animation */
    .typing-bubble {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
    }

    .typing-wave {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .typing-wave span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--royal, #1f2fb0);
      animation: waveDots 1.4s infinite ease-in-out both;
    }

    .typing-wave span:nth-child(1) { animation-delay: -0.32s; }
    .typing-wave span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes waveDots {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
      40% { transform: scale(1.15); opacity: 1; }
    }

    .typing-text {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--ink-2, #38437a);
    }

    /* Bottom Spotlight Input */
    .input-bar {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 4px;
    }

    .input-capsule {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #ffffff;
      border: 1.5px solid rgba(38, 56, 201, 0.18);
      border-radius: 999px;
      padding: 4px 6px 4px 16px;
      box-shadow: 0 4px 12px rgba(24, 36, 140, 0.05);
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .input-capsule:focus-within {
      border-color: var(--royal, #1f2fb0);
      box-shadow: 0 0 0 3px rgba(31, 47, 176, 0.12);
    }

    .input-icon {
      color: #7e22ce;
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    .text-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 0.92rem;
      color: var(--ink, #101a52);
      outline: none;
      font-family: inherit;
      font-weight: 500;
    }

    .text-input::placeholder {
      color: var(--ink-3, #566190);
    }

    .send-action-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: var(--royal, #1f2fb0);
      color: #fff;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(31, 47, 176, 0.25);
    }

    .send-action-btn:hover:not(:disabled) {
      background: var(--accent, #2638c9);
      transform: scale(1.06);
    }

    .send-action-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      box-shadow: none;
    }

    .input-meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--ink-3, #566190);
    }

    .dot-sep {
      opacity: 0.5;
    }

    /* Floating Dock Launcher */
    .dock-launcher {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 90;
    }

    .dock-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 16px;
      border-radius: 999px;
      background: var(--royal, #1f2fb0);
      color: #ffffff;
      font-weight: 800;
      font-size: 0.84rem;
      text-decoration: none;
      box-shadow: 0 10px 24px -4px rgba(31, 47, 176, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.25);
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .dock-btn:hover {
      background: var(--accent, #2638c9);
      transform: translateY(-3px) scale(1.04);
      box-shadow: 0 14px 28px -4px rgba(31, 47, 176, 0.5);
    }

    .dock-sparkle {
      color: var(--turmeric, #ffbf1f);
      animation: pulseSparkle 2s infinite ease-in-out;
    }

    @media (max-width: 680px) {
      .quick-prompts-grid {
        grid-template-columns: 1fr;
      }
      .dock-launcher {
        bottom: 16px;
        right: 16px;
      }
    }
  `,
})
export class AiBotSection {
  protected readonly i18n = inject(I18nService);
  protected readonly chat = inject(ChatService);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

  userQuery = '';
  readonly copiedIndex = signal<number | null>(null);

  readonly quickCards = [
    {
      icon: 'briefcase',
      titleKey: 'chat.q_exp_t',
      subKey: 'chat.q_exp_s',
      query: 'What work experience does Anuroopa have?',
    },
    {
      icon: 'rocket',
      titleKey: 'chat.q_proj_t',
      subKey: 'chat.q_proj_s',
      query: 'What projects has she done?',
    },
    {
      icon: 'grad',
      titleKey: 'chat.q_edu_t',
      subKey: 'chat.q_edu_s',
      query: 'What is her educational background & CGPA?',
    },
    {
      icon: 'doc',
      titleKey: 'chat.q_res_t',
      subKey: 'chat.q_res_s',
      query: 'How can I download her resume?',
    },
  ];

  onSubmit(): void {
    const text = this.userQuery.trim();
    if (!text) return;
    this.userQuery = '';
    this.chat.send(text);
    this.scrollToBottom();
  }

  askSuggestion(q: string): void {
    this.chat.send(q);
    this.scrollToBottom();
  }

  copyMessage(text: string, index: number): void {
    if (navigator?.clipboard) {
      // Strip markdown asterisks and tags for clean copy text
      const clean = text.replace(/[*_#`]/g, '');
      navigator.clipboard.writeText(clean);
      this.copiedIndex.set(index);
      setTimeout(() => this.copiedIndex.set(null), 2000);
    }
  }

  formatMarkdown(text: string): string {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic *text*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Bullet points: • or -
    html = html.replace(/^[•\-]\s+(.*)$/gm, '<li>$1</li>');
    if (html.includes('<li>')) {
      html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    }
    // Newlines to <br> or <p>
    html = html.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>');
    return `<p>${html}</p>`;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer?.nativeElement) {
        this.scrollContainer.nativeElement.scrollTop =
          this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
