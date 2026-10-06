import re

from app.core.config import get_settings
from app.database.connection import SessionLocal
from app.database.models import ContactMessage, Project, Skill
from app.seed import seed

VALID = {
    "name": "Ada  Lovelace",
    "email": "ada@example.com",
    "project_type": "fullstack",
    "message": "Hello, I would like to talk about a project.",
}


def _post(client, **over):
    return client.post("/api/v1/contact", json={**VALID, **over})


def _rows():
    with SessionLocal() as s:
        return s.query(ContactMessage).all()


# ---- health / content ----
def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200 and r.json() == {"status": "ok"}
    assert r.headers["x-content-type-options"] == "nosniff"


def test_content_matches_json_exactly(client, seeded):
    r = client.get("/api/v1/content")
    assert r.status_code == 200
    body = r.json()
    assert set(body) == {"services", "skills", "projects", "experience"}
    for key in body:
        assert len(body[key]) == len(seeded[key])
    assert body == seeded  # same shape, order and translatable text


def test_content_cache_header(client, seeded):
    r = client.get("/api/v1/content")
    assert r.headers["cache-control"] == "public, max-age=300"


def test_content_hides_unpublished(client, seeded):
    with SessionLocal() as s:
        p = s.query(Project).first()
        p.is_published = False
        s.commit()
    assert len(client.get("/api/v1/content").json()["projects"]) == len(seeded["projects"]) - 1


# ---- seed ----
def test_seed_idempotent_and_removes_stale(content):
    with SessionLocal() as s:
        first = seed(s, content)
        second = seed(s, content)
        assert first == second
        assert s.query(Skill).count() == len(content["skills"])

        trimmed = {**content, "skills": content["skills"][:-1], "projects": content["projects"][1:]}
        seed(s, trimmed)
        assert s.query(Skill).count() == len(content["skills"]) - 1
        assert s.query(Project).count() == len(content["projects"]) - 1


def test_seed_keeps_contact_messages(client, content):
    _post(client)
    with SessionLocal() as s:
        seed(s, content)
    assert len(_rows()) == 1


# ---- contact ----
def test_contact_success_stores_hashed_ip(client):
    r = _post(client, **{"name": "  Ada \n Lovelace "})
    assert r.status_code == 201
    assert r.json() == {"message": "Thanks, your message was sent. I will reply soon."}
    rows = _rows()
    assert len(rows) == 1
    row = rows[0]
    assert row.name == "Ada Lovelace"
    assert re.fullmatch(r"[0-9a-f]{64}", row.ip_hash)
    assert "testclient" not in row.ip_hash and row.ip_hash != "testclient"
    assert row.is_read is False


def test_contact_validation_failures(client):
    assert _post(client, message="short").status_code == 422
    assert _post(client, email="not-an-email").status_code == 422
    assert _post(client, project_type="nope").status_code == 422
    assert _post(client, message="x" * 4001).status_code == 422
    assert _post(client, name="A").status_code == 422
    assert _rows() == []


def test_contact_honeypot_stores_nothing(client):
    r = _post(client, website="http://spam.example")
    assert r.status_code == 201
    assert r.json()["message"].startswith("Thanks")
    assert _rows() == []


def test_contact_rate_limit(client):
    for _ in range(3):
        assert _post(client).status_code == 201
    r = _post(client)
    assert r.status_code == 429
    assert "detail" in r.json()
    assert int(r.headers["retry-after"]) > 0
    assert len(_rows()) == 3


def test_contact_strips_control_characters(client):
    _post(client, name="Ad\x00a\x07 Love\x1blace", message="Hello\x00 there,\x08 this is\x7f a test.\nLine two")
    row = _rows()[0]
    assert row.name == "Ada Lovelace"
    assert row.message == "Hello there, this is a test.\nLine two"


def test_trusted_proxy_uses_forwarded_for(client, monkeypatch):
    monkeypatch.setattr(get_settings(), "TRUSTED_PROXY", True)
    for _ in range(3):
        assert client.post("/api/v1/contact", json=VALID, headers={"X-Forwarded-For": "9.9.9.9, 1.1.1.1"}).status_code == 201
    # a different forwarded client is not limited
    assert client.post("/api/v1/contact", json=VALID, headers={"X-Forwarded-For": "8.8.8.8"}).status_code == 201
    assert client.post("/api/v1/contact", json=VALID, headers={"X-Forwarded-For": "9.9.9.9"}).status_code == 429


# ---- admin ----
def test_admin_disabled_returns_404(client):
    assert client.get("/api/v1/admin/messages", headers={"X-Admin-Token": "anything"}).status_code == 404


def test_admin_requires_valid_token(client, admin_token):
    assert client.get("/api/v1/admin/messages").status_code == 401
    assert client.get("/api/v1/admin/messages", headers={"X-Admin-Token": "wrong"}).status_code == 401


def test_admin_list_mark_read_delete(client, admin_token):
    h = {"X-Admin-Token": admin_token}
    _post(client, message="First message from the form")
    _post(client, message="Second message from the form")

    data = client.get("/api/v1/admin/messages", headers=h).json()
    assert data["total"] == 2
    assert data["items"][0]["message"].startswith("Second")  # newest first
    assert "ip_hash" not in data["items"][0]
    first_id = data["items"][1]["id"]

    r = client.patch(f"/api/v1/admin/messages/{first_id}", json={"is_read": True}, headers=h)
    assert r.status_code == 200 and r.json()["is_read"] is True
    unread = client.get("/api/v1/admin/messages?unread_only=true", headers=h).json()
    assert unread["total"] == 1

    assert client.get("/api/v1/admin/messages?limit=0", headers=h).status_code == 422
    assert client.delete(f"/api/v1/admin/messages/{first_id}", headers=h).status_code == 204
    assert client.delete(f"/api/v1/admin/messages/{first_id}", headers=h).status_code == 404
    assert client.patch("/api/v1/admin/messages/9999", json={"is_read": True}, headers=h).status_code == 404
    assert client.get("/api/v1/admin/messages", headers=h).json()["total"] == 1


# ---- CORS ----
def test_cors_preflight_allowed_origin(client):
    r = client.options(
        "/api/v1/contact",
        headers={
            "Origin": "http://localhost:4200",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert r.status_code == 200
    assert r.headers["access-control-allow-origin"] == "http://localhost:4200"
    assert "access-control-allow-credentials" not in r.headers


def test_cors_foreign_origin_rejected(client):
    r = client.options(
        "/api/v1/contact",
        headers={"Origin": "http://evil.example", "Access-Control-Request-Method": "POST"},
    )
    assert "access-control-allow-origin" not in r.headers
