import math
import os
from pathlib import Path

import numpy as np
import pandas as pd
import xarray as xr
from fastapi import HTTPException

from .schemas import (
    CurrentGridPoint,
    DataSourceId,
    LatestObservation,
    LayerResponse,
    ObservationStation,
    OceanVariable,
    QualityFlag,
    RoutePoint,
    SalinityGridPoint,
    SourceMetadata,
    SourceStatus,
    StationType,
    TemperatureGridPoint,
)

DEMO_TIME_STEPS = [
    "2026-09-21T00:00:00Z",
    "2026-09-21T06:00:00Z",
    "2026-09-21T12:00:00Z",
    "2026-09-21T18:00:00Z",
    "2026-09-22T00:00:00Z",
    "2026-09-22T06:00:00Z",
    "2026-09-22T12:00:00Z",
    "2026-09-22T18:00:00Z",
]
DEPTH_LEVELS = [0, 50, 100, 200]
GEOGRAPHIC_BOUNDS = {
    "minLongitude": 80.0,
    "maxLongitude": 100.0,
    "minLatitude": 5.0,
    "maxLatitude": 25.0,
}

PROCESSED_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "processed")


def get_demo_metadata(source: DataSourceId) -> SourceMetadata:
    return SourceMetadata(
        source=source,
        sourceLabel="Backend-served deterministic prototype data",
        isDemo=True,
        disclaimer="Data is generated deterministically by the backend for testing.",
        timeSteps=DEMO_TIME_STEPS,
        depthLevels=DEPTH_LEVELS,
        supportedVariables=[
            OceanVariable.TEMPERATURE,
            OceanVariable.SALINITY,
            OceanVariable.CURRENTS,
        ],
        geographicBounds=GEOGRAPHIC_BOUNDS,
    )


def _generate_demo_stations(time_index: int) -> list[ObservationStation]:
    stations = []

    # 10 Argo Floats
    for i in range(10):
        lat = 10.0 + (i * 1.2)
        lon = 85.0 + (i * 0.8)

        # Simple drift over time
        lat_drift = lat + (time_index * 0.05)
        lon_drift = lon + (time_index * 0.03)

        temp = 28.5 - (time_index * 0.2) + (math.sin(i) * 1.5)
        sal = 34.2 + (time_index * 0.05) + (math.cos(i) * 0.4)
        speed = 0.3 + (math.sin(time_index + i) * 0.1)

        stations.append(
            ObservationStation(
                id=f"argo-{i:02d}",
                name=f"Argo Float {i:02d}",
                type=StationType.ARGO,
                latitude=lat_drift,
                longitude=lon_drift,
                timestamp=DEMO_TIME_STEPS[time_index],
                qualityFlag=QualityFlag.GOOD if i % 4 != 0 else QualityFlag.SUSPECT,
                latestObservation=LatestObservation(
                    temperatureC=round(temp, 2),
                    salinityPsu=round(sal, 2),
                    currentSpeedMs=round(speed, 2),
                ),
                depthM=DEPTH_LEVELS[time_index % len(DEPTH_LEVELS)],
                platformDescription="Profiling float measuring temperature and salinity.",
            )
        )

    # 5 Mooring Buoys
    for i in range(5):
        lat = 15.0 + (i * 2.0)
        lon = 88.0 - (i * 1.5)

        temp = 29.0 - (time_index * 0.1) + (math.cos(i) * 1.0)
        sal = 33.5 + (time_index * 0.1)
        speed = 0.5 + (math.sin(time_index) * 0.2)

        stations.append(
            ObservationStation(
                id=f"buoy-{i:02d}",
                name=f"Mooring Buoy {i:02d}",
                type=StationType.BUOY,
                latitude=lat,
                longitude=lon,
                timestamp=DEMO_TIME_STEPS[time_index],
                qualityFlag=QualityFlag.GOOD,
                latestObservation=LatestObservation(
                    temperatureC=round(temp, 2),
                    salinityPsu=round(sal, 2),
                    currentSpeedMs=round(speed, 2),
                ),
                depthM=0.0,
                platformDescription="Fixed mooring buoy providing surface and subsurface data.",
            )
        )

    # 1 Glider
    glider_lat = 12.0 + (time_index * 0.2)
    glider_lon = 82.0 + (time_index * 0.3)
    route = [RoutePoint(latitude=12.0 + (t * 0.2), longitude=82.0 + (t * 0.3)) for t in range(8)]

    stations.append(
        ObservationStation(
            id="glider-01",
            name="Ocean Glider 01",
            type=StationType.GLIDER,
            latitude=glider_lat,
            longitude=glider_lon,
            timestamp=DEMO_TIME_STEPS[time_index],
            qualityFlag=QualityFlag.GOOD,
            latestObservation=LatestObservation(
                temperatureC=round(27.5 + (time_index * 0.1), 2),
                salinityPsu=round(34.8 - (time_index * 0.05), 2),
                currentSpeedMs=round(0.4 + (math.cos(time_index) * 0.1), 2),
            ),
            depthM=50.0,
            platformDescription=(
                "Autonomous underwater vehicle collecting high-resolution profiles."
            ),
            route=route,
        )
    )

    return stations


