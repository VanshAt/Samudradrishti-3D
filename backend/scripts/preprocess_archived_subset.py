from pathlib import Path

import numpy as np
import xarray as xr

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "backend" / "data"

INPUT_FILE = DATA_DIR / "bob_glorys_20250601_20250604_raw.nc"
OUTPUT_FILE = DATA_DIR / "archived_subset.nc"

TARGET_DEPTHS = [0, 50, 100, 200]


def main() -> None:
    if not INPUT_FILE.exists():
        raise FileNotFoundError(f"Raw Copernicus file not found: {INPUT_FILE}")

    with xr.open_dataset(INPUT_FILE) as raw:
        print("Variables:", list(raw.data_vars))
        print("thetao units:", raw["thetao"].attrs.get("units"))
        print("so units:", raw["so"].attrs.get("units"))
        print("uo units:", raw["uo"].attrs.get("units"))
        print("vo units:", raw["vo"].attrs.get("units"))

        ds = raw.rename(
            {
                "latitude": "lat",
                "longitude": "lon",
            }
        )

        available_depths = [float(value) for value in ds["depth"].values]
        print("Available source depths:", available_depths)

        ds_depth = ds.sel(depth=TARGET_DEPTHS, method="nearest").load()

    selected_depths = [float(value) for value in ds_depth["depth"].values]
    print("Selected source depths:", selected_depths)

    # Preserve the project/API depth contract even when source depths differ slightly.
    ds_depth = ds_depth.assign_coords(depth=TARGET_DEPTHS)

    thetao_units = ds["thetao"].attrs.get("units", "").strip().lower()
    if thetao_units in {"k", "kelvin", "kelvins"}:
        temperature = ds_depth["thetao"] - 273.15
    else:
        temperature = ds_depth["thetao"].copy()

    temperature.attrs["units"] = "degC"
    temperature.attrs["long_name"] = "Sea water temperature"

    salinity = ds_depth["so"].copy()
    salinity.attrs["units"] = "PSU"
    salinity.attrs["long_name"] = "Sea water salinity"

    u_current = ds_depth["uo"].copy()
    v_current = ds_depth["vo"].copy()
    current_speed = np.hypot(u_current, v_current)
    current_direction = (np.degrees(np.arctan2(v_current, u_current)) + 360) % 360

    u_current.attrs["units"] = "m/s"
    v_current.attrs["units"] = "m/s"
    current_speed.attrs["units"] = "m/s"
    current_direction.attrs["units"] = "degrees"
    current_direction.attrs["description"] = "Direction of velocity vector, clockwise from east"

    out = xr.Dataset(
        {
            "temperature": temperature,
            "salinity": salinity,
            "u_current": u_current,
            "v_current": v_current,
            "current_speed": current_speed,
            "current_direction": current_direction,
        },
        attrs={
            "source": "Copernicus Marine GLOBAL_MULTIYEAR_PHY_001_030",
            "dataset_id": "cmems_mod_glo_phy_my_0.083deg_P1D-m",
            "processed_for": "SamudraDrishti Day 10 archived dataset mode",
            "processing_note": (
                "Source vertical levels selected by nearest neighbour and "
                "labelled to the application depth contract: 0, 50, 100, 200 m."
            ),
        },
    )

    encoding = {
        variable: {"zlib": True, "complevel": 4}
        for variable in out.data_vars
    }

    out.to_netcdf(OUTPUT_FILE, encoding=encoding)

    print(f"Preprocessed file written to: {OUTPUT_FILE}")
    print("Output variables:", list(out.data_vars))
    print("Output depths:", [float(value) for value in out["depth"].values])
    print(
        "Temperature range (degC):",
        float(out["temperature"].min()),
        "to",
        float(out["temperature"].max()),
    )
    print(
        "Salinity range (PSU):",
        float(out["salinity"].min()),
        "to",
        float(out["salinity"].max()),
    )


if __name__ == "__main__":
    main()
