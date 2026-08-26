require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const webpush = require("web-push");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true" || (
    NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false"
);
const SESSION_TTL_DAYS = 90;
const SESSION_RATE_WINDOW_MS = 15 * 60 * 1000;
const SESSION_RATE_LIMIT = 40;
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, "data"));
const DATABASE_FILE = path.join(DATA_DIR, "ace-tracker.sqlite");

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    console.error("Missing VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, or VAPID_SUBJECT.");
    process.exit(1);
}

fs.mkdirSync(DATA_DIR, { recursive: true });
webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const db = new DatabaseSync(DATABASE_FILE);
const sessionAttemptsByIp = new Map();
db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
        endpoint TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        subscription_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS subscriptions_session_id_idx ON subscriptions(session_id);

    CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        task_id TEXT NOT NULL,
        reminder_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (endpoint) REFERENCES subscriptions(endpoint) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS reminders_session_id_idx ON reminders(session_id);
    CREATE INDEX IF NOT EXISTS reminders_endpoint_idx ON reminders(endpoint);
`);

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "20kb" }));
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (NODE_ENV === "production") {
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
});

function nowIso() {
    return new Date().toISOString();
}

function cleanExpiredSessions() {
    db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(nowIso());
}

function readCookie(req, name) {
    const cookieHeader = req.headers.cookie || "";
    for (const part of cookieHeader.split(";")) {
        const [key, ...valueParts] = part.trim().split("=");
        if (key === name) {
            try {
                return decodeURIComponent(valueParts.join("="));
            } catch {
                return null;
            }
        }
    }
    return null;
}

function getSession(req) {
    const id = readCookie(req, "ace_session");
    if (!id) return null;

    const session = db.prepare(
        "SELECT id, expires_at FROM sessions WHERE id = ?"
    ).get(id);

    if (!session || new Date(session.expires_at) <= new Date()) {
        if (session) db.prepare("DELETE FROM sessions WHERE id = ?").run(id);
        return null;
    }

    const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
    db.prepare(
        "UPDATE sessions SET last_seen_at = ?, expires_at = ? WHERE id = ?"
    ).run(nowIso(), expiresAt, id);

    return { id, expiresAt };
}

function setSessionCookie(res, session) {
    res.cookie("ace_session", session.id, {
        httpOnly: true,
        sameSite: "strict",
        secure: COOKIE_SECURE,
        maxAge: SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
        path: "/"
    });
}

function createSession() {
    cleanExpiredSessions();
    const session = {
        id: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString()
    };

    db.prepare(
        "INSERT INTO sessions (id, created_at, last_seen_at, expires_at) VALUES (?, ?, ?, ?)"
    ).run(session.id, nowIso(), nowIso(), session.expiresAt);

    return session;
}

function limitSessionCreation(req, res, next) {
    const key = req.ip || "unknown";
    const now = Date.now();
    const recentAttempts = (sessionAttemptsByIp.get(key) || []).filter(
        timestamp => timestamp > now - SESSION_RATE_WINDOW_MS
    );

    if (recentAttempts.length >= SESSION_RATE_LIMIT) {
        return res.status(429).json({ error: "Too many new sessions. Please try again shortly." });
    }

    recentAttempts.push(now);
    sessionAttemptsByIp.set(key, recentAttempts);
    next();
}

function requireSession(req, res, next) {
    const session = getSession(req);
    if (!session) {
        return res.status(401).json({ error: "Start Ace Tracker in your browser and try again." });
    }
    req.aceSession = session;
    next();
}

function getLocalDateParts(date, timezoneOffsetMinutes) {
    const shifted = new Date(date.getTime() + timezoneOffsetMinutes * 60000);
    return {
        year: shifted.getUTCFullYear(),
        month: shifted.getUTCMonth(),
        day: shifted.getUTCDate(),
        hours: shifted.getUTCHours(),
        minutes: shifted.getUTCMinutes(),
        dateKey: `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`
    };
}

function localDateToUtc(year, month, day, hours, minutes, timezoneOffsetMinutes) {
    return new Date(Date.UTC(year, month, day, hours, minutes) - timezoneOffsetMinutes * 60000);
}

function addDaysToLocalDate(parts, days) {
    const date = new Date(Date.UTC(parts.year, parts.month, parts.day + days));
    return { year: date.getUTCFullYear(), month: date.getUTCMonth(), day: date.getUTCDate() };
}

function parseTime(value, fallback = "20:00") {
    const match = /^(\d{2}):(\d{2})$/.exec(String(value || fallback));
    if (!match) return parseTime(fallback, fallback);

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return parseTime(fallback, fallback);

    return { hours, minutes };
}

function calculateNextRun(reminder, fromDate = new Date()) {
    const offset = Number.isFinite(Number(reminder.timezoneOffsetMinutes))
        ? Number(reminder.timezoneOffsetMinutes)
        : 0;
    const nowLocal = getLocalDateParts(fromDate, offset);

    if (reminder.frequency === "once") {
        const time = parseTime(reminder.reminderTime);
        let candidate = localDateToUtc(nowLocal.year, nowLocal.month, nowLocal.day, time.hours, time.minutes, offset);
        if (candidate <= fromDate) {
            const tomorrow = addDaysToLocalDate(nowLocal, 1);
            candidate = localDateToUtc(tomorrow.year, tomorrow.month, tomorrow.day, time.hours, time.minutes, offset);
        }
        return candidate;
    }

    const start = parseTime(reminder.startTime, "09:00");
    const end = parseTime(reminder.endTime, "21:00");
    const fixedIntervals = { "30min": 30, "1hour": 60, "2hours": 120, "3hours": 180 };
    const interval = Math.max(5, fixedIntervals[reminder.frequency] || Number(reminder.customInterval) || 60);
    const startMinutes = start.hours * 60 + start.minutes;
    const endMinutes = end.hours * 60 + end.minutes;
    const nowMinutes = nowLocal.hours * 60 + nowLocal.minutes;

    if (nowMinutes < startMinutes) {
        return localDateToUtc(nowLocal.year, nowLocal.month, nowLocal.day, start.hours, start.minutes, offset);
    }
    if (nowMinutes > endMinutes) {
        const tomorrow = addDaysToLocalDate(nowLocal, 1);
        return localDateToUtc(tomorrow.year, tomorrow.month, tomorrow.day, start.hours, start.minutes, offset);
    }

    const nextMinute = startMinutes + (Math.floor((nowMinutes - startMinutes) / interval) + 1) * interval;
    if (nextMinute > endMinutes) {
        const tomorrow = addDaysToLocalDate(nowLocal, 1);
        return localDateToUtc(tomorrow.year, tomorrow.month, tomorrow.day, start.hours, start.minutes, offset);
    }
    return localDateToUtc(nowLocal.year, nowLocal.month, nowLocal.day, Math.floor(nextMinute / 60), nextMinute % 60, offset);
}

function deleteSubscription(endpoint) {
    db.prepare("DELETE FROM reminders WHERE endpoint = ?").run(endpoint);
    db.prepare("DELETE FROM subscriptions WHERE endpoint = ?").run(endpoint);
}

function saveReminder(reminder) {
    db.prepare(
        `UPDATE reminders SET reminder_json = ?, updated_at = ? WHERE id = ?`
    ).run(JSON.stringify(reminder), nowIso(), reminder.id);
}

async function sendPush(subscriptionRow, payload) {
    if (!subscriptionRow) return false;

    try {
        const subscription = JSON.parse(subscriptionRow.subscription_json);
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        return true;
    } catch (error) {
        const statusCode = Number(error.statusCode) || 0;
        console.error(`Push delivery failed (${statusCode || "network error"}):`, error.message || "Unknown error");
        if (statusCode === 404 || statusCode === 410) {
            deleteSubscription(subscriptionRow.endpoint);
        }
        return false;
    }
}

// Public, non-sensitive endpoints.
app.get("/api/health", (req, res) => {
    res.json({ status: "online", service: "Ace Tracker" });
});

app.get("/api/vapid-public-key", (req, res) => {
    res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// A browser receives an opaque, HTTP-only session cookie. Each browser/device
// therefore owns only its own push subscriptions and reminders.
app.post("/api/session", limitSessionCreation, (req, res) => {
    let session = getSession(req);
    if (!session) session = createSession();
    setSessionCookie(res, session);
    res.json({ success: true, expiresAt: session.expiresAt });
});

app.post("/api/subscribe", requireSession, (req, res) => {
    const subscription = req.body;
    if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
        return res.status(400).json({ error: "Invalid push subscription." });
    }

    // One browser session has one active subscription. Replacing it removes
    // reminders tied to an old browser endpoint without touching other users.
    const existingEndpoint = db.prepare(
        "SELECT session_id FROM subscriptions WHERE endpoint = ?"
    ).get(subscription.endpoint);
    db.prepare("DELETE FROM reminders WHERE session_id = ? AND endpoint <> ?").run(req.aceSession.id, subscription.endpoint);
    db.prepare("DELETE FROM subscriptions WHERE session_id = ? AND endpoint <> ?").run(req.aceSession.id, subscription.endpoint);
    if (existingEndpoint && existingEndpoint.session_id !== req.aceSession.id) {
        db.prepare("DELETE FROM reminders WHERE endpoint = ?").run(subscription.endpoint);
    }
    db.prepare(
        `INSERT INTO subscriptions (endpoint, session_id, subscription_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(endpoint) DO UPDATE SET
            session_id = excluded.session_id,
            subscription_json = excluded.subscription_json,
            updated_at = excluded.updated_at`
    ).run(subscription.endpoint, req.aceSession.id, JSON.stringify(subscription), nowIso(), nowIso());

    res.status(201).json({ success: true });
});

app.post("/api/unsubscribe", requireSession, (req, res) => {
    const endpoint = String(req.body?.endpoint || "");
    const subscription = db.prepare(
        "SELECT endpoint FROM subscriptions WHERE endpoint = ? AND session_id = ?"
    ).get(endpoint, req.aceSession.id);

    if (subscription) deleteSubscription(subscription.endpoint);
    res.json({ success: true });
});

app.post("/api/schedule-reminder", requireSession, (req, res) => {
    const {
        endpoint,
        taskId,
        taskName,
        reminderTime,
        message,
        frequency = "once",
        startTime = "09:00",
        endTime = "21:00",
        customInterval = 60,
        maxNotifications = 1,
        stopWhenCompleted = true,
        completed = false,
        completedDate = null,
        timezoneOffsetMinutes = 0
    } = req.body || {};

    const allowedFrequencies = new Set(["once", "30min", "1hour", "2hours", "3hours", "custom"]);
    if (!endpoint || taskId === undefined || !taskName || !allowedFrequencies.has(frequency)) {
        return res.status(400).json({ error: "Invalid reminder details." });
    }

    const subscription = db.prepare(
        "SELECT endpoint FROM subscriptions WHERE endpoint = ? AND session_id = ?"
    ).get(endpoint, req.aceSession.id);
    if (!subscription) return res.status(403).json({ error: "This device is not subscribed." });

    const id = `${req.aceSession.id}:${String(taskId)}`;
    const existingRow = db.prepare(
        "SELECT reminder_json FROM reminders WHERE id = ?"
    ).get(id);
    const previous = existingRow ? JSON.parse(existingRow.reminder_json) : null;
    const offset = Number(timezoneOffsetMinutes) || 0;
    const reminder = {
        id,
        endpoint,
        taskId: String(taskId),
        taskName: String(taskName).slice(0, 160),
        reminderTime: reminderTime || "20:00",
        message: String(message || `Don't forget: ${taskName}`).slice(0, 500),
        frequency,
        startTime,
        endTime,
        customInterval: Math.max(5, Number(customInterval) || 60),
        maxNotifications: Math.max(0, Number(maxNotifications) || 0),
        stopWhenCompleted: Boolean(stopWhenCompleted),
        completed: Boolean(completed),
        completedDate: completed
            ? (completedDate || previous?.completedDate || getLocalDateParts(new Date(), offset).dateKey)
            : null,
        timezoneOffsetMinutes: offset,
        nextRunAt: previous?.nextRunAt || null,
        sentCount: previous?.sentCount || 0,
        sentDate: previous?.sentDate || null,
        lastSent: previous?.lastSent || null,
        createdAt: previous?.createdAt || nowIso()
    };

    const timingChanged = !previous || ["frequency", "reminderTime", "startTime", "endTime", "customInterval"].some(
        key => previous[key] !== reminder[key]
    );
    if (timingChanged || !reminder.nextRunAt || new Date(reminder.nextRunAt) <= new Date()) {
        reminder.nextRunAt = calculateNextRun(reminder).toISOString();
        if (timingChanged) {
            reminder.sentCount = 0;
            reminder.sentDate = null;
        }
    }

    db.prepare(
        `INSERT INTO reminders (id, session_id, endpoint, task_id, reminder_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
            endpoint = excluded.endpoint,
            reminder_json = excluded.reminder_json,
            updated_at = excluded.updated_at`
    ).run(id, req.aceSession.id, endpoint, reminder.taskId, JSON.stringify(reminder), nowIso(), nowIso());

    res.json({ success: true, nextRunAt: reminder.nextRunAt });
});

