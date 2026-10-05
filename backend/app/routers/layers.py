from fastapi import APIRouter, HTTPException, Query

from ..data_service import get_archived_layer, get_demo_layer
from ..schemas import DataSourceId, LayerResponse, OceanVariable

router = APIRouter()


@router.get("/layers", response_model=LayerResponse)
def get_layers(
    source: DataSourceId = Query(DataSourceId.BACKEND_DEMO),
    variable: OceanVariable = Query(...),
    depth_m: int = Query(...),
    time_index: int = Query(...),
):
    if depth_m not in [0, 50, 100, 200]:
        raise HTTPException(status_code=422, detail="Invalid depth. Must be 0, 50, 100, or 200.")
    if time_index < 0 or time_index > 7:
        raise HTTPException(status_code=422, detail="Invalid time_index. Must be between 0 and 7.")

    if source in [DataSourceId.BACKEND_DEMO, DataSourceId.LOCAL_DEMO]:
        return get_demo_layer(source, variable, depth_m, time_index)
    elif source == DataSourceId.ARCHIVED_DATASET:
        return get_archived_layer(variable, depth_m, time_index)
