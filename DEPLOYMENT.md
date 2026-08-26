# Deploying Ace Tracker

This version is designed to be hosted as one HTTPS web application. Every browser gets a private, HTTP-only session cookie; its push subscription and reminders are stored separately from other users.

## What the host must provide

- A public HTTPS domain. Web Push does not work on a normal HTTP website.
- A Node 24 runtime or Docker.
- One persistent disk/volume mounted at `/data`.
- One running application instance. SQLite is deliberately used for a simple, reliable single-instance deployment; do not scale the container to multiple replicas.

## Configure secrets

1. Copy `backend/.env.example` to `backend/.env`.
2. Keep the same VAPID key pair forever. Changing it invalidates every existing browser subscription.
3. Set these values in the deployment host's secret/environment settings instead of committing the file:

```dotenv
PORT=3000
NODE_ENV=production
COOKIE_SECURE=true
DATA_DIR=/data
VAPID_PUBLIC_KEY=your_real_public_key
VAPID_PRIVATE_KEY=your_real_private_key
VAPID_SUBJECT=mailto:your-real-email@example.com
```

## Docker deployment

On a server with Docker and Docker Compose:

```bash
docker compose up -d --build
```

The included compose file creates the persistent `ace_tracker_data` volume automatically. Put a TLS-enabled reverse proxy or your hosting provider's HTTPS domain in front of port 3000; do not publish this application as plain HTTP on the internet.

## Verify after deployment

1. Open `https://your-domain.example` in Chrome, Edge, or another browser that supports Web Push.
2. Press `Ctrl+F5` once to update the service worker.
3. Open **Settings → Manage Notifications** and enable notifications.
4. Use **Send a Test Notification** in the app. The test is limited to that browser session and cannot notify other users.
5. Create a task reminder, close the Ace Tracker tab, and keep the browser itself running. The notification should still arrive at the scheduled time.

## Privacy and multi-device behavior

- Each device/browser receives a separate private session, push subscription, and reminder schedule.
- One person's browser cannot send a test push to another person's browser.
- Task lists, streaks, and progress currently remain in that browser's local storage. They are intentionally not copied to other devices.
- True sign-in and cross-device task/progress sync is a separate product feature. It needs an account system and a shared cloud database; do not claim that it exists until it is built.

## Backups and operations

- Back up the persistent `/data` volume regularly. It contains `ace-tracker.sqlite`, which holds sessions, subscriptions, and reminders.
- Keep the server/container running continuously, otherwise reminders cannot be sent.
- Do not commit `backend/.env`, the SQLite database, or old `push-data.json` files. They are ignored by `.gitignore`.
