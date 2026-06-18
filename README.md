# Weather Intelligence

Production-grade frontend weather dashboard built with **Vite + React + TypeScript**. It uses only free public **Open-Meteo** APIs, runs locally with Node.js/npm, and is ready to be served as a static Dockerized app through **nginx**.

## Features

- Modern responsive dashboard with glass cards, animated gradients, dark mode, and smooth transitions.
- City autocomplete, browser geolocation, recent searches, favorite cities, and city comparison.
- Current weather, hourly forecast, 7-day forecast, temperature/rain charts, and copyable weather report.
- Rule-based comfort score, rain/wind/heat/cold/storm insights, and planning recommendations.
- Frontend-only architecture: no backend, login, database, Firebase, Gemini key, or private API key.

## Public APIs

- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`

The browser calls these APIs directly. No secrets are required.

## Environment Notes

This app does **not** need API keys or sensitive environment variables.

- `.env.example` is included only as documentation for evaluators.
- Do not add `GEMINI_API_KEY`, Firebase config, private tokens, passwords, or client data.
- If a future non-secret public build value is needed, use Vite's `VITE_` prefix, for example `VITE_APP_NAME`.

## API Visibility And Security

Open-Meteo API URLs are public and will be visible in browser DevTools, network logs, and compiled frontend JavaScript. That is normal for a frontend-only app.

**What is secure here:**

- No private API keys are used.
- No secrets are shipped in `.env`, source code, Docker image, or browser bundle.
- Open-Meteo is intentionally called as a public weather-data service.

**What cannot be hidden in a frontend-only app:**

- Public endpoint URLs.
- Request parameters such as latitude, longitude, city name, and forecast fields.

If a future project uses private API keys, those calls must move to a backend/API proxy. Do not place private keys in React/Vite code because users can inspect frontend bundles.

## Local Run In Ubuntu WSL

Run all assignment commands inside Ubuntu WSL, not Windows PowerShell or Command Prompt.

```bash
pwd
node -v
npm -v
npm install
npm run dev
```

Open the URL shown by Vite, usually:

```text
http://localhost:3000
```

Build production assets:

```bash
npm run build
```

Run TypeScript validation:

```bash
npm run lint
```

## Dockerization

The project is fully containerized using a multi-stage Docker build, served in production by nginx.

### Files Included

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage build: compiles the app, then serves it via nginx |
| `.dockerignore` | Excludes local/cache files (`node_modules`, `.git`, `.env`, etc.) from the build context |
| `nginx.conf` | Configures the production web server and SPA routing |

### Step 1 — Build the Image

Run from the project root in Ubuntu WSL:

```bash
docker build -t weather-intelligence .
```

### Step 2 — Run the Container

```bash
docker run --rm -p 8080:8080 weather-intelligence
```

### Step 3 — Verify It's Running

Open in a browser:

```text
http://localhost:8080
```

Check the health endpoint:

```text
http://localhost:8080/health
```

It should return `ok`.

### How the Build Works

The `Dockerfile` uses two stages so the final image only contains what's needed to *serve* the app, not build it:

1. **Build stage** (`node:20-alpine`)
   - Installs dependencies with `npm ci` for a clean, reproducible install.
   - Runs `npm run build` to produce the static `dist/` output.
2. **Runtime stage** (`nginx:1.27-alpine`)
   - Copies only `nginx.conf` and the compiled `dist/` folder from the build stage.
   - Node.js, source files, and build tooling are discarded, keeping the final image small and free of unnecessary dependencies.

### Nginx Configuration

`nginx.conf` listens on container port `8080` and serves files from:

```text
/usr/share/nginx/html
```

Key routes:

- `/` — serves the React app, with SPA fallback (`try_files $uri $uri/ /index.html;`) so browser refresh works correctly on frontend routes.
- `/assets/` — serves hashed static assets with long-term, immutable cache headers.
- `/health` — returns `ok` for simple container/load-balancer health checks.

## Testing Checklist

- Search `Chennai` and confirm current weather + forecast loads.
- Search `London` and confirm dashboard updates.
- Search `asdfghcity` and confirm invalid-city handling.
- Use "My Location" and confirm permission handling.
- Toggle Celsius/Fahrenheit and km/h/mph.
- Toggle light/dark mode.
- Add and remove a favorite city.
- Confirm recent searches persist after refresh.
- Compare two cities side-by-side.
- Run Docker container and verify `/health` returns `ok`.