app.post("/api/cancel-reminder", requireSession, (req, res) => {
    const taskId = String(req.body?.taskId || "");
    const endpoint = String(req.body?.endpoint || "");
    const id = `${req.aceSession.id}:${taskId}`;
    db.prepare("DELETE FROM reminders WHERE id = ? AND endpoint = ? AND session_id = ?").run(id, endpoint, req.aceSession.id);
    res.json({ success: true });
});

app.post("/api/task-status", requireSession, (req, res) => {
    const taskId = String(req.body?.taskId || "");
    const endpoint = String(req.body?.endpoint || "");
    const id = `${req.aceSession.id}:${taskId}`;
    const row = db.prepare(
        "SELECT reminder_json FROM reminders WHERE id = ? AND endpoint = ? AND session_id = ?"
    ).get(id, endpoint, req.aceSession.id);

    if (!row) return res.json({ success: true, reminderFound: false });

    const reminder = JSON.parse(row.reminder_json);
    reminder.completed = Boolean(req.body?.completed);
    reminder.completedDate = reminder.completed
        ? (req.body?.dateKey || getLocalDateParts(new Date(), reminder.timezoneOffsetMinutes).dateKey)
        : null;
    saveReminder(reminder);
    res.json({ success: true, reminderFound: true });
});

app.post("/api/send-test", requireSession, async (req, res) => {
    const subscriptions = db.prepare(
        "SELECT endpoint, subscription_json FROM subscriptions WHERE session_id = ?"
    ).all(req.aceSession.id);

    if (!subscriptions.length) {
        return res.status(400).json({ error: "Enable notifications on this device first." });
    }

    let delivered = 0;
    for (const subscription of subscriptions) {
        if (await sendPush(subscription, {
            title: "Ace Tracker",
            message: "Your private background push notifications are working.",
            tag: "ace-test",
            data: { url: "/" }
        })) {
            delivered += 1;
        }
    }

    res.json({ success: delivered > 0, delivered, attempted: subscriptions.length });
});

