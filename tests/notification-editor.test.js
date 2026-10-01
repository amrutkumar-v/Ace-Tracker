"use strict";

// Regression coverage for the Notification Control Centre "Edit" flow.
//
// Bug: renderNotificationTaskList() wires the Edit button to
// openTaskNotificationEditor(), which builds the overlay and appends it to
// <body>, but the overlay was never made visible. style.css ships
// `.task-notification-editor { display: none; }`, so the click handler ran and
// the DOM node appeared while the user saw absolutely nothing happen.

const assert = require("assert");

const {
    readFile,
    loadApp,
    createStorage
} = require("./dom-stub");

const HTML = readFile("index.html");
const CSS = readFile("style.css");

const TASK_NAMES = [
    "😴 Get Good Sleep",
    "💧 Drink 4 Litres Water",
    "🏋 Hit the Gym"
];

const TASK_SETTINGS_KEY = "aceTaskNotificationSettings";
const TASK_NAMES_KEY = "aceTaskNames";

const silentConsole = {
    log() {},
    info() {},
    debug() {},
    warn() {},
    error() {},
    trace() {}
};

function createStorageWith(settings, extra) {
    const seeded = Object.assign(
        {
            [TASK_NAMES_KEY]: JSON.stringify(TASK_NAMES),
            [TASK_SETTINGS_KEY]: JSON.stringify(settings)
        },
        extra || {}
    );

    return createStorage(seeded);
}

function createApp(storage) {
    return loadApp({ storage, html: HTML, css: CSS, console: silentConsole });
}

// The stylesheet hides the editor by default; only an inline `display` set by
// script.js can reveal it. This mirrors that cascade for the single element the
// bug is about.
function isEditorVisible(app, overlay) {
    if (!overlay) return false;
    const cssDisplay = app.cssDisplay("task-notification-editor");
    const resolved = overlay.style.display || cssDisplay || "";
    return resolved !== "none";
}

function getNotificationCards(document) {
    return document
        .getElementById("notificationTaskList")
        .children.filter(child => child.classList.contains("notification-task-card"));
}

function getCardDescription(card) {
    const description = card
        .querySelectorAll("notification-task-description")[0];
    return description ? description.textContent : "";
}

function getEditButton(card) {
    return card.children.find(child => child.classList.contains("configure-task-notification")) || null;
}

function getTaskToggle(card) {
    return card.children
        .map(header => header.querySelectorAll("task-notification-toggle")[0])
        .filter(Boolean)[0] || null;
}

function getEditorOverlay(document) {
    return document.getElementById("taskNotificationEditor");
}

function getEditorContent(overlay) {
    return overlay.children.find(child => child.classList.contains("task-notification-editor-content")) || null;
}

function getFieldRow(content, labelText) {
    const rows = content
        .querySelectorAll("notification-editor-field")
        .concat(content.querySelectorAll("notification-editor-row"));

    return rows.find(row => {
        const label = row.children[0];
        return label && label.textContent.includes(labelText);
    }) || null;
}

function getFieldControl(content, labelText) {
    const row = getFieldRow(content, labelText);
    return row ? row.children[1] : null;
}

function getSaveButton(overlay) {
    const content = getEditorContent(overlay);
    return content
        ? content.children.find(child => child.classList.contains("save-task-notification")) || null
        : null;
}

function readSavedSettings(storage, index) {
    const raw = JSON.parse(storage.getItem(TASK_SETTINGS_KEY) || "{}");
    return raw[index];
}

const tests = [];

function test(name, fn) {
    tests.push({ name, fn });
}

// ---------------------------------------------------------------------------

test("stylesheet keeps the editor hidden so script.js must reveal it", () => {
    const display = require("./dom-stub").stylesheetDisplayFor(CSS, "task-notification-editor");

    assert.strictEqual(display, "none", "premise of the regression test changed: .task-notification-editor is no longer display:none");
});

