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
    <section id="ask-ai" class="section" aria-labelledby="chat-h">
      <div class="container">
        <div class="section-head" appReveal>
          <div class="ai-badge">
            <span class="sparkle">✦</span>
            {{ i18n.t('chat.badge') }}
          </div>
          <h2 id="chat-h">{{ i18n.t('chat.title') }}</h2>
          <p class="lede">{{ i18n.t('chat.sub') }}</p>
        </div>

        <div class="chat-card glass" appReveal>
          <!-- Chat Header Bar -->
          <div class="chat-header">
            <div class="agent-info">
              <div class="avatar-ring">
                <span class="avatar-emoji">🤖</span>
                <span class="status-indicator"></span>
              </div>
              <div>
                <h3 class="agent-name">Anuroopa's Portfolio AI</h3>
                <span class="agent-tag">Dynamic OpenAI Engine • Portfolio Knowledge</span>
              </div>
            </div>

            <button
              type="button"
              class="clear-btn"
              (click)="chat.reset()"
              [title]="i18n.t('chat.clear')"
              aria-label="Clear chat"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              {{ i18n.t('chat.clear') }}
            </button>
          </div>

          <!-- Quick Suggestion Chips -->
          <div class="suggestions-rail">
            <span class="rail-label">Try asking:</span>
            <div class="rail-chips">
              @for (q of chat.suggested(); track q) {
                <button
                  type="button"
                  class="chip suggestion-chip"
                  (click)="askSuggestion(q)"
                  [disabled]="chat.isLoading()"
                >
                  {{ q }}
                </button>
              }
            </div>
          </div>

          <!-- Messages Stream -->
          <div #scrollContainer class="messages-stream">
            @for (msg of chat.messages(); track $index) {
              <div class="message-row" [class.user-row]="msg.role === 'user'">
                @if (msg.role === 'assistant') {
                  <div class="bubble-avatar">🤖</div>
                }
                <div class="bubble" [class.user-bubble]="msg.role === 'user'">
                  <div class="bubble-content" [innerHTML]="formatMarkdown(msg.content)"></div>
                </div>
                @if (msg.role === 'user') {
                  <div class="bubble-avatar user">👤</div>
                }
              </div>
            }

            @if (chat.isLoading()) {
              <div class="message-row">
                <div class="bubble-avatar">🤖</div>
                <div class="bubble typing-bubble">
                  <span class="dot-typing"></span>
                  <span class="dot-typing"></span>
                  <span class="dot-typing"></span>
                  <span class="sr-only">{{ i18n.t('chat.thinking') }}</span>
                </div>
              </div>
            }
          </div>

          <!-- Input Controls -->
          <form class="input-form" (ngSubmit)="onSubmit()">
            <div class="input-wrap">
              <input
                type="text"
                class="chat-input"
                name="userQuery"
                [(ngModel)]="userQuery"
                [placeholder]="i18n.t('chat.placeholder')"
                [disabled]="chat.isLoading()"
                autocomplete="off"
              />
              <button
                type="submit"
                class="send-btn"
                [disabled]="!userQuery.trim() || chat.isLoading()"
                [attr.aria-label]="i18n.t('chat.send')"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
            <p class="chat-footnote">
              Connected dynamically to OpenAI. Answers are generated from Anuroopa's verified projects and skills.
            </p>
          </form>
        </div>
      </div>

      <!-- Floating Launcher Button for Quick Access from anywhere on page -->
      <div class="floating-widget">
        <a
          href="#ask-ai"
          class="floating-launcher"
          title="Ask Anuroopa's AI"
          aria-label="Scroll to AI assistant"
        >
          <span class="launcher-sparkle">✦</span>
          <span class="launcher-text">{{ i18n.t('chat.floatingToggle') }}</span>
        </a>
      </div>
    </section>
  `,
  styles: `
    h2 {
      font-family: var(--f-display);
      font-size: clamp(1.8rem, 4vw, 3rem);
      margin: 0;
      line-height: 1.1;
    }
    .ai-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: 999px;
      background: linear-gradient(135deg, rgba(153, 103, 255, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%);
      border: 1px solid rgba(153, 103, 255, 0.4);
      color: var(--ink);
      font-weight: 800;
      font-size: 0.8rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .sparkle {
      color: #9333ea;
      animation: pulseSparkle 2s infinite ease-in-out;
    }
    @keyframes pulseSparkle {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.25); opacity: 1; }
    }

    .chat-card {
      border-radius: var(--r-lg);
      padding: clamp(16px, 2.5vw, 28px);
      box-shadow: 0 16px 36px -12px rgba(27, 26, 23, 0.1);
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 900px;
      margin: 0 auto;
    }

    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--accent-line);
      padding-bottom: 14px;
    }
    .agent-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar-ring {
      position: relative;
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: #fff;
      border: 1.5px solid var(--accent-line);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    }
    .status-indicator {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: #10b981;
      border: 2px solid #fff;
    }
    .agent-name {
      margin: 0;
      font-family: var(--f-display);
      font-size: 1.15rem;
      color: var(--ink);
    }
    .agent-tag {
      font-size: 0.75rem;
      color: var(--ink-3);
      font-weight: 600;
    }

    .clear-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--ink-3);
      background: transparent;
      border: 1px solid var(--accent-line);
      padding: 6px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .clear-btn:hover {
      color: var(--accent);
      border-color: var(--accent);
      background: #fff;
    }

    .suggestions-rail {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .rail-label {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--ink-3);
      text-transform: uppercase;
      white-space: nowrap;
    }
    .rail-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .suggestion-chip {
      cursor: pointer;
      background: #fff;
      border: 1px solid var(--accent-line);
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--ink);
      padding: 6px 14px;
      border-radius: 999px;
      white-space: nowrap;
      transition: all 0.2s ease;
    }
    .suggestion-chip:hover:not(:disabled) {
      border-color: var(--accent);
      color: var(--accent);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    }

    .messages-stream {
      display: flex;
      flex-direction: column;
      gap: 14px;
      min-height: 280px;
      max-height: 480px;
      overflow-y: auto;
      padding: 12px 6px;
      scroll-behavior: smooth;
    }
    .message-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      max-width: 85%;
      animation: fadeInRow 0.25s ease-out;
    }
    .message-row.user-row {
      align-self: flex-end;
      flex-direction: row;
      justify-content: flex-end;
    }
    @keyframes fadeInRow {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .bubble-avatar {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: #fff;
      border: 1px solid var(--accent-line);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      flex-shrink: 0;
    }
    .bubble-avatar.user {
      background: var(--ink);
      color: #fff;
      border-color: var(--ink);
    }

    .bubble {
      background: #ffffff;
      border: 1.5px solid var(--accent-line);
      border-radius: 16px;
      border-top-left-radius: 4px;
      padding: 14px 18px;
      box-shadow: 0 4px 12px rgba(27, 26, 23, 0.04);
      color: var(--ink);
      font-size: 0.92rem;
      line-height: 1.55;
    }
    .bubble.user-bubble {
      background: var(--ink);
      color: #ffffff;
      border-color: var(--ink);
      border-top-left-radius: 16px;
      border-top-right-radius: 4px;
    }
    .bubble-content {
      word-break: break-word;
    }
    .bubble-content ::ng-deep p { margin: 0 0 8px 0; }
    .bubble-content ::ng-deep p:last-child { margin-bottom: 0; }
    .bubble-content ::ng-deep strong { font-weight: 800; color: inherit; }
    .bubble-content ::ng-deep ul { margin: 6px 0; padding-left: 18px; }
    .bubble-content ::ng-deep li { margin-bottom: 4px; }
    .bubble-content ::ng-deep a { color: var(--accent); text-decoration: underline; }
    .bubble.user-bubble ::ng-deep a { color: #fef08a; }

    .typing-bubble {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 14px 20px;
    }
    .dot-typing {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--ink-3);
      animation: blinkDots 1.4s infinite both;
    }
    .dot-typing:nth-child(2) { animation-delay: 0.2s; }
    .dot-typing:nth-child(3) { animation-delay: 0.4s; }
    @keyframes blinkDots {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
      40% { transform: scale(1.1); opacity: 1; }
    }

    .input-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .input-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fff;
      border: 1.5px solid var(--accent-line);
      border-radius: 999px;
      padding: 4px 6px 4px 18px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .input-wrap:focus-within {
      border-color: var(--ink);
      box-shadow: 0 0 0 3px rgba(27, 26, 23, 0.08);
    }
    .chat-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 0.94rem;
      color: var(--ink);
      outline: none;
      font-family: inherit;
    }
    .chat-input::placeholder {
      color: var(--ink-3);
    }
    .send-btn {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: none;
      background: var(--ink);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .send-btn:hover:not(:disabled) {
      background: var(--accent);
      transform: scale(1.05);
    }
    .send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .chat-footnote {
      margin: 0;
      font-size: 0.74rem;
      color: var(--ink-3);
      text-align: center;
    }

    /* Floating Launcher */
    .floating-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 90;
    }
    .floating-launcher {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 999px;
      background: var(--ink);
      color: #fff;
      font-weight: 800;
      font-size: 0.88rem;
      text-decoration: none;
      box-shadow: 0 10px 24px -4px rgba(27, 26, 23, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .floating-launcher:hover {
      background: var(--accent);
      transform: translateY(-3px) scale(1.03);
      box-shadow: 0 14px 28px -4px rgba(184, 51, 42, 0.4);
    }
    .launcher-sparkle {
      color: #fef08a;
      animation: pulseSparkle 2s infinite ease-in-out;
    }
  `,
})
export class AiBotSection {
  protected readonly i18n = inject(I18nService);
  protected readonly chat = inject(ChatService);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

  userQuery = '';

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
