# Lunch Lottery

A fair, playful lunch-draw for your team. Pick cards, reveal winners, and keep a
local history — all in the browser.

This is a **fully static single-page app** (Vite + React + TanStack Router). There
is **no backend and no database**: all state lives in the visitor's browser via
`localStorage`. Interactions work, but nothing is saved to a server — clearing the
browser storage resets the app to its sample data.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build & preview the static output

```bash
npm run build      # outputs static files to dist/
npm run preview    # serve the built dist/ locally
```

## Other scripts

```bash
npm run lint       # eslint
npm run format     # prettier --write
```

## Deploy

The app ships as static files served by nginx in a container. See
[DEPLOYMENT.md](./DEPLOYMENT.md) for the full Coolify + custom-domain runbook.

```bash
# Build and run the production image locally:
docker build -t lunch-lottery .
docker run --rm -p 8080:80 lunch-lottery   # http://localhost:8080
```
