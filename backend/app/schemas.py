from enum import StrEnum

from pydantic import BaseModel


class DataSourceId(StrEnum):
    LOCAL_DEMO = "local_demo"
    BACKEND_DEMO = "backend_demo"
    ARCHIVED_DATASET = "archived_dataset"


class OceanVariable(StrEnum):
    TEMPERATURE = "temperature"
    SALINITY = "salinity"
    CURRENTS = "currents"


class StationType(StrEnum):
    ARGO = "argo"
    BUOY = "buoy"
    GLIDER = "glider"


class QualityFlag(StrEnum):
    GOOD = "GOOD"
    SUSPECT = "SUSPECT"
    PENDING = "PENDING"


class LatestObservation(BaseModel):
    temperatureC: float
    salinityPsu: float
    currentSpeedMs: float


class RoutePoint(BaseModel):
    latitude: float
    longitude: float


class ObservationStation(BaseModel):
    id: str
    name: str
    type: StationType
    latitude: float
    longitude: float
    timestamp: str
    qualityFlag: QualityFlag
    latestObservation: LatestObservation
    depthM: float
    platformDescription: str
    route: list[RoutePoint] | None = None


class TemperatureGridPoint(BaseModel):
    latitude: float
    longitude: float
    depthM: int
    temperatureC: float


class SalinityGridPoint(BaseModel):
    latitude: float
    longitude: float
    depthM: int
    salinityPsu: float


class CurrentGridPoint(BaseModel):
    latitude: float
    longitude: float
    depthM: int
    uMs: float
    vMs: float
    speedMs: float
    directionDegrees: float


class LayerResponse(BaseModel):
    source: DataSourceId
    variable: OceanVariable
    depthM: int
    timeIndex: int
    timeIso: str
    units: str
    minValue: float
    maxValue: float
    points: list[TemperatureGridPoint] | list[SalinityGridPoint] | list[CurrentGridPoint]
    isDemo: bool
    sourceLabel: str
    disclaimer: str


class SourceStatus(BaseModel):
    id: DataSourceId
    label: str
    available: bool
    isDemo: bool
    description: str
    lastProcessedAt: str | None = None
    originalDatasetId: str | None = None


class SourceMetadata(BaseModel):
    source: DataSourceId
    sourceLabel: str
    isDemo: bool
    disclaimer: str
    originalDatasetId: str | None = None
    processedAt: str | None = None
    timeSteps: list[str]
    depthLevels: list[int]
    supportedVariables: list[OceanVariable]
    geographicBounds: dict[str, float]


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
