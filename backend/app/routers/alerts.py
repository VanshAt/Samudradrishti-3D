from typing import Any

from fastapi import APIRouter, Query

from ..schemas import DataSourceId

router = APIRouter()


@router.get("/alerts", response_model=list[Any])
def get_alerts(source: DataSourceId = Query(DataSourceId.BACKEND_DEMO), time_index: int = Query(0)):
    # For Day 9, alert generation remains deterministic on the frontend.
    # Return an empty list indicating the backend doesn't serve alerts yet.
    return []
