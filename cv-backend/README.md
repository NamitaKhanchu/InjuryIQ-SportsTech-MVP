# InjuryIQ CV Backend (MVP)

This backend powers the **CV Analysis** mode in the frontend by exposing a simple upload endpoint.

## Endpoints

- `GET /health` → `{ ok: true }`
- `POST /analyze` (multipart form-data with `video`) → JSON analysis result

The frontend calls `POST /cv/analyze` which is proxied in dev to this service.

## Run locally

From repo root:

```bash
python -m venv cv-backend/.venv
source cv-backend/.venv/bin/activate
pip install -r cv-backend/requirements.txt
uvicorn cv-backend.app.main:app --host 0.0.0.0 --port 4000 --reload
```

Then run the frontend:

```bash
npm install
npm run dev
```

Open `http://localhost:3000/analysis` → **CV Analysis** → upload a video.

## Notes

- Uses **MediaPipe Pose** for landmark detection + simple heuristics to estimate knee flexion angles and a valgus proxy.
- This is an MVP baseline intended to be iterated toward the exact overlay/event logic you want.

