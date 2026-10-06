"""Data access for the public content (no business logic here)."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models import Experience, Project, Service, Skill


class ContentRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def _all(self, model, *where):
        stmt = select(model).where(*where).order_by(model.sort_order, model.id)
        return list(self.session.scalars(stmt))

    def services(self) -> list[Service]:
        return self._all(Service)

    def skills(self) -> list[Skill]:
        return self._all(Skill)

    def published_projects(self) -> list[Project]:
        return self._all(Project, Project.is_published.is_(True))

    def experiences(self) -> list[Experience]:
        return self._all(Experience)