def get_demo_stations(
    time_index: int, station_type: StationType | None = None
) -> list[ObservationStation]:
    stations = _generate_demo_stations(time_index)
    if station_type:
        return [s for s in stations if s.type == station_type]
    return stations


def get_demo_station(station_id: str, time_index: int) -> ObservationStation | None:
    stations = _generate_demo_stations(time_index)
    for s in stations:
        if s.id == station_id:
            return s
    return None


def get_demo_layer(
    source: DataSourceId, variable: OceanVariable, depth_m: int, time_index: int
) -> LayerResponse:
    points = []

    time_iso = DEMO_TIME_STEPS[time_index]
    min_val, max_val = 0.0, 0.0
    units = ""

    # 8x9 grid for scalars, 5x6 for vectors
    if variable in [OceanVariable.TEMPERATURE, OceanVariable.SALINITY]:
        lats = [GEOGRAPHIC_BOUNDS["minLatitude"] + i * (20.0 / 7.0) for i in range(8)]
        lons = [GEOGRAPHIC_BOUNDS["minLongitude"] + j * (20.0 / 8.0) for j in range(9)]
    else:
        lats = [GEOGRAPHIC_BOUNDS["minLatitude"] + i * (20.0 / 4.0) for i in range(5)]
        lons = [GEOGRAPHIC_BOUNDS["minLongitude"] + j * (20.0 / 5.0) for j in range(6)]

    if variable == OceanVariable.TEMPERATURE:
        units = "°C"
        min_val, max_val = 15.0, 32.0
        for lat in lats:
            for lon in lons:
                val = (
                    28.0
                    - (depth_m * 0.05)
                    + (math.sin(lat) * 2.0)
                    + (math.cos(lon + time_index) * 1.5)
                )
                points.append(
                    TemperatureGridPoint(
                        latitude=lat, longitude=lon, depthM=depth_m, temperatureC=round(val, 2)
                    )
                )

    elif variable == OceanVariable.SALINITY:
        units = "PSU"
        min_val, max_val = 31.0, 36.0
        for lat in lats:
            for lon in lons:
                val = (
                    34.0
                    + (depth_m * 0.005)
                    - (math.cos(lat) * 1.0)
                    + (math.sin(lon - time_index) * 0.5)
                )
                points.append(
                    SalinityGridPoint(
                        latitude=lat, longitude=lon, depthM=depth_m, salinityPsu=round(val, 2)
                    )
                )

    elif variable == OceanVariable.CURRENTS:
        units = "m/s"
        min_val, max_val = 0.0, 2.0
        for lat in lats:
            for lon in lons:
                u = 0.5 * math.sin(lat + time_index * 0.5)
                v = 0.5 * math.cos(lon - time_index * 0.5)
                speed = math.sqrt(u**2 + v**2)
                dir_deg = (math.degrees(math.atan2(u, v)) + 360) % 360
                points.append(
                    CurrentGridPoint(
                        latitude=lat,
                        longitude=lon,
                        depthM=depth_m,
                        uMs=round(u, 3),
                        vMs=round(v, 3),
                        speedMs=round(speed, 3),
                        directionDegrees=round(dir_deg, 1),
                    )
                )

    return LayerResponse(
        source=source,
        variable=variable,
        depthM=depth_m,
        timeIndex=time_index,
        timeIso=time_iso,
        units=units,
        minValue=min_val,
        maxValue=max_val,
        points=points,
        isDemo=True,
        sourceLabel="Backend-served deterministic prototype data",
        disclaimer="Data is generated deterministically by the backend for testing.",
    )


