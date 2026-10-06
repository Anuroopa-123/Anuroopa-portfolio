FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run as a non-root user so a compromised process has fewer rights.
RUN useradd --create-home --uid 10001 appuser && chown -R appuser /app
USER appuser

# The shared content file is not inside the backend folder: mount it here
# (docker run -v ../content:/app/content:ro) or COPY it in a custom build.
ENV CONTENT_FILE=/app/content/content.json

EXPOSE 8000

# Migrate, seed (idempotent), then serve.
CMD ["sh", "-c", "alembic upgrade head && python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
