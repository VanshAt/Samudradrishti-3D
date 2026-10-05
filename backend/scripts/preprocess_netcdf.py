import argparse
import json
import math
import os
from datetime import UTC, datetime

import numpy as np
import xarray as xr


def main():
    parser = argparse.ArgumentParser(
        description="Preprocess NetCDF for SamudraDrishti 3D Archived Dataset"
    )
    parser.add_argument(
        "--input", default="backend/data/raw/bay_of_bengal_subset.nc", help="Input NetCDF file path"
    )
    parser.add_argument("--output-dir", default="backend/data/processed", help="Output directory")
    parser.add_argument("--dataset-id", default="unknown", help="Original dataset ID")
    parser.add_argument(
        "--source-label", default="Archived Copernicus Marine subset", help="Source label"
    )
    parser.add_argument("--min-longitude", type=float, default=80.0)
    parser.add_argument("--max-longitude", type=float, default=100.0)
    parser.add_argument("--min-latitude", type=float, default=5.0)
    parser.add_argument("--max-latitude", type=float, default=25.0)
    parser.add_argument("--depths", default="0,50,100,200", help="Comma-separated depths")
    parser.add_argument("--max-time-steps", type=int, default=8)
    parser.add_argument("--spatial-stride", type=int, default=4)
    parser.add_argument("--temperature-var", default="thetao")
    parser.add_argument("--salinity-var", default="so")
    parser.add_argument("--u-var", default="uo")
    parser.add_argument("--v-var", default="vo")

    args = parser.parse_args()

    input_path = os.path.abspath(args.input)
    if not os.path.exists(input_path):
        print(
            "No input NetCDF file found. Download a small authorized "
            "Bay of Bengal subset into ba   ckend/data/raw/ before running preprocessing."
        )
        exit(1)

    output_dir = os.path.abspath(args.output_dir)
    os.makedirs(output_dir, exist_ok=True)

    ds = xr.open_dataset(input_path)

    # Safely identify coordinates
    lon_name = next((n for n in ["longitude", "lon"] if n in ds.coords), None)
    lat_name = next((n for n in ["latitude", "lat"] if n in ds.coords), None)
    depth_name = next((n for n in ["depth", "deptht", "lev"] if n in ds.coords), None)
    time_name = next((n for n in ["time", "time_counter"] if n in ds.coords), None)

    if not all([lon_name, lat_name, depth_name, time_name]):
        print(f"Missing essential coordinates. Found: {list(ds.coords.keys())}")
        exit(1)

    avail_vars = list(ds.data_vars.keys())
    t_var = args.temperature_var if args.temperature_var in avail_vars else None
    s_var = args.salinity_var if args.salinity_var in avail_vars else None
    u_var = args.u_var if args.u_var in avail_vars else None
    v_var = args.v_var if args.v_var in avail_vars else None

    if not any([t_var, s_var, u_var, v_var]):
        print(f"None of requested variables found. Available: {avail_vars}")
        exit(1)

    # Subset geographically
    ds_sub = ds.sel(
        {
            lon_name: slice(args.min_longitude, args.max_longitude),
            lat_name: slice(args.min_latitude, args.max_latitude),
        }
    )

    # Subsample spatial
    ds_sub = ds_sub.isel(
        {
            lon_name: slice(None, None, args.spatial_stride),
            lat_name: slice(None, None, args.spatial_stride),
        }
    )

    target_depths = [float(d) for d in args.depths.split(",")]
    max_t = min(args.max_time_steps, ds_sub.sizes[time_name])

    ds_sub = ds_sub.isel({time_name: slice(0, max_t)})

    times = ds_sub[time_name].values
    time_iso_list = [str(np.datetime_as_string(t, unit="s")) + "Z" for t in times]

    lons = ds_sub[lon_name].values
    lats = ds_sub[lat_name].values

    temperature_json = {}
    salinity_json = {}
    currents_json = {}

    used_vars = []
    points_counts = {"temperature": 0, "salinity": 0, "currents": 0}

    for t_idx in range(max_t):
        t_key = str(t_idx)
        time_iso = time_iso_list[t_idx]

        temperature_json[t_key] = {}
        salinity_json[t_key] = {}
        currents_json[t_key] = {}

        for d_target in target_depths:
            d_key = str(int(d_target))
            ds_d = ds_sub.sel({depth_name: d_target}, method="nearest")

            # Temp
            if t_var:
                used_vars.append(t_var) if t_var not in used_vars else None
                points = []
                data = ds_d[t_var].isel({time_name: t_idx}).values
                for i, lat in enumerate(lats):
                    for j, lon in enumerate(lons):
                        val = data[i, j]
                        if not np.isnan(val):
                            points.append(
                                {
                                    "latitude": float(lat),
                                    "longitude": float(lon),
                                    "depthM": int(d_target),
                                    "temperatureC": round(float(val), 2),
                                }
                            )
                temperature_json[t_key][d_key] = {
                    "timeIso": time_iso,
                    "points": points,
                    "minValue": min((p["temperatureC"] for p in points), default=0),
                    "maxValue": max((p["temperatureC"] for p in points), default=0),
                }
                points_counts["temperature"] += len(points)

            # Salinity
            if s_var:
                used_vars.append(s_var) if s_var not in used_vars else None
                points = []
                data = ds_d[s_var].isel({time_name: t_idx}).values
                for i, lat in enumerate(lats):
                    for j, lon in enumerate(lons):
                        val = data[i, j]
                        if not np.isnan(val):
                            points.append(
                                {
                                    "latitude": float(lat),
                                    "longitude": float(lon),
                                    "depthM": int(d_target),
                                    "salinityPsu": round(float(val), 2),
                                }
                            )
                salinity_json[t_key][d_key] = {
                    "timeIso": time_iso,
                    "points": points,
                    "minValue": min((p["salinityPsu"] for p in points), default=0),
                    "maxValue": max((p["salinityPsu"] for p in points), default=0),
                }
                points_counts["salinity"] += len(points)

            # Currents
            if u_var and v_var:
                used_vars.append(u_var) if u_var not in used_vars else None
                used_vars.append(v_var) if v_var not in used_vars else None
                points = []
                u_data = ds_d[u_var].isel({time_name: t_idx}).values
                v_data = ds_d[v_var].isel({time_name: t_idx}).values
                for i, lat in enumerate(lats):
                    for j, lon in enumerate(lons):
                        u = u_data[i, j]
                        v = v_data[i, j]
                        if not np.isnan(u) and not np.isnan(v):
                            speed = math.sqrt(u**2 + v**2)
                            dir_deg = (math.degrees(math.atan2(u, v)) + 360) % 360
                            points.append(
                                {
                                    "latitude": float(lat),
                                    "longitude": float(lon),
                                    "depthM": int(d_target),
                                    "uMs": round(float(u), 3),
                                    "vMs": round(float(v), 3),
                                    "speedMs": round(speed, 3),
                                    "directionDegrees": round(dir_deg, 1),
                                }
                            )
                currents_json[t_key][d_key] = {
                    "timeIso": time_iso,
                    "points": points,
                    "minValue": 0,
                    "maxValue": max((p["speedMs"] for p in points), default=0),
                }
                points_counts["currents"] += len(points)

    # Metadata
    supported = []
    if t_var:
        supported.append("temperature")
    if s_var:
        supported.append("salinity")
    if u_var and v_var:
        supported.append("currents")

    metadata = {
        "source": "archived_dataset",
        "sourceLabel": args.source_label,
        "isDemo": False,
        "disclaimer": (
            "Archived data is preprocessed for demonstration "
            "and is not an operational warning service."
        ),
        "originalDatasetId": args.dataset_id,
        "processedAt": datetime.now(UTC).isoformat(),
        "timeSteps": time_iso_list,
        "depthLevels": [int(d) for d in target_depths],
        "supportedVariables": supported,
        "geographicBounds": {
            "minLongitude": float(lons.min()),
            "maxLongitude": float(lons.max()),
            "minLatitude": float(lats.min()),
            "maxLatitude": float(lats.max()),
        },
    }

    with open(os.path.join(output_dir, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)
    if t_var:
        with open(os.path.join(output_dir, "temperature.json"), "w") as f:
            json.dump(temperature_json, f)
    if s_var:
        with open(os.path.join(output_dir, "salinity.json"), "w") as f:
            json.dump(salinity_json, f)
    if u_var and v_var:
        with open(os.path.join(output_dir, "currents.json"), "w") as f:
            json.dump(currents_json, f)

    print(f"Preprocessed {input_path}")
    print(f"Output to {output_dir}")
    print(f"Selected times: {len(time_iso_list)}")
    print(f"Selected depths: {target_depths}")
    print(
        f"Points (total across all depths/times): Temp: {points_counts['temperature']}, "
        f"Sal: {points_counts['salinity']}, Cur: {points_counts['currents']}"
    )
    print(f"Used variables: {set(used_vars)}")


if __name__ == "__main__":
    main()
