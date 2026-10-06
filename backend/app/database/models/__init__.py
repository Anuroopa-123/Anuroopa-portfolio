"""Import every model so Base.metadata (and Alembic autogenerate) sees them."""
from app.database.models.contact_message import ContactMessage
from app.database.models.experience import Experience
from app.database.models.project import Project
from app.database.models.service import Service
from app.database.models.skill import Skill

__all__ = ["ContactMessage", "Experience", "Project", "Service", "Skill"]
