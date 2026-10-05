from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import alerts, health, layers, metadata, sources, stations

app = FastAPI(
    title="SamudraDrishti 3D API",
    description="FastAPI Data Service for SamudraDrishti 3D Ocean Visualizer.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(sources.router, prefix="/api", tags=["Sources"])
app.include_router(metadata.router, prefix="/api", tags=["Metadata"])
app.include_router(layers.router, prefix="/api", tags=["Layers"])
app.include_router(stations.router, prefix="/api", tags=["Stations"])
app.include_router(alerts.router, prefix="/api", tags=["Alerts"])


@app.get("/")
def read_root():
    return {"message": "Welcome to the SamudraDrishti 3D API. Visit /docs for documentation."}
