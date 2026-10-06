"""Load content.json into the database: `python -m app.seed`.

WHY: the JSON file is the single source of truth, so seeding is an idempotent
upsert and rows missing from the file are deleted. contact_messages is never touched.
"""
import json
import os
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models import Experience, Project, Service, Skill

DEFAULT_CONTENT = Path(__file__).resolve().parents[1] / ".." / "content" / "content.json"


def _sync(session: Session, model, items: list[dict], key_of, find_key) -> int:
    """Upsert `items` (index = sort_order) and delete rows whose key is not in the file."""
    existing = {find_key(r): r for r in session.scalars(select(model))}
    wanted = set()
    for order, item in enumerate(items):
        k = key_of(item)
        wanted.add(k)
        row = existing.get(k)
        if row is None:
            row = model()
            session.add(row)
        for field, value in item.items():
            setattr(row, field, value)
        row.sort_order = order
    for k, row in existing.items():
        if k not in wanted:
            session.delete(row)
    return len(items)


def seed(session: Session, content: dict) -> dict[str, int]:
    projects = [{"github_url": "", "live_url": "", **p} for p in content["projects"]]
    counts = {
        "services": _sync(session, Service, content["services"], lambda i: i["key"], lambda r: r.key),
        "skills": _sync(session, Skill, content["skills"],
                        lambda i: (i["category"], i["name"]), lambda r: (r.category, r.name)),
        "projects": _sync(session, Project, projects, lambda i: i["slug"], lambda r: r.slug),
        "experience": _sync(session, Experience, content["experience"], lambda i: i["key"], lambda r: r.key),
    }
    session.commit()
    return counts


def main() -> None:
    from app.database.connection import SessionLocal

    path = Path(os.environ.get("CONTENT_FILE") or DEFAULT_CONTENT)
    content = json.loads(path.read_text(encoding="utf-8"))
    with SessionLocal() as session:
        c = seed(session, content)
    print(f"Seeded from {path}: {c['services']} services, {c['skills']} skills, "
          f"{c['projects']} projects, {c['experience']} experience")


if __name__ == "__main__":
    main()