async function processReminders() {
    const now = new Date();
    const rows = db.prepare(
        `SELECT reminders.id, reminders.reminder_json, subscriptions.endpoint, subscriptions.subscription_json
         FROM reminders
         INNER JOIN subscriptions ON subscriptions.endpoint = reminders.endpoint`
    ).all();

    for (const row of rows) {
        let reminder;
        try {
            reminder = JSON.parse(row.reminder_json);
        } catch {
            db.prepare("DELETE FROM reminders WHERE id = ?").run(row.id);
            continue;
        }

        if (!reminder.nextRunAt) {
            reminder.nextRunAt = calculateNextRun(reminder, now).toISOString();
            saveReminder(reminder);
            continue;
        }

        const today = getLocalDateParts(now, Number(reminder.timezoneOffsetMinutes) || 0).dateKey;
        if (reminder.sentDate !== today) {
            reminder.sentCount = 0;
            reminder.sentDate = today;
        }

        if (new Date(reminder.nextRunAt) > now) {
            saveReminder(reminder);
            continue;
        }

        const completedToday = reminder.completed && reminder.completedDate === today;
        const reachedDailyLimit = reminder.maxNotifications > 0 && reminder.sentCount >= reminder.maxNotifications;

        if (!reminder.stopWhenCompleted || !completedToday) {
            if (!reachedDailyLimit && await sendPush(row, {
                title: "Ace Reminder",
                message: reminder.message,
                tag: `ace-task-${reminder.taskId}`,
                data: { taskId: reminder.taskId, url: "/" }
            })) {
                reminder.sentCount += 1;
                reminder.lastSent = now.toISOString();
                console.log(`Reminder sent: ${reminder.taskName}`);
            }
        }

        reminder.nextRunAt = calculateNextRun(reminder, new Date(now.getTime() + 1000)).toISOString();
        saveReminder(reminder);
    }
}

setInterval(() => {
    processReminders().catch(error => console.error("Reminder worker error:", error));
}, 5000);
processReminders().catch(error => console.error("Initial reminder worker error:", error));

// Only explicit public files are served. Secrets, database files, and backend
// source remain unreachable from the public site.
const FRONTEND_DIR = path.join(__dirname, "..");
const PUBLIC_FILES = ["style.css", "script.js", "service-worker.js", "manifest.json", "icon.png"];

app.use("/assets", express.static(path.join(FRONTEND_DIR, "assets"), { dotfiles: "deny" }));
app.get("/", (req, res) => res.sendFile(path.join(FRONTEND_DIR, "index.html")));
app.get("/index.html", (req, res) => res.sendFile(path.join(FRONTEND_DIR, "index.html")));
PUBLIC_FILES.forEach(file => {
    app.get(`/${file}`, (req, res) => res.sendFile(path.join(FRONTEND_DIR, file)));
});

app.use((error, req, res, next) => {
    console.error("Unhandled request error:", error);
    res.status(500).json({ error: "Unexpected server error." });
});

app.listen(PORT, () => {
    console.log(`Ace Tracker is running on port ${PORT} (${NODE_ENV}).`);
    console.log(`Persistent data: ${DATABASE_FILE}`);
});
