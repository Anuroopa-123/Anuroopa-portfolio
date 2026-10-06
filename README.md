# Anuroopa PV: Portfolio (Angular + FastAPI + PostgreSQL)

Light, kolam-inspired design with a 3D hero (CODE → DATA → AI → PRODUCT), English/தமிழ் toggle, and a contact form saved to PostgreSQL.

## Run locally
Python 3.10 or newer works. Windows: `python -m venv venv`, `venv\Scripts\activate`, `copy .env.example .env`.
 Or run everything with Docker: `docker compose up --build` (site on http://localhost:8080).

1. **Database**: create a PostgreSQL database `portfolio`.
2. **Backend**
   ```
   cd backend
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env        # edit DB_* values, set ADMIN_TOKEN
   alembic upgrade head
   python -m app.seed          # loads content/content.json into the DB
   uvicorn app.main:app --port 8000
   ```
3. **Frontend**
   ```
   cd frontend
   npm install
   npx ng serve                # http://localhost:4200 (proxies /api to :8000)
   ```
If the backend is down, the site still shows all content from `public/content.json`; only the contact form needs the API (it offers an email fallback).

## Where to edit things
- Text content: `content/content.json` (then `python -m app.seed`, and copy it to `frontend/public/content.json`).
- UI text / Tamil: `frontend/src/app/core/translations.ts`.
- Email, LinkedIn, GitHub, API address: `frontend/src/app/site.config.ts`.
- Read messages: `GET /api/v1/admin/messages` with header `X-Admin-Token: <ADMIN_TOKEN>`.

## Placeholders to fill before going live
- GitHub URL (`site.config.ts` and each project in content.json). Empty shows "link coming soon".
- Replace `your-domain.example` in `frontend/src/index.html` (canonical, og:url, og:image, twitter:image).
- `frontend/public/Anuroopa_PV_Resume.pdf`: replace with your latest resume.
- `frontend/public/og-image.png` (1200×630 share card) can be replaced.
- Production: set `apiBase` to your API URL, `FRONTEND_URL` in backend `.env` to your site, and `npx ng build`.

## Honest-content checklist
- Skills marked "exploring" (Django, Java, Next.js, MongoDB, Docker): remove any you cannot defend in an interview.
- AI Knowledge Platform features have built/planned flags: keep them accurate.
- Ask a Tamil speaker to review the Tamil text.
- Never commit `.env`. Rotate any key or password that was ever pasted in a chat.
