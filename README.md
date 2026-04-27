<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0d1b37dd-514b-4cf8-8cd1-26a2d526f47e

## Run Locally

**Prerequisites:** Node.js (recommended: Node 22 LTS; minimum: Node 20.19+)

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## CV Analysis backend (video upload)

The **CV Analysis** tab in `src/pages/AnalysisPage.tsx` uploads a video to `POST /cv/analyze`.

- In local dev, Vite proxies `/cv/*` to a backend (default `http://localhost:4000`) via `vite.config.ts`.
- The backend lives in `cv-backend/` and exposes `POST /analyze` (the proxy rewrites `/cv/analyze` → `/analyze`).

### Run the CV backend locally

```bash
python -m venv cv-backend/.venv
source cv-backend/.venv/bin/activate
pip install -r cv-backend/requirements.txt
uvicorn cv-backend.app.main:app --host 0.0.0.0 --port 4000 --reload
```

Then in another terminal run the frontend:

```bash
npm run dev
```

Open `http://localhost:3000/analysis` → **CV Analysis** → upload a video.

### If install breaks (native deps / Tailwind)
Run a clean reinstall:

`npm run reinstall`

### Security note (important)
This project currently makes `GEMINI_API_KEY` available to frontend code via Vite config. That’s convenient for an MVP/demo, but **it is not safe for production** (browser users can extract the key).

For production-readiness, the safe path is to call Gemini from a server (or serverless function) you control and keep the key there.
