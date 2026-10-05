import numpy as np
import pandas as pd
import pytest
import xarray as xr
from fastapi.testclient import TestClient

from app import data_service
from app.main import app
from app.schemas import DataSourceId

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_get_sources():
    response = client.get("/api/sources")
    assert response.status_code == 200
    sources = response.json()
    ids = [s["id"] for s in sources]
    assert "local_demo" in ids
    assert "backend_demo" in ids
    assert "archived_dataset" in ids


def test_get_metadata():
    response = client.get(f"/api/metadata?source={DataSourceId.BACKEND_DEMO}")
    assert response.status_code == 200
    data = response.json()
    assert "timeSteps" in data
    assert "depthLevels" in data
    assert len(data["depthLevels"]) == 4


def test_get_layers():
    response = client.get(
        f"/api/layers?source={DataSourceId.BACKEND_DEMO}&variable=temperature&depth_m=0&time_index=0"
    )
    assert response.status_code == 200
    data = response.json()
    assert "points" in data
    assert len(data["points"]) > 0


def test_get_layers_invalid_depth():
    response = client.get(
        f"/api/layers?source={DataSourceId.BACKEND_DEMO}&variable=temperature&depth_m=999&time_index=0"
    )
    assert response.status_code == 422


def test_get_layers_invalid_time():
    response = client.get(
        f"/api/layers?source={DataSourceId.BACKEND_DEMO}&variable=temperature&depth_m=0&time_index=99"
    )
    assert response.status_code == 422


def test_get_stations():
    response = client.get(f"/api/stations?source={DataSourceId.BACKEND_DEMO}&time_index=0")
    assert response.status_code == 200
    stations = response.json()
    assert len(stations) == 16  # 10 argo + 5 buoy + 1 glider


def test_get_station():
    response = client.get(f"/api/stations/argo-01?source={DataSourceId.BACKEND_DEMO}&time_index=0")
    assert response.status_code == 200
    station = response.json()
    assert station["id"] == "argo-01"


def test_get_station_not_found():
    response = client.get(f"/api/stations/not-real?source={DataSourceId.BACKEND_DEMO}&time_index=0")
    assert response.status_code == 404


@pytest.fixture
def mock_nc_file(tmp_path):
    file_path = tmp_path / "test_archived.nc"

    times = pd.date_range("2025-06-01", periods=2)
    depths = [0, 50]
    lats = [10.0, 11.0]
    lons = [85.0, 86.0]

    ds = xr.Dataset(
        {
            "temperature": (("time", "depth", "lat", "lon"), np.random.rand(2, 2, 2, 2) + 20),
            "salinity": (("time", "depth", "lat", "lon"), np.random.rand(2, 2, 2, 2) + 30),
            "u_current": (("time", "depth", "lat", "lon"), np.random.rand(2, 2, 2, 2)),
            "v_current": (("time", "depth", "lat", "lon"), np.random.rand(2, 2, 2, 2)),
            "current_speed": (("time", "depth", "lat", "lon"), np.random.rand(2, 2, 2, 2)),
            "current_direction": (("time", "depth", "lat", "lon"), np.random.rand(2, 2, 2, 2)),
        },
        coords={
            "time": times,
            "depth": depths,
            "lat": lats,
            "lon": lons,
        }
    )
    # Inject a NaN to test NaN exclusion
    ds["temperature"].loc[dict(time=times[0], depth=0, lat=10.0, lon=85.0)] = np.nan

    ds.to_netcdf(file_path)
    return file_path


@pytest.fixture
def apply_mock_nc(monkeypatch, mock_nc_file):
    monkeypatch.setattr(data_service, "ARCHIVED_SUBSET_PATH", mock_nc_file)


def test_archived_unavailable(monkeypatch, tmp_path):
    monkeypatch.setattr(data_service, "ARCHIVED_SUBSET_PATH", tmp_path / "does_not_exist.nc")

    # 1. source unavailable
    resp = client.get("/api/sources")
    archived = next(s for s in resp.json() if s["id"] == "archived_dataset")
    assert archived["available"] is False

    # get_metadata -> 404
    resp = client.get(f"/api/metadata?source={DataSourceId.ARCHIVED_DATASET}")
    assert resp.status_code == 404


def test_archived_available_metadata(apply_mock_nc):
    resp = client.get("/api/sources")
    archived = next(s for s in resp.json() if s["id"] == "archived_dataset")
    assert archived["available"] is True

    resp = client.get(f"/api/metadata?source={DataSourceId.ARCHIVED_DATASET}")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["timeSteps"]) == 2
    assert data["geographicBounds"]["minLatitude"] == 10.0
    assert data["geographicBounds"]["maxLatitude"] == 11.0


def test_archived_layers(apply_mock_nc):
    # test valid
    resp = client.get(
        f"/api/layers?source={DataSourceId.ARCHIVED_DATASET}&variable=temperature&depth_m=0&time_index=0"
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["points"]) == 3  # one was NaN, grid is 2x2=4 points

    for pt in data["points"]:
        val = pt["temperatureC"]
        assert val is not None
        assert not np.isnan(val)

    # test invalid depth
    resp = client.get(
        f"/api/layers?source={DataSourceId.ARCHIVED_DATASET}&variable=temperature&depth_m=999&time_index=0"
    )
    assert resp.status_code == 422

    # test invalid time
    resp = client.get(
        f"/api/layers?source={DataSourceId.ARCHIVED_DATASET}&variable=temperature&depth_m=0&time_index=99"
    )
    assert resp.status_code == 422
