from fastapi import APIRouter, Response

from app.api.deps import ContentServiceDep
from app.schemas.content import ContentOut

router = APIRouter(tags=["content"])


@router.get("/content", response_model=ContentOut)
def get_content(response: Response, service: ContentServiceDep) -> ContentOut:
    """Public portfolio content; cacheable for 5 minutes since it rarely changes."""
    response.headers["Cache-Control"] = "public, max-age=300"
    return service.get_content()
