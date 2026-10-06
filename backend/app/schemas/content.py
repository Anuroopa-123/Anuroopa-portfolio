"""Response shapes for /api/v1/content, identical to content.json."""
from pydantic import BaseModel, ConfigDict

I18n = dict[str, str]


class ServiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    key: str
    icon: str
    title: I18n
    description: I18n


class SkillOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    category: str
    name: str
    level: str
    note: I18n


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    slug: str
    categories: list[str]
    status: str
    visual: str
    title: I18n
    summary: I18n
    problem: I18n
    solution: I18n
    # Feature items are {"en","ta","done"?}; kept as free dicts so "done" stays optional.
    features: list[dict]
    stack: list[str]
    github_url: str
    live_url: str


class ExperienceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    key: str
    kind: str
    company: str
    location: str
    role: I18n
    period: I18n
    highlights: list[I18n]


class ContentOut(BaseModel):
    services: list[ServiceOut]
    skills: list[SkillOut]
    projects: list[ProjectOut]
    experience: list[ExperienceOut]
