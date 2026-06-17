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
- If a future non-secret public build value is needed, use Vite’s `VITE_` prefix, for example `VITE_APP_NAME`.

## API Visibility And Security

Open-Meteo API URLs are public and will be visible in browser DevTools, network logs, and compiled frontend JavaScript. That is normal for a frontend-only app.

What is secure here:

- No private API keys are used.
- No secrets are shipped in `.env`, source code, Docker image, or browser bundle.
- Open-Meteo is intentionally called as a public weather-data service.

What cannot be hidden in a frontend-only app:

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

## Docker Setup

The project includes:

- `Dockerfile`: multi-stage production build.
- `.dockerignore`: excludes local/cache files from the image.
- `nginx.conf`: serves the React static build and supports SPA routing.

Build the image from Ubuntu WSL:

```bash
docker build -t weather-intelligence .
```

Run the container:

```bash
docker run --rm -p 8080:8080 weather-intelligence
```

Open:

```text
http://localhost:8080
```

Health check:

```text
http://localhost:8080/health
```

## How Docker Works Here

The `Dockerfile` has two stages:

1. **Build stage**: uses `node:20-alpine`, installs dependencies with `npm ci`, and runs `npm run build`.
2. **Runtime stage**: uses `nginx:1.27-alpine` and copies the generated `dist/` files into nginx’s web root.

This keeps the final image smaller and avoids shipping Node.js build tooling in the runtime container.

## How nginx Works Here

`nginx.conf` listens on container port `8080` and serves files from:

```text
/usr/share/nginx/html
```

Important routes:

- `/`: serves the React app.
- `/assets/`: serves hashed static assets with long-term cache headers.
- `/health`: returns `ok` for simple Docker/container validation.
- SPA fallback: `try_files $uri $uri/ /index.html;` keeps browser refresh working on frontend routes.

## Testing Checklist

- Search `Chennai` and confirm current weather + forecast loads.
- Search `London` and confirm dashboard updates.
- Search `asdfghcity` and confirm invalid-city handling.
- Use “My Location” and confirm permission handling.
- Toggle Celsius/Fahrenheit and km/h/mph.
- Toggle light/dark mode.
- Add and remove a favorite city.
- Confirm recent searches persist after refresh.
- Compare two cities side-by-side.
- Run Docker container and verify `/health` returns `ok`.

## Submission Evidence To Capture

- WSL terminal showing `pwd`, `node -v`, and `npm -v`.
- WSL terminal showing `npm install`, `npm run dev`, and `npm run build`.
- Browser screenshot of local app.
- WSL terminal showing `docker build -t weather-intelligence .`.
- WSL terminal showing `docker run --rm -p 8080:8080 weather-intelligence`.
- Browser screenshot of `http://localhost:8080`.
- Browser screenshot of `http://localhost:8080/health`.
- Screenshots for Chennai, London, invalid city, dark mode, and comparison mode.
