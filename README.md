# SamudraDrishti 3D

Integrated Ocean Intelligence Platform (SIH26067 Prototype)

## Overview
SamudraDrishti 3D is a web-based interactive 3D visualization platform that integrates numerical ocean model outputs and in-situ observations for the Bay of Bengal.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python 3.11

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
# Activate venv
# Windows: .\venv\Scripts\activate
# Unix: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Architecture
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, CesiumJS, Plotly.js
- **Backend**: FastAPI, Python, xarray, Pydantic

## API Routes
- `GET /health` - API health check

*(More routes will be added in Phase 2)*

## Demo Flow
*(To be detailed in Phase 11)*
