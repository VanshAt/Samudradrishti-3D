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

## Day 7: Model vs Observation Comparison

- Users can select an ARGO float, buoy, or glider.
- Users can compare deterministic observed and model vertical profiles.
- Profiles include 0 m, 50 m, 100 m, and 200 m.
- Temperature, salinity, and current speed are compared.
- The UI shows:
  - observed values
  - model values
  - absolute differences
  - MAE
  - overall agreement score
  - High / Moderate / Low Agreement status
  - vertical Plotly profile chart
- Observed profile line is solid cyan/blue.
- Model profile line is dashed orange.
- The depth axis is reversed so depth increases downward.
- Timeline changes update comparison values and profiles deterministically.

“Demo comparison data only. This is not a validation of an operational ocean forecast.”

“Observed and model values are deterministic prototype data for interface demonstration.”

### Demo flow:
1. Select an ARGO float, buoy, or glider.
2. Open the Model vs Observation tab.
3. Review the selected-depth comparison at 0 m, 50 m, 100 m, or 200 m.
4. Inspect MAE and agreement status.
5. Switch between Temperature, Salinity, and Current Speed charts.
6. Move the time slider and observe the deterministic comparison update.
7. Note that the comparison is an interface demonstration, not an operational forecast validation.

### Dependencies:
This project uses Plotly (`plotly.js-dist-min` and `react-plotly.js`) for rendering the model profile charts.

## Day 8: Demo Alert Center and Marine Safety Scenario

Alert Center uses deterministic local thresholds.
Alert categories:
- Elevated Current
- Elevated Wave Condition
- Model-Observation Mismatch
- Observation Quality Review

Alerts are time-aware and linked to map locations/stations.
Users can filter, inspect, and focus alerts on the 3D globe.
The Demo Scenario guides a user to a selected Bay of Bengal review condition.

“Demo alert logic based on deterministic prototype thresholds. Not an operational marine warning.”

“Do not use this prototype for navigation, emergency response, or safety decisions.”

### Demo flow:
1. Set the timeline to a demo time step.
2. Open Alert Center.
3. Filter High alerts.
4. Select an alert.
5. Review trigger reasons and selected station data.
6. Focus alert on map.
7. Launch Bay of Bengal Marine Safety Review.
8. Show currents at surface and linked station comparison.
9. State all data and alerts are deterministic prototype information.