test("Edit button on an enabled task opens a visible editor overlay", () => {
    const storage = createStorageWith({
        1: { enabled: true, frequency: "once", reminderTime: "20:00" }
    });
    const app = createApp(storage);

    app.context.renderNotificationTaskList();

    const cards = getNotificationCards(app.document);
    assert.strictEqual(cards.length, TASK_NAMES.length, "every task should render a notification card");

    const editButton = getEditButton(cards[1]);
    assert.ok(editButton, "an enabled task must expose an Edit button");
    assert.strictEqual(editButton.textContent, "Edit");

    editButton.click();

    const overlay = getEditorOverlay(app.document);
    assert.ok(overlay, "clicking Edit must create the editor overlay");
    assert.strictEqual(overlay.parentElement, app.document.body, "editor overlay must be attached to <body>");
    assert.ok(
        isEditorVisible(app, overlay),
        "editor overlay must be visible: style.css declares display:none, so script.js has to set an inline display"
    );
});

test("editor is prefilled with the saved reminder time, frequency and message", () => {
    const storage = createStorageWith({
        1: {
            enabled: true,
            frequency: "2hours",
            reminderTime: "07:30",
            startTime: "08:00",
            endTime: "22:00",
            customInterval: 45,
            maxNotifications: 4,
            stopWhenCompleted: false,
            messageType: "custom",
            customMessage: "Hydrate now, champion."
        }
    });
    const app = createApp(storage);

    app.context.openTaskNotificationEditor(1);

    const content = getEditorContent(getEditorOverlay(app.document));
    assert.ok(content, "editor content must exist");

    assert.strictEqual(getFieldControl(content, "Frequency").value, "2hours");
    assert.strictEqual(getFieldControl(content, "Reminder time").value, "07:30");
    assert.strictEqual(getFieldControl(content, "Start time").value, "08:00");
    assert.strictEqual(getFieldControl(content, "End time").value, "22:00");
    assert.strictEqual(getFieldControl(content, "Interval in minutes").value, "45");
    assert.strictEqual(getFieldControl(content, "Maximum reminders").value, "4");
    assert.strictEqual(getFieldControl(content, "Stop when task").checked, false);
    assert.strictEqual(getFieldControl(content, "Message type").value, "custom");
    assert.strictEqual(getFieldControl(content, "Custom message").value, "Hydrate now, champion.");

    const title = content.children[0].children[0];
    assert.strictEqual(title.textContent, `🔔 ${TASK_NAMES[1]}`);
});

test("frequency switch reveals the matching conditional fields", () => {
    const storage = createStorageWith({ 1: { enabled: true, frequency: "once" } });
    const app = createApp(storage);

    app.context.openTaskNotificationEditor(1);

    const content = getEditorContent(getEditorOverlay(app.document));
    const onceSettings = content.querySelectorAll("notification-frequency-settings")[0];
    const repeatingSettings = content.querySelectorAll("notification-frequency-settings")[1];
    const customIntervalRow = getFieldRow(content, "Interval in minutes");

    assert.strictEqual(onceSettings.style.display, "block");
    assert.strictEqual(repeatingSettings.style.display, "none");
    assert.strictEqual(customIntervalRow.style.display, "none");

    const frequencySelect = getFieldControl(content, "Frequency");
    frequencySelect.value = "custom";
    frequencySelect.dispatchEvent({ type: "change", target: frequencySelect });

    assert.strictEqual(onceSettings.style.display, "none");
    assert.strictEqual(repeatingSettings.style.display, "block");
    assert.strictEqual(customIntervalRow.style.display, "flex");
});

