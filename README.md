# NodePlanner

Meshtastic mesh network visualizer and RF coverage planner.

## Structure

```
NodePlanner/
  frontend/   ← React + TypeScript + Vite
  backend/    ← Flask API + MQTT ingest + coverage engine
```

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then edit .env
python app.py
# → http://localhost:5000/api/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Tech Stack

| Layer    | Tech                              |
|----------|-----------------------------------|
| Frontend | React 18, TypeScript, Vite, Leaflet |
| Backend  | Flask, Flask-SocketIO, SQLAlchemy |
| DB       | SQLite (dev) → Postgres (prod)    |
| Comms    | MQTT (paho), WebSocket            |
| Terrain  | AWS Terrarium tiles (free)        |