DATA_DIR = Path(__file__).resolve().parents[1] / "data"
ARCHIVED_SUBSET_PATH = DATA_DIR / "archived_subset.nc"

ARCHIVED_LABEL = "Archived Copernicus dataset (Bay of Bengal, Jun 2025)"
ARCHIVED_DISCLAIMER = (
    "Copernicus Marine GLORYS12V1 reanalysis subset; "
    "not real-time observational data."
)
ARCHIVED_UNAVAILABLE_DETAIL = (
    "Archived dataset unavailable. Run preprocessing first."
)

def _archived_available() -> bool:
    if not ARCHIVED_SUBSET_PATH.is_file():
        return False
    try:
        with xr.open_dataset(ARCHIVED_SUBSET_PATH):
            return True
    except (OSError, ValueError):
        return False

def _require_archived_dataset() -> None:
    if not _archived_available():
        raise HTTPException(
            status_code=404,
            detail=ARCHIVED_UNAVAILABLE_DETAIL,
        )

def get_archived_source_status() -> SourceStatus:
    available = _archived_available()
    desc = (
        "Preprocessed Copernicus Marine GLORYS12V1 reanalysis subset for the Bay of Bengal."
        if available
        else ARCHIVED_UNAVAILABLE_DETAIL
    )
    return SourceStatus(
        id=DataSourceId.ARCHIVED_DATASET,
        label=ARCHIVED_LABEL,
        available=available,
        isDemo=False,
        description=desc,
        originalDatasetId="cmems_mod_glo_phy_my_0.083deg_P1D-m",
    )


def get_archived_metadata() -> SourceMetadata:
    _require_archived_dataset()

    with xr.open_dataset(ARCHIVED_SUBSET_PATH) as ds:
        time_vals = ds['time'].values
        times = pd.to_datetime(time_vals).strftime("%Y-%m-%dT%H:%M:%SZ").tolist()
        depths = [float(d) for d in ds['depth'].values]

        lats = ds['lat'].values
        lons = ds['lon'].values
        bounds = {
            "minLongitude": float(np.min(lons)),
            "maxLongitude": float(np.max(lons)),
            "minLatitude": float(np.min(lats)),
            "maxLatitude": float(np.max(lats)),
        }

        return SourceMetadata(
            source=DataSourceId.ARCHIVED_DATASET,
            sourceLabel=ARCHIVED_LABEL,
            isDemo=False,
            disclaimer=ARCHIVED_DISCLAIMER,
            timeSteps=times,
            depthLevels=depths,
            supportedVariables=[
                OceanVariable.TEMPERATURE,
                OceanVariable.SALINITY,
                OceanVariable.CURRENTS,
            ],
            geographicBounds=bounds,
            originalDatasetId="cmems_mod_glo_phy_my_0.083deg_P1D-m",
        )


