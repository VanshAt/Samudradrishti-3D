# SamudraDrishti 3D - Frontend

## Day 5: Multi-Variable Ocean Model Visualization

This frontend implements a deterministic demo of a 3D ocean environment.

**Features included:**
- Temperature slices
- Salinity slices
- Current vectors
- Variable switching
- Depth selection
- Opacity control
- In-situ ARGO, buoy, and glider markers
- Explainable Demo Ocean Condition Insight

“Ocean Condition Insight is a deterministic, threshold-based demo decision-support feature. It is not a trained machine-learning model, operational forecast, or official marine advisory.”

### Demo flow:
1. Turn on salinity and choose 100 m.
2. Inspect spatial salinity patterns.
3. Switch to currents at surface.
4. Observe arrow direction and current-speed color.
5. Click an observation station.
7. Note that all displayed values are deterministic demo data.

## Day 6: Time-Aware Ocean Replay

Eight deterministic UTC time steps are available.
Temperature, salinity, and currents update with the active step.
Station readings and timestamps update with the active step.
Users can play/pause and change replay speed.
All values are local deterministic prototype data.
This is not a live feed, a forecast, or an operational monitoring system.

### Day 6 Demo flow:
1. Select a model variable.
2. Select a depth.
3. Move the time slider.
4. Press Play.
5. Change speed from 1× to 2×.
6. Select a buoy/ARGO/glider and observe changing measurements.
7. Explain that the system is replaying a deterministic demo time series.
