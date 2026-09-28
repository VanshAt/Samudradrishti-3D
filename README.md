# SamudraDrishti 3D

> **Interactive 3D Ocean Intelligence Platform for the Bay of Bengal**

SamudraDrishti 3D is a browser-based 3D ocean visualization platform that integrates numerical ocean-model layers with in-situ ocean observations. Built for **Smart India Hackathon 2026 — SIH26067**, the project makes complex ocean information easier to explore, compare, and understand through an interactive CesiumJS globe.

The platform visualizes key ocean parameters such as **temperature, salinity, and current vectors** across multiple depth levels and time steps. It also overlays observation platforms—including **ARGO floats, mooring buoys, and an autonomous glider route**—so users can inspect real-world-style ocean measurements in the same spatial context as model fields.

> **Important:** The current version uses deterministic local demonstration data. It is not connected to live INCOIS services, does not provide an operational forecast, and must not be used for marine-navigation, emergency-response, or safety decisions.

---

## Problem Statement

**SIH26067 — Develop a web-based interactive 3D visualization platform that integrates numerical ocean model outputs and in-situ observations.**

Ocean-model output is often complex, multi-dimensional, and difficult for non-specialists to interpret. SamudraDrishti 3D presents model fields and observation platforms together in one browser-native interface, helping users explore changing ocean conditions by:

- Geographic location
- Depth
- Variable type
- Observation platform
- UTC time step

---

## Features

### 3D Bay of Bengal Viewer

- Interactive CesiumJS globe centered on the Bay of Bengal.
- Pan, zoom, tilt, rotate, and reset-camera controls.
- Dark ocean-science dashboard interface.
- Preserved Cesium, CARTO, and OpenStreetMap attribution credits.
- Responsive layout with dedicated controls, viewer, inspector, and timeline.

### Numerical Ocean Model Layers

The platform supports one active model layer at a time:

- **Temperature** in °C
- **Salinity** in PSU
- **Ocean currents** in m/s, visualized as directional vector arrows

Model layers support the following depth slices:

```text
Surface / 0 m
50 m
100 m
200 m
```

Users can adjust model-layer opacity to inspect both the simulated field and observation platforms together.

### In-Situ Observation Platforms

The application includes deterministic demo platforms across the Bay of Bengal:

| Platform | Count | Visualization |
|---|---:|---|
| ARGO profiling floats | 10 | Cyan markers |
| Mooring buoys | 5 | Yellow markers |
| Autonomous glider | 1 | Purple marker with route track |

Each observation platform includes:

- Platform ID and type
- Latitude and longitude
- Observation quality flag
- Timestamp in UTC
- Temperature reading
- Salinity reading
- Current-speed reading
- Observation depth
- Platform description

Users can filter ARGO floats, mooring buoys, and gliders independently.

### Station Inspector

Click any ARGO float, buoy, or glider to open the Station Inspector.

The inspector displays:

- Platform name, ID, and type
- Observation quality status
- Geographic coordinates
- Current demo timestamp in UTC
- Depth
- Temperature, salinity, and current speed
- Platform description
- Explainable Ocean Condition Insight

### Time-Aware Ocean Replay

SamudraDrishti 3D includes a deterministic ocean replay system with eight fixed UTC time steps:

```text
21 Sep 2026, 00:00 UTC
21 Sep 2026, 06:00 UTC
21 Sep 2026, 12:00 UTC
21 Sep 2026, 18:00 UTC
22 Sep 2026, 00:00 UTC
22 Sep 2026, 06:00 UTC
22 Sep 2026, 12:00 UTC
22 Sep 2026, 18:00 UTC
```

Timeline capabilities:

- Previous and next time-step controls
- Timeline scrubbing
- Play and pause replay controls
- Playback speeds: `0.5×`, `1×`, and `2×`
- Time-aware temperature, salinity, and current fields
- Time-aware station readings and UTC timestamps
- Time-aware Ocean Condition Insight updates

> **Demo time series:** All changes are deterministic local prototype data. This is not live tracking, a live forecast feed, or an operational monitoring system.

### Explainable Ocean Condition Insight

SamudraDrishti 3D includes a compact station-level decision-support feature that evaluates local demonstration conditions using transparent configured thresholds.

The insight can consider:

- Observation quality state
- Elevated observed current speed
- Elevated surface temperature
- Active map context and selected depth

It classifies each selected station as:

| Level | Meaning |
|---|---|
| Routine | No elevated demo threshold is detected |
| Caution | One or more conditions should be monitored |
| Elevated | The station should be prioritized for review in the demo scenario |

Every insight includes:

- A deterministic score from `0–100`
- Clear reasons behind the score
- Suggested follow-up action
- A visible limitation notice

> **Explainable demo ocean insight based on configured thresholds. Not an operational forecast or trained ML model.**

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| 3D Geospatial Visualization | CesiumJS |
| Map Tiles | CARTO Dark Matter / OpenStreetMap |
| Icons | Lucide React |
| Backend foundation | FastAPI + Python |
| Scientific-data roadmap | xarray, NetCDF4, NumPy, pandas |
| Version control | Git + GitHub |

---

## Architecture