def get_archived_layer(
    variable: OceanVariable, depth_m: int, time_index: int
) -> LayerResponse:
    _require_archived_dataset()

    with xr.open_dataset(ARCHIVED_SUBSET_PATH) as ds:
        times = ds['time'].values
        if time_index < 0 or time_index >= len(times):
            raise HTTPException(status_code=422, detail="Invalid time_index.")

        depths = ds['depth'].values
        is_valid_depth = any(abs(float(d) - depth_m) < 0.1 for d in depths)
        if not is_valid_depth:
            raise HTTPException(status_code=422, detail="Invalid depth.")

        time_val = times[time_index]
        data = ds.sel(time=time_val, depth=depth_m, method='nearest')

        time_iso = pd.to_datetime(time_val).strftime("%Y-%m-%dT%H:%M:%SZ")

        lats = ds['lat'].values
        lons = ds['lon'].values

        points = []
        min_val, max_val = float('inf'), float('-inf')
        units = ""

        if variable == OceanVariable.TEMPERATURE:
            units = "°C"
            temp_data = data['temperature'].values
            for i, lat in enumerate(lats):
                for j, lon in enumerate(lons):
                    val = float(temp_data[i, j])
                    if np.isfinite(val):
                        points.append(
                            TemperatureGridPoint(
                                latitude=float(lat),
                                longitude=float(lon),
                                depthM=depth_m,
                                temperatureC=val,
                            )
                        )
                        min_val = min(min_val, val)
                        max_val = max(max_val, val)

        elif variable == OceanVariable.SALINITY:
            units = "PSU"
            sal_data = data['salinity'].values
            for i, lat in enumerate(lats):
                for j, lon in enumerate(lons):
                    val = float(sal_data[i, j])
                    if np.isfinite(val):
                        points.append(
                            SalinityGridPoint(
                                latitude=float(lat),
                                longitude=float(lon),
                                depthM=depth_m,
                                salinityPsu=val,
                            )
                        )
                        min_val = min(min_val, val)
                        max_val = max(max_val, val)

        elif variable == OceanVariable.CURRENTS:
            units = "m/s"
            u_data = data['u_current'].values
            v_data = data['v_current'].values
            speed_data = data['current_speed'].values

            for i, lat in enumerate(lats):
                for j, lon in enumerate(lons):
                    u = float(u_data[i, j])
                    v = float(v_data[i, j])
                    spd = float(speed_data[i, j])
                    if np.isfinite(u) and np.isfinite(v) and np.isfinite(spd):
                        dir_deg = float((math.degrees(math.atan2(u, v)) + 360) % 360)
                        points.append(CurrentGridPoint(
                            latitude=float(lat), longitude=float(lon), depthM=depth_m,
                            uMs=u, vMs=v, speedMs=spd, directionDegrees=dir_deg
                        ))
                        min_val = min(min_val, spd)
                        max_val = max(max_val, spd)

        if len(points) == 0:
            min_val = 0.0
            max_val = 0.0

        return LayerResponse(
            source=DataSourceId.ARCHIVED_DATASET,
            variable=variable,
            depthM=depth_m,
            timeIndex=time_index,
            timeIso=time_iso,
            units=units,
            minValue=float(min_val),
            maxValue=float(max_val),
            points=points,
            isDemo=False,
            sourceLabel=ARCHIVED_LABEL,
            disclaimer=ARCHIVED_DISCLAIMER,
        )


def get_archived_stations(
    time_index: int, station_type: StationType | None = None
) -> list[ObservationStation]:
    _require_archived_dataset()

    with xr.open_dataset(ARCHIVED_SUBSET_PATH) as ds:
        times = ds['time'].values
        if time_index < 0 or time_index >= len(times):
            raise HTTPException(status_code=422, detail="Invalid time_index.")

        time_iso = pd.to_datetime(times[time_index]).strftime("%Y-%m-%dT%H:%M:%SZ")

        lats = ds['lat'].values
        lons = ds['lon'].values
        min_lat, max_lat = float(np.min(lats)), float(np.max(lats))
        min_lon, max_lon = float(np.min(lons)), float(np.max(lons))

    demo_stations = _generate_demo_stations(time_index)
    valid_stations = []

    for s in demo_stations:
        if not (min_lat <= s.latitude <= max_lat and min_lon <= s.longitude <= max_lon):
            continue

        if station_type and s.type != station_type:
            continue

        s.timestamp = time_iso
        s.platformDescription = (
            "Synthetic station for visualization over the Copernicus "
            "reanalysis grid; not an observed platform."
        )
        valid_stations.append(s)

    return valid_stations
