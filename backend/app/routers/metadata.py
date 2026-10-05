from fastapi import APIRouter, Query

from ..data_service import get_archived_metadata, get_demo_metadata
from ..schemas import DataSourceId, SourceMetadata

router = APIRouter()


@router.get("/metadata", response_model=SourceMetadata)
def get_metadata(source: DataSourceId = Query(DataSourceId.BACKEND_DEMO)):
    if source == DataSourceId.BACKEND_DEMO:
        return get_demo_metadata(source)
    elif source == DataSourceId.LOCAL_DEMO:
        return get_demo_metadata(source)  # Local demo doesn't really call this, but provide it
    elif source == DataSourceId.ARCHIVED_DATASET:
        return get_archived_metadata()
