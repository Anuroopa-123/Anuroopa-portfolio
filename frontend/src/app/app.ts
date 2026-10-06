import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';

import { ContentService } from './core/content.service';
import { I18nService } from './core/i18n.service';
import { ScrollSpy } from './core/scroll-spy.service';
import { CursorComponent } from './layout/cursor.component';
import { FooterComponent } from './layout/footer.component';
import { NavbarComponent } from './layout/navbar.component';
import { AboutSection } from './sections/about.section';
import { AiSection } from './sections/ai.section';
import { ContactSection } from './sections/contact.section';
import { ExperienceSection } from './sections/experience.section';
import { HeroSection } from './sections/hero.section';
import { ProcessSection } from './sections/process.section';
import { ProjectsSection } from './sections/projects.section';
import { ServicesSection } from './sections/services.section';
import { SkillsSection } from './sections/skills.section';
import { WhySection } from './sections/why.section';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CursorComponent, NavbarComponent, FooterComponent, HeroSection, AboutSection, SkillsSection, ServicesSection, ProjectsSection, AiSection, ExperienceSection, WhySection, ProcessSection, ContactSection],
  template: `
    <a class="skip sr-only" href="#about">{{ i18n.t('skip') }}</a>
    <app-cursor />
    <app-navbar />
    <main>
      <app-hero /><app-about /><app-skills /><app-services /><app-projects /><app-ai />
      <app-experience /><app-why /><app-process /><app-contact />
    </main>
    <app-footer />
  `,
  styles: `.skip:focus { position: fixed; z-index: 100; left: 12px; top: 12px; width: auto; height: auto; clip: auto; padding: 10px 16px; background: var(--turmeric); color: var(--ink); border-radius: 8px; font-weight: 800; }`,
})
export class App {
  protected readonly i18n = inject(I18nService);

  constructor() {
    inject(ContentService).load();
    const spy = inject(ScrollSpy);
    afterNextRender(() => spy.observe(['home', 'about', 'skills', 'services', 'projects', 'ai', 'experience', 'why', 'process', 'contact']));
  }
}
