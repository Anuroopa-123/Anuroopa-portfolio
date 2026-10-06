export type Lang = 'en' | 'ta';

/** Text in both languages, exactly as stored in content.json and in the database. */
export interface I18nText {
  en: string;
  ta: string;
}

export interface Feature extends I18nText {
  /** Only used on projects that are still being built: true = finished, false = planned. */
  done?: boolean;
}

export type ProjectStatus = 'in_progress' | 'client_private' | 'internship';

export interface Project {
  slug: string;
  categories: string[];
  status: ProjectStatus;
  visual: string;
  title: I18nText;
  summary: I18nText;
  problem: I18nText;
  solution: I18nText;
  features: Feature[];
  stack: string[];
  github_url: string;
  live_url: string;
}

export type SkillLevel = 'daily' | 'working' | 'exploring';

export interface Skill {
  category: string;
  name: string;
  level: SkillLevel;
  note: I18nText;
}

export interface Service {
  key: string;
  icon: string;
  title: I18nText;
  description: I18nText;
}

export interface Experience {
  key: string;
  kind: 'job' | 'internship';
  company: string;
  location: string;
  role: I18nText;
  period: I18nText;
  highlights: I18nText[];
}

export interface Content {
  services: Service[];
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
}