test("saving updates time, frequency and message, closes the editor and re-renders the card", () => {
    const storage = createStorageWith({
        1: { enabled: true, frequency: "once", reminderTime: "20:00" }
    });
    const app = createApp(storage);

    app.context.renderNotificationTaskList();
    getEditButton(getNotificationCards(app.document)[1]).click();

    const overlay = getEditorOverlay(app.document);
    const content = getEditorContent(overlay);

    getFieldControl(content, "Frequency").value = "3hours";
    getFieldControl(content, "Reminder time").value = "06:45";
    getFieldControl(content, "Message type").value = "custom";
    getFieldControl(content, "Custom message").value = "Two litres left. Go.";

    getSaveButton(overlay).click();

    assert.strictEqual(getEditorOverlay(app.document), null, "editor overlay must be removed after saving");

    const saved = readSavedSettings(storage, 1);
    assert.strictEqual(saved.enabled, true);
    assert.strictEqual(saved.frequency, "3hours");
    assert.strictEqual(saved.reminderTime, "06:45");
    assert.strictEqual(saved.messageType, "custom");
    assert.strictEqual(saved.customMessage, "Two litres left. Go.");

    const card = getNotificationCards(app.document)[1];
    const summary = getCardDescription(card);
    assert.ok(summary.includes("Every 3 hours"), `card should summarise the new frequency, got: ${summary}`);
    assert.ok(summary.includes("ON"), `card should stay ON, got: ${summary}`);
});

test("reminder time changes are reflected in the card summary", () => {
    const storage = createStorageWith({
        1: { enabled: true, frequency: "once", reminderTime: "20:00" }
    });
    const app = createApp(storage);

    app.context.renderNotificationTaskList();

    const before = getCardDescription(getNotificationCards(app.document)[1]);
    assert.ok(
        before.includes(app.context.formatTime("20:00")),
        `card should show the default reminder time, got: ${before}`
    );

    getEditButton(getNotificationCards(app.document)[1]).click();

    const content = getEditorContent(getEditorOverlay(app.document));
    getFieldControl(content, "Reminder time").value = "06:45";
    getSaveButton(getEditorOverlay(app.document)).click();

    const after = getCardDescription(getNotificationCards(app.document)[1]);
    assert.ok(
        after.includes(app.context.formatTime("06:45")),
        `card should show the customised reminder time, got: ${after}`
    );
});

test("customised settings survive a page refresh and drive the scheduler read path", () => {
    const storage = createStorageWith({
        1: { enabled: true, frequency: "once", reminderTime: "20:00" }
    });

    const first = createApp(storage);
    first.context.renderNotificationTaskList();
    getEditButton(getNotificationCards(first.document)[1]).click();

    const content = getEditorContent(getEditorOverlay(first.document));
    getFieldControl(content, "Reminder time").value = "05:15";
    getFieldControl(content, "Message type").value = "short";
    getSaveButton(getEditorOverlay(first.document)).click();

    // Simulate a full page reload against the same persisted storage.
    const reloaded = createApp(storage);
    reloaded.context.renderNotificationTaskList();

    const card = getNotificationCards(reloaded.document)[1];
    const summary = getCardDescription(card);
    assert.ok(
        summary.includes(reloaded.context.formatTime("05:15")),
        `reminder time must persist across reload, got: ${summary}`
    );

    const settings = reloaded.context.getTaskNotificationSettings();
    assert.strictEqual(settings[1].reminderTime, "05:15");
    assert.strictEqual(settings[1].messageType, "short");
    assert.strictEqual(
        reloaded.context.getTaskNotificationMessage(settings[1].taskName, settings[1]),
        `⏰ Reminder: ${TASK_NAMES[1]}`,
        "the scheduler message helper must pick up the customised message type"
    );
});

