# Ace Tracker

A personal habit, fitness, and productivity PWA with XP, streaks, golden days,
charts, and background Web Push reminders.

## Architecture

```
        Ace Tracker PWA (static frontend: HTML/CSS/JS)
        deployed on Vercel
                 │            (HTTPS)
                 ▼
        Ace Tracker backend (Express + Web Push + SQLite)
        deployed on its own persistent host (e.g. Render / Docker)
```

The frontend and the push/reminder backend are **two separate deployments**:

- **Frontend** — `index.html`, `style.css`, `script.js`, `service-worker.js`,
  `manifest.json`, `icon.png`. Static, no build framework. Hosted on **Vercel**.
- **Backend** — `backend/server.js`. Express + Web Push + persistent SQLite.
  Hosted on a **persistent** host (Render, Railway, or Docker). It **must stay
  running** so scheduled reminders can be delivered, and it holds the push
  subscriptions/reminders in SQLite. Do **not** run this on Vercel's serverless
  runtime (no persistent disk, no long-running worker).

## Local development

You need Node 22.5+ (SQLite `node:sqlite`) or Docker.

```bash
# 1. Install frontend deps (root) and backend deps
npm install
npm run install:backend

# 2. Configure the backend secrets for local push testing
cp backend/.env.example backend/.env
#   edit backend/.env and set real VAPID keys (see below)

# 3. Start the app (serves frontend + backend on http://localhost:3000)
npm run dev
```

Open http://localhost:3000. Web Push works locally only over HTTPS or
`http://localhost` (localhost is treated as a secure context by browsers).

### Configure Web Push VAPID keys

Generate a key pair once and keep them forever (changing them invalidates all
existing browser subscriptions):

```bash
npx web-push generate-vapid-keys
```

Put the output into `backend/.env`:

```dotenv
VAPID_PUBLIC_KEY=<public>
VAPID_PRIVATE_KEY=<private>
VAPID_SUBJECT=mailto:you@example.com
```

## Deploying the frontend to Vercel

1. Push this repository to **your** GitHub account (commands below).
2. In Vercel, **Import Project** → select the repo.
3. Framework preset: **Other** (this is a static site). Leave build/output as
   detected; `vercel.json` in the repo sets the build command and rewrites.
4. Add a build-time environment variable in **Project Settings →
   Environment Variables**:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://<your-backend-host>.com` (no trailing slash) |

   This is the base URL of the Ace Tracker backend. During `npm run build`,
   `scripts/gen-api-config.js` writes it into `api-config.js`, which
   `script.js` reads. If unset, the frontend falls back to the same-origin
   `/api` path (single-node deployment).

5. Deploy. After deploy, verify the PWA: open the site, `Ctrl+F5` once to pick
   up the service worker, then test a notification.

## Deploying the backend

The backend needs a persistent host and a persistent disk/volume for SQLite.
Render (web service) and Docker both satisfy this. The backend requires these
environment variables — set them in the host's dashboard, **not** in a
committed file:

| Variable | Required | Example |
|----------|----------|---------|
| `NODE_ENV` | yes | `production` |
| `PORT` | yes | `3000` (or the host's expected port) |
| `COOKIE_SECURE` | yes | `true` |
| `DATA_DIR` | yes | `/data` (persistent volume) |
| `VAPID_PUBLIC_KEY` | yes | your public VAPID key |
| `VAPID_PRIVATE_KEY` | yes | your private VAPID key |
| `VAPID_SUBJECT` | yes | `mailto:you@example.com` |
| `CORS_ORIGIN` | recommended | `https://ace-tracker.vercel.app` |

`CORS_ORIGIN` is a comma-separated list of the frontend origin(s) allowed to
call the API with the private session cookie. For a single-node deployment
(frontend and backend served together) you can omit it — same-origin requests
need no CORS.

Docker is supported via `Dockerfile` / `docker-compose.yml` (persistent
`/data` volume).

## Important notes

- The frontend is static with no build framework; the CDN scripts
  (Chart.js, canvas-confetti) load from jsdelivr and therefore need network
  on first load (the service worker caches them on use for offline).
- Web Push requires HTTPS. Vercel provides HTTPS automatically; the backend
  must also be behind HTTPS.
- Do not scale the SQLite backend to multiple replicas (single-instance only).
- Back up the persistent SQLite volume; it holds sessions, push
  subscriptions, and reminders.

See `DEPLOYMENT.md` for more backend/operations detail.
