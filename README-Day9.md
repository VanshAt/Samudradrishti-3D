# SamudraDrishti 3D - Day 9

## Verification Instructions (Frontend & Fallback)

1. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
2. **Open the browser at** `http://localhost:5173`
3. **Verify the UI:**
   - In the left sidebar under "Data Source", you should see three options: "Local Demo", "Backend Demo API", and "Archived Dataset".
   - You should see "Backend Demo API" and "Archived Dataset" marked as "Unavailable" if the backend is not running.
   - The UI should safely fall back to "Local Demo".
   - The app should function exactly as it did before (Day 8), visualizing local demo data without errors.

## Backend Dependencies & Known Issue
You are using **Python 3.13**. At this time, `numpy` (and subsequently `pandas`, `xarray`, `netCDF4`) does not yet have official pre-compiled binaries (wheels) for Python 3.13 on Windows. Because of this, `pip` attempts to compile `numpy` from source, which fails due to missing C++ MSVC build tools in your environment.

**Resolution:**
To run the backend, we strongly recommend using **Python 3.10, 3.11, or 3.12**.
1. Re-create your virtual environment with an older Python version:
   ```bash
   py -3.12 -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Run the FastAPI server:
   ```bash
   cd backend
   .venv\Scripts\python -m uvicorn app.main:app --reload
   ```

## Copernicus Data Download Instructions

When you are ready to download real archived data for the "Archived Dataset" mode:

1. **Configure Credentials:**
   Ensure you have created the backend `.env` file from the example:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env` and insert your actual Copernicus Marine username and password.

2. **Download Subset:**
   Run the provided helper script. It uses your credentials securely from the environment variables to download a NetCDF subset to `backend/data/raw/`.
   ```bash
   cd backend
   .venv\Scripts\python scripts/download_copernicus_subset.example.py
   ```

3. **Preprocess Data (Convert NetCDF to JSON):**
   Once the `.nc` file is downloaded, convert it to the JSON format expected by the frontend:
   ```bash
   .venv\Scripts\python scripts/preprocess_netcdf.py
   ```

4. **Verify in UI:**
   Ensure the backend server is running (`uvicorn app.main:app --reload`), refresh the frontend, and select the **Archived Dataset** option in the Data Source selector.