test("a disabled task has no Edit button; enabling it reveals a working Edit flow", () => {
    const storage = createStorageWith({});
    const app = createApp(storage);

    app.context.renderNotificationTaskList();

    const card = getNotificationCards(app.document)[1];
    assert.strictEqual(getEditButton(card), null, "a disabled task must not expose Edit");
    assert.ok(getCardDescription(card).includes("OFF"), "a disabled task should render the OFF state");

    const toggle = getTaskToggle(card);
    assert.ok(toggle, "every task card needs an on/off switch");
    assert.strictEqual(toggle.checked, false);

    toggle.checked = true;
    toggle.dispatchEvent({ type: "change", target: toggle });

    assert.strictEqual(readSavedSettings(storage, 1).enabled, true, "enabling must persist");

    const enabledCard = getNotificationCards(app.document)[1];
    const editButton = getEditButton(enabledCard);
    assert.ok(editButton, "Edit must appear once the task is enabled");
    assert.ok(getCardDescription(enabledCard).includes("ON"));

    editButton.click();

    const overlay = getEditorOverlay(app.document);
    assert.ok(overlay, "Edit must open the editor after enabling");
    assert.ok(isEditorVisible(app, overlay), "the editor must be visible after enabling");

    const content = getEditorContent(overlay);
    getFieldControl(content, "Reminder time").value = "21:30";
    getSaveButton(overlay).click();

    assert.strictEqual(readSavedSettings(storage, 1).reminderTime, "21:30");
    assert.strictEqual(getEditorOverlay(app.document), null);
});

test("re-opening Edit reflects the previously customised values", () => {
    const storage = createStorageWith({
        1: {
            enabled: true,
            frequency: "custom",
            reminderTime: "20:00",
            customInterval: 20,
            messageType: "custom",
            customMessage: "Sip, do not chug."
        }
    });
    const app = createApp(storage);

    app.context.openTaskNotificationEditor(1);

    const content = getEditorContent(getEditorOverlay(app.document));
    assert.strictEqual(getFieldControl(content, "Frequency").value, "custom");
    assert.strictEqual(getFieldControl(content, "Interval in minutes").value, "20");
    assert.strictEqual(getFieldControl(content, "Custom message").value, "Sip, do not chug.");

    getSaveButton(getEditorOverlay(app.document)).click();

    app.context.openTaskNotificationEditor(1);

    const reopened = getEditorContent(getEditorOverlay(app.document));
    assert.strictEqual(getFieldControl(reopened, "Frequency").value, "custom");
    assert.strictEqual(getFieldControl(reopened, "Interval in minutes").value, "20");
    assert.strictEqual(getFieldControl(reopened, "Custom message").value, "Sip, do not chug.");
});

test("opening Edit twice replaces the previous overlay instead of stacking", () => {
    const storage = createStorageWith({ 1: { enabled: true } });
    const app = createApp(storage);

    app.context.openTaskNotificationEditor(1);
    const first = getEditorOverlay(app.document);

    app.context.openTaskNotificationEditor(1);
    const second = getEditorOverlay(app.document);

    assert.notStrictEqual(first, second, "a fresh overlay should replace the old one");
    assert.strictEqual(first.parentElement, null, "the previous overlay must be detached");
    assert.strictEqual(
        app.document.getElementById("taskNotificationEditor"),
        second,
        "only one editor overlay may exist"
    );
    assert.ok(isEditorVisible(app, second));
});

test("every existing frequency option is still offered in the editor", () => {
    const storage = createStorageWith({ 1: { enabled: true } });
    const app = createApp(storage);

    app.context.openTaskNotificationEditor(1);

    const content = getEditorContent(getEditorOverlay(app.document));
    const values = getFieldControl(content, "Frequency").children.map(option => option.value);

    assert.deepStrictEqual(
        values,
        ["once", "30min", "1hour", "2hours", "3hours", "custom"]
    );

    const messageTypes = getFieldControl(content, "Message type").children.map(option => option.value);
    assert.deepStrictEqual(
        messageTypes,
        ["default", "motivational", "short", "custom"]
    );
});

// ---------------------------------------------------------------------------

(async () => {
    let failed = 0;

    console.log("Notification editor tests\n");

    for (const { name, fn } of tests) {
        try {
            await fn();
            console.log(`  ✓ ${name}`);
        } catch (error) {
            failed += 1;
            console.log(`  ✗ ${name}`);
            console.log(`      ${error.message}`);
        }
    }

    console.log(`\n${tests.length - failed}/${tests.length} passed`);

    if (failed) process.exitCode = 1;
})();
