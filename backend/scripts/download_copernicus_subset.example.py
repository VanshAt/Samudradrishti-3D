import os

# -----------------------------------------------------------------------------
# EXAMPLE SCRIPT ONLY - DO NOT RUN AUTOMATICALLY
# -----------------------------------------------------------------------------
# This script is an example of how one might download a real NetCDF subset
# from Copernicus Marine Service using their Python API.
#
# Usage Instructions:
# 1. Create a free account at https://data.marine.copernicus.eu/
# 2. Verify the correct dataset ID and variable names from their catalogue.
# 3. Set your credentials as environment variables:
#    set COPERNICUSMARINE_SERVICE_USERNAME=your_username
#    set COPERNICUSMARINE_SERVICE_PASSWORD=your_password
# 4. Run this script manually to download raw data.
# 5. Run scripts/preprocess_netcdf.py on the downloaded file.
# -----------------------------------------------------------------------------


def main():
    username = os.environ.get("COPERNICUSMARINE_SERVICE_USERNAME")
    password = os.environ.get("COPERNICUSMARINE_SERVICE_PASSWORD")

    if not username or not password:
        print("Error: Copernicus credentials not found in environment variables.")
        print("Set COPERNICUSMARINE_SERVICE_USERNAME and COPERNICUSMARINE_SERVICE_PASSWORD.")
        exit(1)

    # Note: Replace this dataset ID with the verified dataset ID from the catalogue.
    DATASET_ID = "REPLACE_WITH_VERIFIED_DATASET_ID"

    # We only download a small Bay of Bengal bounding box to prevent large downloads.
    min_lon, max_lon = 80.0, 100.0
    min_lat, max_lat = 5.0, 25.0
    min_depth, max_depth = 0.0, 200.0

    print(f"This is an example script. It would download {DATASET_ID}")
    print(
        f"Bounds: Lon {min_lon}-{max_lon}, Lat {min_lat}-{max_lat}, Depth {min_depth}-{max_depth}"
    )

    # Example logic using copernicusmarine library
    # (not actually run here to prevent automatic requests):
    # import copernicusmarine
    # copernicusmarine.subset(
    #     dataset_id=DATASET_ID,
    #     variables=["thetao", "so", "uo", "vo"],
    #     minimum_longitude=min_lon,
    #     maximum_longitude=max_lon,
    #     minimum_latitude=min_lat,
    #     maximum_latitude=max_lat,
    #     minimum_depth=min_depth,
    #     maximum_depth=max_depth,
    #     start_datetime="2026-09-21T00:00:00",
    #     end_datetime="2026-09-22T18:00:00",
    #     output_filename="backend/data/raw/bay_of_bengal_subset.nc",
    #     username=username,
    #     password=password,
    #     force_download=True
    # )

    print("Download logic is commented out to prevent accidental large downloads.")
    print("Uncomment and run manually when verified.")


if __name__ == "__main__":
    main()
