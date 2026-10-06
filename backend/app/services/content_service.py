"""Builds the public content payload from the repositories."""
from app.repositories.content_repository import ContentRepository
from app.schemas.content import ContentOut, ExperienceOut, ProjectOut, ServiceOut, SkillOut


class ContentService:
    def __init__(self, repo: ContentRepository) -> None:
        self.repo = repo

    def get_content(self) -> ContentOut:
        # from_attributes lets pydantic read ORM rows and drop ids/timestamps for us.
        return ContentOut(
            services=[ServiceOut.model_validate(r) for r in self.repo.services()],
            skills=[SkillOut.model_validate(r) for r in self.repo.skills()],
            projects=[ProjectOut.model_validate(r) for r in self.repo.published_projects()],
            experience=[ExperienceOut.model_validate(r) for r in self.repo.experiences()],
        )
