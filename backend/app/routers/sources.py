from fastapi import APIRouter

from ..data_service import get_archived_metadata, get_archived_source_status
from ..schemas import DataSourceId, SourceStatus

router = APIRouter()


@router.get("/sources", response_model=list[SourceStatus])
def get_sources():
    sources = [
        SourceStatus(
            id=DataSourceId.LOCAL_DEMO,
            label="Local deterministic prototype data",
            available=True,
            isDemo=True,
            description="Local frontend-only deterministic dataset. Always available offline.",
        ),
        SourceStatus(
            id=DataSourceId.BACKEND_DEMO,
            label="Backend-served deterministic prototype data",
            available=True,
            isDemo=True,
            description="FastAPI-served deterministic dataset for testing integration.",
        ),
    ]

    sources.append(get_archived_source_status())

    return sources


@router.get("/source-health")
def get_source_health():
    archived_status = get_archived_source_status()
    try:
        archived_meta = get_archived_metadata() if archived_status.available else None
    except Exception:
        archived_meta = None

    return {
        "backend_demo": "available",
        "archived_dataset": "available" if archived_status.available else "unavailable",
        "archived_metadata_summary": archived_meta.model_dump() if archived_meta else None,
    }
