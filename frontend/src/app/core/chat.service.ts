import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';

import { SITE } from '../site.config';
import { ContentService } from './content.service';
import { I18nService } from './i18n.service';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  reply: string;
  suggested_questions?: string[];
  has_api_key?: boolean;
}

const RESUME_DOWNLOAD_LINK = '/Anuroopa_PV_Resume.pdf';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly i18n = inject(I18nService);
  private readonly cs = inject(ContentService);

  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly suggested = signal<string[]>([
    'What work experience does Anuroopa have?',
    'What projects has she done?',
    'What is her educational background & CGPA?',
    'How can I download her resume?',
  ]);

  readonly messages = signal<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hello! I am Anuroopa's AI Portfolio & Resume Assistant. Ask me anything about her work experience at TANSAM and DLF Photon, her projects, skills, education, or download her full verified resume!",
    },
  ]);

  toggle(force?: boolean): void {
    this.isOpen.update((v) => (typeof force === 'boolean' ? force : !v));
  }

  send(userText: string): void {
    const text = userText.trim();
    if (!text || this.isLoading()) return;

    // Add user message
    const updatedMessages: ChatMessage[] = [...this.messages(), { role: 'user', content: text }];
    this.messages.set(updatedMessages);
    this.isLoading.set(true);

    const lang = this.i18n.lang();

    // Call FastAPI backend /api/v1/chat
    this.http
      .post<ChatResponse>(`${SITE.apiBase}/chat`, {
        messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        language: lang,
      })
      .pipe(
        catchError(() => {
          // Graceful dynamic fallback if backend is offline
          const fallbackReply = this.generateLocalFallback(text);
          return of<ChatResponse>({
            reply: fallbackReply,
            suggested_questions: [
              'What work experience does she have?',
              'What projects has she done?',
              'How can I download her resume?',
            ],
            has_api_key: false,
          });
        }),
      )
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.messages.update((msgs) => [...msgs, { role: 'assistant', content: res.reply }]);
          if (res.suggested_questions && res.suggested_questions.length > 0) {
            this.suggested.set(res.suggested_questions);
          }
        },
        error: () => {
          this.isLoading.set(false);
          const fallback = this.generateLocalFallback(text);
          this.messages.update((msgs) => [...msgs, { role: 'assistant', content: fallback }]);
        },
      });
  }

  reset(): void {
    this.messages.set([
      {
        role: 'assistant',
        content:
          "Hello! I am Anuroopa's AI Assistant. Ask me anything about her work experience, projects, skills, or download her resume!",
      },
    ]);
    this.suggested.set([
      'What work experience does Anuroopa have?',
      'What projects has she done?',
      'What is her educational background & CGPA?',
      'How can I download her resume?',
    ]);
  }

  private generateLocalFallback(query: string): string {
    const q = query.toLowerCase();

    // 1. Experience & Companies (TANSAM, DLF Photon)
    if (
      q.includes('experience') ||
      q.includes('worked') ||
      q.includes('company') ||
      q.includes('tansam') ||
      q.includes('photon') ||
      q.includes('career') ||
      q.includes('role')
    ) {
      return (
        '### Anuroopa PV\'s Professional Experience (From Resume)\n\n' +
        'Anuroopa has **1+ year of professional experience** building web and mobile applications for the Government of Tamil Nadu and enterprise clients:\n\n' +
        '1. **Junior Developer — TANSAM (Tamil Nadu Skill Development Corporation, TIDEL Park, Chennai)** (1 Year)\n' +
        '   • **HLC-USR Government Portal:** Developed responsive frontend modules in **Angular** and TypeScript with **Angular i18n** for English-to-Tamil localization.\n' +
        '   • **DPH-LMS Government Learning Management System:** Built full-stack LMS for doctors using **React.js, Node.js, and MySQL** with Bearer token authentication and role-based access control (RBAC).\n' +
        '   • Trained a **CNN model** for gesture classification with high accuracy.\n\n' +
        '2. **Front-End Developer Intern — DLF Photon, Chennai** (3 Months)\n' +
        '   • Built a **Key Management Report System** in **Angular 18** to track and assign physical keys across facilities.\n' +
        '   • Implemented dynamic dropdowns, sorting, and integrated Java-based backend REST APIs.\n\n' +
        `📄 *You can download her complete official resume here: [Download Resume](${RESUME_DOWNLOAD_LINK})*`
      );
    }

    // 2. Resume Download
    if (q.includes('resume') || q.includes('cv') || q.includes('download') || q.includes('pdf')) {
      return (
        '### Anuroopa PV\'s Official Resume\n\n' +
        'Anuroopa\'s verified resume contains her full work experience, education, technical skill sets, and academic projects:\n\n' +
        '• **Title:** Full-Stack Developer (React.js | Angular | Node.js | FastAPI)\n' +
        '• **Experience:** TANSAM (1 Year) & DLF Photon (3 Months)\n' +
        '• **Education:** B.Tech in Artificial Intelligence & Data Science, Panimalar Institute of Technology (CGPA: 8.56)\n' +
        '• **Core Stack:** Angular, React, Node.js, FastAPI, PostgreSQL, MySQL\n\n' +
        `📥 **Download Full Resume:** Click [**Download Resume (PDF)**](${RESUME_DOWNLOAD_LINK}) or use the button in the hero section!`
      );
    }

    // 3. Education & College
    if (
      q.includes('education') ||
      q.includes('college') ||
      q.includes('degree') ||
      q.includes('cgpa') ||
      q.includes('school') ||
      q.includes('panimalar') ||
      q.includes('b.tech')
    ) {
      return (
        '### Anuroopa PV\'s Education (From Resume)\n\n' +
        '• **B.Tech in Artificial Intelligence & Data Science** (2024)\n' +
        '  - **College:** Panimalar Institute of Technology, Anna University, Chennai\n' +
        '  - **CGPA:** **8.56** (Distinction)\n\n' +
        '• **Higher Secondary Certificate (HSC - 12th)** (2020)\n' +
        '  - **School:** Sri Kalaimagal Vidhya Mandir Higher Secondary School, Chennai (86.7%)\n\n' +
        '• **Secondary School Leaving Certificate (SSLC - 10th)** (2018)\n' +
        '  - **School:** St. Britto Matriculation School, Madurai (93.6%)\n\n' +
        `📄 *Verified on her resume: [Download Resume](${RESUME_DOWNLOAD_LINK})*`
      );
    }

    // 4. Projects
    if (q.includes('project') || q.includes('built') || q.includes('done') || q.includes('work')) {
      return (
        '### Key Projects Built by Anuroopa PV\n\n' +
        '1. **PCVA: Physician-Coded Verbal Autopsy** (Angular, React Native, Node.js, Express, PostgreSQL, SQLite)\n' +
        '   Web and offline-first mobile app for verbal autopsy interviews with dynamic questionnaire engine.\n\n' +
        '2. **DPH-LMS: Learning Management System** (React.js, Node.js, MySQL)\n' +
        '   Doctor training platform for Government of Tamil Nadu with role-based auth, course tracking, and SCORM/video delivery.\n\n' +
        '3. **AI Knowledge & ML Platform** (Angular, FastAPI, PostgreSQL, Python, AI/ML)\n' +
        '   Multimodal Q&A platform for uploaded documents, images, and video.\n\n' +
        '4. **HLC-USR Government Portal** (Angular 21, TypeScript, i18n)\n' +
        '   Dual-language government portal in English and Tamil.\n\n' +
        '5. **Hand Gesture Recognition System** (Python, OpenCV, CNN, TensorFlow)\n' +
        '   Gesture-to-voice conversion in three languages.\n\n' +
        `📄 *All projects are detailed on her resume: [Download Resume](${RESUME_DOWNLOAD_LINK})*`
      );
    }

    // 5. Contact
    if (q.includes('contact') || q.includes('email') || q.includes('hire') || q.includes('phone') || q.includes('reach')) {
      return (
        '### How to Contact Anuroopa\n\n' +
        '• **Email:** anukalpana2003@gmail.com\n' +
        '• **Phone:** +91-9500683824\n' +
        '• **LinkedIn:** https://www.linkedin.com/in/anuroopa-pv\n' +
        '• **Location:** Chennai, Tamil Nadu, India\n' +
        `• **Resume:** [Download Resume PDF](${RESUME_DOWNLOAD_LINK})\n` +
        'Or submit a message through the contact form below!'
      );
    }

    return (
      'Anuroopa PV is a Full-Stack Software Developer with 1 year of professional experience at **TANSAM** and **DLF Photon**, ' +
      'and a B.Tech in AI & Data Science (**CGPA: 8.56**) from Panimalar Institute of Technology.\n\n' +
      'Ask me anything about her work experience, projects, technical skills, or download her complete resume!'
    );
  }
}
