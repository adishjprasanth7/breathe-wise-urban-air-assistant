# BreatheWise – Urban Air Quality Assistant

BreatheWise is a responsive environmental health and low-emission lifestyle web application built to help families and communities navigate severe winter smog and urban air pollution.

## Architecture

- **Frontend (`src/`)**: React 19, TypeScript (strict mode), Vite, Tailwind CSS, Recharts, Lucide icons.
  - **Open-Meteo Service (`src/services/openMeteo.ts`)**: Fetches live hourly and current pollutant concentrations (`PM2.5`, `PM10`, `O₃`, `NO₂`, `CO`) and city geocoding with request cancellation (`AbortController`), 5-minute coordinate caching, timeouts, and clearly labeled offline sample data fallback.
  - **US EPA AQI Engine (`src/utils/aqi.ts`)**: Implements official US EPA breakpoint linear interpolation (including the 2024 PM2.5 standard) and color-independent status categories.
  - **Local Persistence (`src/hooks/useLocalStorage.ts`)**: Stores household profile, daily checklist progress, and CO₂e impact logs locally in the browser without exposing personal data.
- **Backend (`server/`)**: Node.js + Express + TypeScript.
  - **Security**: `helmet`, strict `FRONTEND_URL` CORS allowlist, `express-rate-limit`, `16kb` JSON payload limit, Zod input validation, sanitized error responses, and server-side-only `GEMINI_API_KEY`.
  - **AI + Deterministic Fallback (`server/gemini.ts`, `server/fallback.ts`)**: Uses Google Gemini (`gemini-2.5-flash`) with strict system/user prompt separation and structured JSON output. Automatically falls back to deterministic, evidence-based safety rules (explicitly labeled as non-AI) when `GEMINI_API_KEY` is unconfigured or unavailable.

## Setup & Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   - `PORT=3001`
   - `FRONTEND_URL=http://localhost:5173`
   - `GEMINI_API_KEY=your_google_gemini_api_key` (optional for local demo; deterministic fallback works without a key)

3. **Run frontend and backend together**:
   ```bash
   npm run dev
   ```
   - Web app: `http://localhost:5173`
   - API server: `http://localhost:3001`

## Verification Commands

- **Run all tests (Vitest + React Testing Library + Supertest)**:
  ```bash
  npm run test
  ```
- **Typecheck & production build (frontend + server)**:
  ```bash
  npm run build && npm run build:server
  ```
- **Lint**:
  ```bash
  npm run lint
  ```

## API Documentation

### `GET /api/health`
Returns server health and whether `GEMINI_API_KEY` is configured (boolean only, never exposes the key).

### `POST /api/assistant`
Validates household context + current air quality readings and returns structured 7-part guidance (`riskSummary`, `actionsToday`, `indoorProtection`, `outdoorRecommendations`, `lowEmissionAlternatives`, `estimatedImpact`, `explanations`).
- **Rate limit**: 25 requests per 15 minutes per IP.
- **Max question length**: 500 characters.

## Demo Instructions

1. Open `http://localhost:5173` to view the live Dashboard (defaults to New Delhi if browser geolocation is not granted).
2. Test **Use My Location** or search any city (e.g., London, Beijing, Los Angeles) in the location bar.
3. Visit **AI Assistant**, adjust household size/age groups/HEPA status, and click a suggested question.
4. Check off tasks in **My Daily Plan**, review indoor safety rules in **Indoor Protection**, and log a walk/transit/no-idling action in **Impact Tracker**.

## Deployment

- **Frontend**: Deploy `dist/` (from `npm run build`) to Vercel, Netlify, or Cloudflare Pages. Set `VITE_API_BASE_URL` if hosting the backend on a separate origin.
- **Backend**: Build with `npm run build:server` and run `npm start` on Render, Railway, Fly.io, or Cloud Run. Set `PORT`, `FRONTEND_URL`, and `GEMINI_API_KEY` in the platform's secret manager.

## Limitations & Assumptions

- **AQI Standard**: Displays **US EPA AQI** computed from PM2.5 (2024 breakpoints) and PM10. If sensor readings are missing, BreatheWise displays `Unavailable` rather than fabricating values.
- **CO₂e Estimates**: Impact Tracker uses configurable default emission factors (`0.192 kg CO₂e/km` car, `0.041 kg CO₂e/km` transit, `0.036 kg CO₂e/min` idling, `0.417 kg CO₂e/kWh` grid). Individual actions reduce emissions but do not measurably alter city-wide ambient AQI on their own.
- **Medical Disclaimer**: Guidance is informational only and does not diagnose illnesses or replace professional medical advice.
