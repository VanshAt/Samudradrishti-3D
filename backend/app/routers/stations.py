from fastapi import APIRouter, HTTPException, Query

from ..data_service import get_archived_stations, get_demo_station, get_demo_stations
from ..schemas import DataSourceId, ObservationStation, StationType

router = APIRouter()


@router.get("/stations", response_model=list[ObservationStation])
def get_stations(
    source: DataSourceId = Query(DataSourceId.BACKEND_DEMO),
    time_index: int = Query(0),
    type: StationType | None = Query(None),
):
    if source in [DataSourceId.BACKEND_DEMO, DataSourceId.LOCAL_DEMO]:
        return get_demo_stations(time_index, type)
    elif source == DataSourceId.ARCHIVED_DATASET:
        return get_archived_stations(time_index, type)


@router.get("/stations/{station_id}", response_model=ObservationStation)
def get_station(
    station_id: str,
    source: DataSourceId = Query(DataSourceId.BACKEND_DEMO),
    time_index: int = Query(0),
):
    if source in [DataSourceId.BACKEND_DEMO, DataSourceId.LOCAL_DEMO]:
        station = get_demo_station(station_id, time_index)
        if not station:
            raise HTTPException(status_code=404, detail=f"Station {station_id} not found.")
        return station
    elif source == DataSourceId.ARCHIVED_DATASET:
        stations = get_archived_stations(time_index, None)
        for s in stations:
            if s.id == station_id:
                return s
        raise HTTPException(
            status_code=404, detail=f"Station {station_id} not found in archived data."
        )