```text
┌───────────────────────────────────────────────────────────────┐
│                         React Frontend                         │
│                                                               │
│  Layer Controls ── CesiumJS Globe ── Station Inspector        │
│        │                   │                  │               │
│        │                   │                  └─ Ocean Insight│
│        │                   │                                  │
│        └────────── Timeline Control ────────────┐             │
└─────────────────────────────────────────────────┼─────────────┘
                                                  │
                                                  ▼
┌───────────────────────────────────────────────────────────────┐
│                  Deterministic Demo Data Layer                 │
│                                                               │
│  Temperature ── Salinity ── Currents ── Station Snapshots     │
│       │               │             │             │            │
│       └──── Depth + Time Index ─────┴─────────────┘            │
└───────────────────────────────────────────────────────────────┘
                                                  │
                                                  ▼
┌───────────────────────────────────────────────────────────────┐
│                  Future Scientific Data Pipeline               │
│                                                               │
│  NetCDF / xarray ── FastAPI ── Processed JSON / GeoJSON APIs │
└───────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```text
samudradrishti-3d/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CurrentLegend.tsx
│   │   │   ├── OceanConditionInsightPanel.tsx
│   │   │   ├── OceanViewer.tsx
│   │   │   ├── SalinityLegend.tsx
│   │   │   ├── TemperatureLegend.tsx
│   │   │   └── TimelineControl.tsx
│   │   ├── data/
│   │   │   ├── demoCurrents.ts
│   │   │   ├── demoSalinity.ts
│   │   │   ├── demoStationSnapshots.ts
│   │   │   ├── demoStations.ts
│   │   │   ├── demoTemperature.ts
│   │   │   └── demoTime.ts
│   │   ├── types/
│   │   │   └── ocean.ts
│   │   ├── utils/
│   │   │   ├── oceanColors.ts
│   │   │   └── oceanConditionInsight.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── backend/
│   ├── app/
│   │   └── main.py
│   ├── data/
│   └── scripts/
│       └── preprocess_netcdf.py
│
└── README.md
```

---

## Run Locally

### Prerequisites

- Node.js 18 or newer
- npm
- Python 3.11 or newer, if running the backend
- A Cesium Ion token is optional for enhanced Cesium services; the prototype can use CARTO map tiles without a token

### Frontend

```bash
git clone https://github.com/VanshAt/3D-Visualizer.git
cd 3D-Visualizer/frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

### Production Build

```bash
cd frontend
npm run build
```

### Backend Foundation

```bash
cd backend
python -m venv .venv
```

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend is currently a foundation for later FastAPI endpoints and NetCDF preprocessing. The Day 1–Day 6 prototype runs using local frontend demo data.

---

## Environment Variables

Create `frontend/.env` only if you want to configure a Cesium Ion token:

```env
VITE_CESIUM_ION_TOKEN=your_cesium_ion_token_here
```

Never commit `.env`. Use `frontend/.env.example` as the safe template:

```env
VITE_CESIUM_ION_TOKEN=your_cesium_ion_token_here
```

---

## Demo Flow

Use this flow for a 90-second presentation:

1. Open the 3D Bay of Bengal viewer.
2. Show ARGO floats, mooring buoys, and the glider route.
3. Turn on the **Temperature** layer at the surface.
4. Change the depth to `100 m` and explain the subsurface slice.
5. Switch to **Salinity** and inspect spatial variation.
6. Switch to **Currents** and show directional arrows and current speed.
7. Click an ARGO float or mooring buoy.
8. Inspect station measurements, quality status, and Ocean Condition Insight.
9. Use the timeline slider or Play control to replay changing conditions.
10. Explain that the platform synchronizes model layers and observation snapshots across time.

---

## Current Limitations

- Uses deterministic prototype datasets rather than live INCOIS, ARGO, buoy, glider, or satellite data.
- Does not yet ingest NetCDF files at runtime.
- Does not yet provide a production FastAPI data service.
- Does not yet calculate full model-versus-observation error metrics or vertical-profile MAE.
- Does not provide official marine safety guidance, navigation advice, or emergency warnings.
- Current station positions remain fixed during replay; ARGO drift and glider movement are not animated in the Day 6 prototype.
- The Ocean Condition Insight is rule-based and not a trained machine-learning system.

---

## Roadmap

### Day 7 — Model vs Observation Comparison

- Compare observed and modeled temperature, salinity, and current speed.
- Calculate absolute error and MAE.
- Add vertical-profile comparison chart.
- Add high/moderate/low agreement badge.

### Day 8 — Alerts and Demo Scenario

- Add current, wave-height, and model-mismatch threshold alerts.
- Add marine-safety demonstration scenario.
- Fly camera to a highlighted region and selected buoy.

### Day 9 — Scientific Data Pipeline

- FastAPI data API.
- NetCDF preprocessing with Python and xarray.
- Geographic subsetting and downsampling.
- Export browser-friendly JSON/GeoJSON model layers.

### Day 10 — Final Delivery

- UI and performance optimization.
- Documentation and architecture diagrams.
- Deployment preparation.
- End-to-end testing.
- Presentation/demo recording.

---

## Responsible Use

SamudraDrishti 3D is an educational and hackathon prototype.

It uses local deterministic demonstration data and threshold-based explainable logic. It is **not** an official ocean forecast, operational early-warning service, marine navigation product, or replacement for guidance from INCOIS, IMD, disaster-management authorities, or maritime safety agencies.

---

## License

MIT License

---

## Author

Built by **Vansh Dambhare** for Smart India Hackathon 2026.

- GitHub: [@VanshAt](https://github.com/VanshAt)
