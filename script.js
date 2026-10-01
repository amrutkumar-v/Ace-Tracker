// =====================================================
// ACE TRACKER v2.0 - FIXED LIFECYCLE & STREAK ENGINE
// Production-Grade State Machine & Midnight Handler
// =====================================================

// =====================================================
// 1. CONSTANTS & CONFIGURATION
// =====================================================

const CHALLENGE_LENGTH_DAYS = 90;
const XP_PER_TASK = 10;
const GOLDEN_DAY_BONUS = 50;
const XP_PER_LEVEL = 100;

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MOTIVATIONAL_QUOTES = [
    "Small progress is still progress.",
    "Discipline builds what motivation starts.",
    "Your future self will thank you for what you do today.",
    "Consistency beats intensity.",
    "One good day becomes a good week. One good week becomes a new habit.",
    "Don't wait for motivation. Build discipline.",
    "Show up. Do the work. Repeat.",
    "Your habits are building your future.",
    "Every rep is a small vote for the person you want to become.",
    "The best time to start was yesterday. The next best time is now.",
    "Focus on the daily win, not the distant finish line.",
    "A little better every day is still better than everyone who quits.",
    "Hydrate. Move. Learn. Rest. Repeat.",
    "You don't need to be great to start, but you need to start to be great.",
    "Protect your focus like it's your most valuable asset.",
    "The gym is won in the minutes you choose to show up.",
    "Burn the average day. Chase the sharp one.",
    "Growth looks like repetition until it suddenly looks like progress.",
    "One hour of focus beats four hours of distraction.",
    "Your streak is just today's decision shown in numbers.",
    "Eat to perform, not just to feel full.",
    "The body achieves what the mind believes.",
    "Rest is part of the work, not an escape from it.",
    "Every day you don't skip is a day your future self notices.",
    "Study the lesson again until it becomes instinct.",
    "Security is a habit long before it is a skill.",
    "Learn like today's effort is tomorrow's edge.",
    "Fail fast, fix fast, move forward faster.",
    "A tiny step today is a stepping stone tomorrow.",
    "Your only competition is the version of you from yesterday.",
    "Silence the noise. Do the next right thing.",
    "Progress hides in the work nobody claps for.",
    "The grind is quiet because it's busy working.",
    "Discipline is remembering what you want most.",
    "Winning streaks begin with one boring, committed day.",
    "Get up one more time than you fall down.",
    "Small habits compound into big identity.",
    "Clean eating and clean code both start with clean habits.",
    "The screen can wait. Your growth cannot.",
    "Finish the task, then check the phone.",
    "Your energy is finite. Spend it on what moves you forward.",
    "Every drop of sweat points toward a stronger you.",
    "Write the checklist. Then check the boxes.",
    "A sound body carries a sharp mind.",
    "Don't negotiate with the snooze button.",
    "The morning you win is the day you build.",
    "Repetition makes the error disappear.",
    "Be the student who outworks the doubt.",
    "Short sessions repeated beat long sessions skipped.",
    "Your plan is only as strong as your first five minutes.",
    "Momentum is a gift you give your future self.",
    "The best habit is the one you actually keep.",
    "Strength is built in days you feel like staying home.",
    "Standing up again is the whole point.",
    "Your best effort today is your best forecast tomorrow.",
    "Do not stop when you're tired. Stop when you're done with the day's goal.",
    "Consistency is the quiet superpower.",
    "Track the work. Trust the process. Let the results follow.",
    "A focused hour is worth a distracted day.",
    "Fuel your body like it's the only machine you'll ever own.",
    "The hardest step is often the first one. Take it.",
    "Keep the streak alive. Future you is counting on it.",
    "Excellence is a series of ordinary days done well.",
    "Finish what you start, even on the days it's small.",
    "Your habits are the architecture of your day.",
    "Be relentless with your routine, gentle with yourself.",
    "Growth doesn't shout. It shows up.",
    "One more set, one more problem, one more page.",
    "The person you become is built in the boring middle.",
    "Close the tab. Open the task.",
    "Deep work is the new competitive advantage.",
    "Every missed meal plan, rest day, and study block has a comeback.",
    "Run your own race. Your finish line is yours.",
    "Discipline is choosing what you want more than what you want now.",
    "The scoreboard of life rewards the repeat.",
    "Keep your goals close and your excuses far.",
    "You are one decision away from a better routine.",
    "Progress is louder when it's quiet and consistent.",
    "Small daily wins stack into a strong identity.",
    "Don't count the days. Make the days count.",
    "Your future is a series of present moments. Choose wisely.",
    "Be consistent enough that results become inevitable.",
    "The habit you keep today powers the version of you next year.",
    "Fortify your routine against the days you don't feel like it.",
    "A clean mind starts with a clean sleep schedule.",
    "Train your mind with problems and your body with reps.",
    "The most powerful password is a disciplined daily routine.",
    "Break big goals into boring, doable steps, then do them.",
    "Your goals deserve a fight, not a wish.",
    "Practice until it's easy, then practice easily.",
    "Resilience is a repeatable habit, not a rare gift.",
    "Guard mornings like they're the blueprint of your day.",
    "The pen marks the plan; the habit delivers it.",
    "Every quiet push today is loud evidence tomorrow.",
    "Stay curious. Stay hungry. Stay consistent.",
    "The strongest people are the ones who never stop showing up.",
    "Make your environment make the good choice the easy choice.",
    "Small actions, repeated, are the most honest form of ambition.",
    "Your body is the bank account of your daily choices.",
    "Studying is planting seeds for a smarter you.",
    "Cybersecurity is a mindset: verify, protect, and stay sharp.",
    "A little work done daily beats a mountain done rarely.",
    "The comeback is always stronger than the setback.",
    "Eat the frog first, and the rest of the day gets lighter.",
    "Consistency turns ordinary days into extraordinary results.",
    "Your best version is under construction every single day.",
    "Discipline is the bridge between goals and accomplishment.",
    "Protect your habits like you protect your passwords.",
    "Finish strong, then rest. Don't rest, then quit.",
    "The right day to build the habit is today, again.",
    "Progress is a series of small commitments kept.",
    "Balance the hustle with the recovery.",
    "Your future self is listening to the choices you make now.",
    "One focused hour a day becomes a masterpiece in a year.",
    "Be someone who finishes what they start, quietly.",
    "The mirror rewards the habit, not the intention.",
    "Stack good days like bricks and build something real.",
    "Keep moving. The finish line moves with you.",
    "Routine is freedom wearing comfortable clothes.",
    "Earn the night by winning the day."
];

// Single source of truth for all localStorage keys
const STORAGE_KEYS = {
    userName: "userName",
    theme: "theme",
    height: "userHeight",
    weightHistory: "weightHistory",
    challengeStart: "challengeStart",
    streak: "streak",
    bestStreak: "bestStreak",
    lastVisit: "lastVisit",
    lastTaskDate: "lastTaskDate",
    totalXP: "totalXP",
    task: (index) => `task-${index}`,
    dayStatus: (day) => `day-${day}`,
    dayTasks: (day) => `day-${day}-tasks`,
    processed: (dateKey) => `processed-${dateKey}`
};

// =====================================================
// 2. DOM ELEMENTS
// =====================================================

// Tasks & Progress
let checkboxes = document.querySelectorAll(".taskCheck");
const progressText = document.getElementById("progressText");
const progressCircle = document.getElementById("progressCircle");
const progressPercent = document.getElementById("progressPercent");
const todayScoreText = document.getElementById("todayScore");

// Statistics
const goldenDaysText = document.getElementById("goldenDays");
const completionRateText = document.getElementById("completionRate");
const daysRemainingText = document.getElementById("daysRemaining");
const totalTasksText = document.getElementById("totalTasks");
const challengeDayText = document.getElementById("challengeDay");

// Monthly Statistics
const monthTasks = document.getElementById("monthTasks");
const monthGolden = document.getElementById("monthGolden");
const monthAverage = document.getElementById("monthAverage");

// XP System
const levelText = document.getElementById("levelText");
const xpText = document.getElementById("xpText");
const xpFill = document.getElementById("xpFill");
const totalXPText = document.getElementById("totalXP");

// Header & Navigation
const welcomeText = document.getElementById("welcomeText");
const currentDate = document.getElementById("currentDate");
const streakText = document.getElementById("streakText");
const bestStreakText = document.getElementById("bestStreak");

// Popups & Containers
const popup = document.getElementById("goldenPopup");
const closePopup = document.getElementById("closePopup");
const calendar = document.getElementById("calendar");

// Canvas Contexts
const ctx = document.getElementById("weeklyChart");
const pieCtx = document.getElementById("pieChart");

// Controls & Actions
const exportBtn = document.getElementById("exportBtn");
const loginScreen = document.getElementById("loginScreen");
const loginBtn = document.getElementById("loginBtn");
const loginName = document.getElementById("loginName");
const logoutBtn = document.getElementById("logoutBtn");
const resetBtn = document.getElementById("resetBtn");

// Miscellaneous
const quote = document.getElementById("quote");
const liveClock = document.getElementById("liveClock");
const installBtn = document.getElementById("installBtn");

// Weight & BMI
const heightInput = document.getElementById("heightInput");
const saveHeightBtn = document.getElementById("saveHeightBtn");

const weightInput = document.getElementById("weightInput");
const addWeightBtn = document.getElementById("addWeightBtn");

const currentWeightText = document.getElementById("currentWeight");
const currentBMIText = document.getElementById("currentBMI");
const bmiCategoryText = document.getElementById("bmiCategory");
const weightChangeText = document.getElementById("weightChange");

const weightHistoryContainer =
    document.getElementById("weightHistory");

const weightChartCanvas =
    document.getElementById("weightChart");

let weightChart = null;
// =====================================================
// 3. IN-MEMORY STATE
// =====================================================

let streak = Number(localStorage.getItem(STORAGE_KEYS.streak)) || 0;
let bestStreak = Number(localStorage.getItem(STORAGE_KEYS.bestStreak)) || 0;
let totalXP = Number(localStorage.getItem(STORAGE_KEYS.totalXP)) || 0;

let totalTasksCompleted = 0;
let goldenDays = 0;
let completionRate = 0;

let challengeStart = localStorage.getItem(STORAGE_KEYS.challengeStart);
// Recover from a missing or corrupted stored challenge date. A truthy but
// invalid value (e.g. "undefined", "NaN", or any non YYYY-MM-DD string) would
// otherwise produce an Invalid Date and leak NaN into challenge-day math.
// Treating it as missing lets processDailyLifecycle safely re-initialize it to
// today without touching XP, streaks, tasks, weight, or other stored progress.
if (challengeStart && !isValidDateKey(challengeStart)) {
    challengeStart = null;
}
let dayNumber = 1;

let weeklyChart = null;
let pieChart = null;
let deferredInstallPrompt = null;

// Idempotency lock set for concurrent event protection
const processingDates = new Set();
let taskListenersInitialized = false;

// =====================================================
// 4. ACCURATE LOCAL DATE HELPERS (YYYY-MM-DD)
// =====================================================

/**
 * Returns local YYYY-MM-DD date string without timezone skew.
 */
function getTodayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD into a UTC midnight Date object to prevent DST bugs.
 */
function parseDateKey(dateKey) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Verifies a string is a real calendar date in YYYY-MM-DD form.
 * Guards against corrupted / invalid stored values that would otherwise
 * parse to an Invalid Date and produce NaN in date arithmetic.
 */
function isValidDateKey(dateKey) {
    if (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
    const parts = dateKey.split("-").map(Number);
    if (!parts.every((n) => Number.isInteger(n) && n >= 0)) return false;
    const date = parseDateKey(dateKey);
    if (Number.isNaN(date.getTime())) return false;
    return (
        date.getUTCFullYear() === parts[0] &&
        date.getUTCMonth() === parts[1] - 1 &&
        date.getUTCDate() === parts[2]
    );
}

/**
 * Adds a specified number of days to a date string key.
 */
function addDays(dateKey, numDays) {
    const date = parseDateKey(dateKey);
    date.setUTCDate(date.getUTCDate() + numDays);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Calculates absolute calendar days between two YYYY-MM-DD strings.
 */
function daysBetween(dateKeyA, dateKeyB) {
    // Guard against corrupted inputs so callers never see NaN from Invalid Dates.
    if (!isValidDateKey(dateKeyA) || !isValidDateKey(dateKeyB)) return 0;
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((parseDateKey(dateKeyB) - parseDateKey(dateKeyA)) / msPerDay);
}

function getDayNumberForDate(dateKey) {
    if (!isValidDateKey(challengeStart)) return 1;
    if (!isValidDateKey(dateKey)) dateKey = getTodayKey();
    const rawDay = daysBetween(challengeStart, dateKey) + 1;
    if (!Number.isFinite(rawDay)) return 1;
    return Math.min(CHALLENGE_LENGTH_DAYS, Math.max(1, rawDay));
}

function isChallengeFinished(dateKey = getTodayKey()) {
    if (!isValidDateKey(challengeStart)) return false;
    if (!isValidDateKey(dateKey)) dateKey = getTodayKey();
    const elapsed = daysBetween(challengeStart, dateKey) + 1;
    if (!Number.isFinite(elapsed)) return false;
    return elapsed > CHALLENGE_LENGTH_DAYS;
}

/**
 * Returns an array of YYYY-MM-DD strings for the current calendar week (Mon - Sun).
 */
function getCurrentWeekDates() {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
    const distanceToMon = (currentDayOfWeek + 6) % 7;

    const monDate = new Date(now);
    monDate.setDate(now.getDate() - distanceToMon);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monDate);
        d.setDate(monDate.getDate() + i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        weekDates.push(`${year}-${month}-${day}`);
    }
    return weekDates;
}

// =====================================================
// 5. APP INITIALIZATION
// =====================================================

document.addEventListener("DOMContentLoaded", initializeTracker);

function initializeTracker() {
    const today = getTodayKey();

    processDailyLifecycle(today);
    initTaskListeners();
    updateWelcome();
    updateDate();
    updateStreak(today);
    updateStatistics();
    loadCalendar();
    initializeWeightTracker();

    createCharts();
    updateProgress();
    updateXP();

    initializeTheme();
    loadQuote();
    startClock();
    initializeExport();
    initializeLogin();
    initializeResetButton();
    initializePWA();
    initializeNotifications();
    startSmartNotifications();
    

    if (closePopup && popup) {
        closePopup.addEventListener("click", () => {
            popup.style.display = "none";
        });
    }

    // Secondary timers to detect midnight transitions while app is open
    setInterval(() => checkMidnightTransition(), 60000);
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            checkMidnightTransition();
        }
    });
}

// =====================================================
// 6. CORE DAILY LIFECYCLE & CATCH-UP ENGINE
// =====================================================

function processDailyLifecycle(today) {
    let lastTaskDate = localStorage.getItem(STORAGE_KEYS.lastTaskDate);

    if (!challengeStart) {
        challengeStart = today;
        localStorage.setItem(STORAGE_KEYS.challengeStart, challengeStart);
    }

    // Initial launch setup
    if (!lastTaskDate) {
        localStorage.setItem(STORAGE_KEYS.lastTaskDate, today);
        dayNumber = getDayNumberForDate(today);
        if (!isChallengeFinished(today)) {
            saveDayStatus(dayNumber, today, countCompletedCheckboxes(), false);
        }
        return;
    }

    // Already up to date for today
    if (lastTaskDate === today) {
        dayNumber = getDayNumberForDate(today);
        return;
    }

    // --- DAY TRANSITION DETECTED: PROCESS ALL MISSED DAYS ---
    let currentDateKey = lastTaskDate;

    while (currentDateKey !== today) {
        const rawDay = daysBetween(challengeStart, currentDateKey) + 1;
        if (rawDay <= CHALLENGE_LENGTH_DAYS) {
            finalizePreviousDay(currentDateKey);
        }
        currentDateKey = addDays(currentDateKey, 1);
    }

    localStorage.setItem(STORAGE_KEYS.lastTaskDate, today);
    dayNumber = getDayNumberForDate(today);

    // Reset task checkboxes if challenge is still active
    if (!isChallengeFinished(today)) {
        resetForNewDay();
        saveDayStatus(dayNumber, today, 0, false);
    } else {
        updateProgress();
        updateXP();
        updateStatistics();
        loadCalendar();
    }
}

function checkMidnightTransition() {
    const today = getTodayKey();
    const lastTaskDate = localStorage.getItem(STORAGE_KEYS.lastTaskDate);
    if (lastTaskDate && lastTaskDate !== today) {
        processDailyLifecycle(today);
        updateStreak(today);
        updateWelcome();
        updateDate();
    }
}

/**
 * RESPONSIBILITY 1: Finalize data and award XP for a completed or missed day.
 * Fully idempotent and protected against race conditions.
 */
function finalizePreviousDay(dateKey) {
    const processedKey = STORAGE_KEYS.processed(dateKey);

    // Lock check: skip if day is actively being processed or already locked
    if (processingDates.has(dateKey) || localStorage.getItem(processedKey) === "true") {
        return;
    }

    const rawDay = daysBetween(challengeStart, dateKey) + 1;
    if (rawDay > CHALLENGE_LENGTH_DAYS) {
        return; // Freeze day processing beyond Day 90
    }

    processingDates.add(dateKey);

    try {
        const dayNum = getDayNumberForDate(dateKey);
        const lastTaskDate = localStorage.getItem(STORAGE_KEYS.lastTaskDate);

        let completedCount = 0;

        if (dateKey === lastTaskDate) {
            const savedTasks = localStorage.getItem(STORAGE_KEYS.dayTasks(dayNum));
            if (savedTasks !== null) {
                completedCount = Number(savedTasks);
            } else {
                completedCount = countSavedCheckboxes();
            }
        } else {
            const savedTasks = localStorage.getItem(STORAGE_KEYS.dayTasks(dayNum));
            completedCount = savedTasks !== null ? Number(savedTasks) : 0;
        }

        saveDayStatus(dayNum, dateKey, completedCount, true);

        localStorage.setItem(processedKey, "true");
    } finally {
        processingDates.delete(dateKey);
    }
}

/**
 * RESPONSIBILITY 2: Clear UI and LocalStorage checkboxes for a new day.
 */
function resetForNewDay() {
    checkboxes.forEach((box, index) => {
        box.checked = false;
        const taskElement = box.closest(".task");
        if (taskElement) taskElement.classList.remove("completed");
        localStorage.removeItem(STORAGE_KEYS.task(index));
    });

    updateProgress();
    updateXP();
    updateStatistics();
    loadCalendar();
    updatePieChart();
    updateWeeklyChart();
}

function countSavedCheckboxes() {
    let count = 0;
    checkboxes.forEach((_, index) => {
        if (localStorage.getItem(STORAGE_KEYS.task(index)) === "true") {
            count++;
        }
    });
    return count;
}

function countCompletedCheckboxes() {
    return [...checkboxes].filter((box) => box.checked).length;
}

// =====================================================
// 7. XP SYSTEM
// =====================================================

function addXP(amount) {
    totalXP = (Number(localStorage.getItem(STORAGE_KEYS.totalXP)) || 0) + amount;

    // Prevent XP from going below 0
    if (totalXP < 0) totalXP = 0;

    localStorage.setItem(STORAGE_KEYS.totalXP, totalXP);
    updateXP();
}

function updateXP() {
    totalXP = Number(localStorage.getItem(STORAGE_KEYS.totalXP)) || 0;

    const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
    const currentLevelXP = totalXP % XP_PER_LEVEL;

    if (totalXPText) totalXPText.textContent = `${totalXP} XP`;
    if (levelText) levelText.textContent = `Level ${level}`;
    if (xpText) xpText.textContent = `${currentLevelXP} / ${XP_PER_LEVEL} XP`;
    if (xpFill) xpFill.style.width = `${(currentLevelXP / XP_PER_LEVEL) * 100}%`;

    // Keep the accessible value of the XP bar in sync with the bar itself.
    const xpBar = document.getElementById("xpBar");
    if (xpBar) {
        xpBar.setAttribute("aria-valuenow", String(currentLevelXP));
        xpBar.setAttribute("aria-valuetext", `${currentLevelXP} of ${XP_PER_LEVEL} XP toward level ${level + 1}`);
    }
}

// =====================================================
// 8. TASK MANAGEMENT & EVENT LISTENERS
// =====================================================

function initTaskListeners() {
    if (taskListenersInitialized) return;

    checkboxes.forEach((box, index) => {
        box.addEventListener("change", () => handleTaskToggle(box, index));
    });

    taskListenersInitialized = true;
}

function loadTasks() {
    checkboxes.forEach((box, index) => {
        const savedState = localStorage.getItem(STORAGE_KEYS.task(index));
        const isChecked = savedState === "true";

        box.checked = isChecked;
        const taskElement = box.closest(".task");
        if (taskElement) {
            taskElement.classList.toggle("completed", isChecked);
        }
    });
}

function handleTaskToggle(box, index) {
    const today = getTodayKey();

    if (isChallengeFinished(today)) {
        box.checked = !box.checked;
        alert("The 90-day challenge is completed!");
        return;
    }

    const taskElement = box.closest(".task");
    if (taskElement) {
        taskElement.classList.toggle("completed", box.checked);
    }

    localStorage.setItem(STORAGE_KEYS.task(index), box.checked);
    if (box.checked) {
        addXP(XP_PER_TASK);
    } else {
        addXP(-XP_PER_TASK);
    }

    syncTaskCompletionToServer(index, box.checked);

    const completed = countCompletedCheckboxes();
    const bonusKey = `goldenBonus-${today}`;

    if (completed < checkboxes.length) {
        localStorage.removeItem(bonusKey);
    }

    saveDayStatus(dayNumber, today, completed, false);
    updateProgress();
    updateStreak(today);
    updateStatistics();
    checkGoldenDay(completed);
    loadCalendar();
    updatePieChart();
    updateWeeklyChart();
}

// =====================================================
// 9. PROGRESS SYSTEM
// =====================================================

function updateProgress() {
    const total = checkboxes.length;
    const completed = countCompletedCheckboxes();
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    if (progressPercent) progressPercent.textContent = `${percent}%`;

    if (progressCircle) {
        const radius = progressCircle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        progressCircle.style.strokeDasharray = `${circumference}`;
        progressCircle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
    }

    if (progressText) progressText.textContent = `${completed}/${total} Tasks • ${percent}% Completed`;
    if (todayScoreText) todayScoreText.textContent = `${percent}%`;
}

// =====================================================
// 10. DAILY STATUS RECORDING
// =====================================================

function saveDayStatus(dayNum, dateKey, completedCount, isFinalized = false) {
    if (dayNum > CHALLENGE_LENGTH_DAYS) return;

    localStorage.setItem(STORAGE_KEYS.dayTasks(dayNum), completedCount);

    if (completedCount === checkboxes.length && checkboxes.length > 0) {
        localStorage.setItem(STORAGE_KEYS.dayStatus(dayNum), "green");
    } else if (completedCount > 0) {
        localStorage.setItem(STORAGE_KEYS.dayStatus(dayNum), "yellow");
    } else if (isFinalized) {
        localStorage.setItem(STORAGE_KEYS.dayStatus(dayNum), "red");
    } else {
        localStorage.removeItem(STORAGE_KEYS.dayStatus(dayNum));
    }
}

// =====================================================
// 11. STREAK SYSTEM (TASK-COMPLETION BASED)
// =====================================================

function updateStreak(today) {
    let currentStreak = 0;
    const todayDayNum = getDayNumberForDate(today);
    const todayTasks = countCompletedCheckboxes();

    // 1. If today has at least one completed task, streak includes today
    if (todayTasks > 0) {
        currentStreak = 1;
    }

    // 2. Iterate backward through past days starting from yesterday
    let checkDay = todayDayNum - 1;

    while (checkDay >= 1) {
        const tasks = Number(localStorage.getItem(STORAGE_KEYS.dayTasks(checkDay))) || 0;

        if (tasks > 0) {
            currentStreak++;
        } else {
            // Break streak at the first past day with 0 completed tasks
            break;
        }
        checkDay--;
    }

    streak = currentStreak;
    localStorage.setItem(STORAGE_KEYS.streak, streak);

    if (streak > bestStreak) {
        bestStreak = streak;
        localStorage.setItem(STORAGE_KEYS.bestStreak, bestStreak);
    }

    localStorage.setItem(STORAGE_KEYS.lastVisit, today);

    if (streakText) streakText.textContent = `${streak} Day${streak !== 1 ? "s" : ""}`;
    if (bestStreakText) bestStreakText.textContent = `${bestStreak} Days`;
}

// =====================================================
// 12. STATISTICS
// =====================================================

function updateStatistics() {
    goldenDays = 0;
    totalTasksCompleted = 0;

    const totalTasksPerDay = checkboxes.length || 10;

    for (let i = 1; i <= CHALLENGE_LENGTH_DAYS; i++) {
        const status = localStorage.getItem(STORAGE_KEYS.dayStatus(i));
        const tasks = Number(localStorage.getItem(STORAGE_KEYS.dayTasks(i))) || 0;

        if (status === "green") {
            goldenDays++;
        }
        totalTasksCompleted += tasks;
    }

    const maxTotalTasks = CHALLENGE_LENGTH_DAYS * totalTasksPerDay;
    completionRate = maxTotalTasks > 0 ? Math.round((totalTasksCompleted / maxTotalTasks) * 100) : 0;

    const today = getTodayKey();
    const finished = isChallengeFinished(today);

    // Guard against any residual non-finite day value reaching the UI.
    const safeDayNumber = Number.isFinite(dayNumber)
        ? Math.min(CHALLENGE_LENGTH_DAYS, Math.max(1, Math.trunc(dayNumber)))
        : getDayNumberForDate(today);
    const safeRemaining = Math.max(CHALLENGE_LENGTH_DAYS - safeDayNumber, 0);

    if (goldenDaysText) goldenDaysText.textContent = goldenDays;
    if (completionRateText) completionRateText.textContent = `${completionRate}%`;
    if (daysRemainingText) {
        daysRemainingText.textContent = finished ? 0 : safeRemaining;
    }
    if (totalTasksText) totalTasksText.textContent = `${totalTasksCompleted} / ${maxTotalTasks}`;

    if (monthTasks) monthTasks.textContent = totalTasksCompleted;
    if (monthGolden) monthGolden.textContent = goldenDays;
    if (monthAverage) monthAverage.textContent = `${completionRate}%`;

    if (challengeDayText) {
        if (finished) {
            challengeDayText.textContent = "Challenge Completed!";
        } else {
            challengeDayText.textContent = `Day ${safeDayNumber} / ${CHALLENGE_LENGTH_DAYS}`;
        }
    }
}

// =====================================================
// 13. GOLDEN DAY POPUP
// =====================================================

function checkGoldenDay(completedCount) {
    const today = getTodayKey();
    const bonusKey = `goldenBonus-${today}`;

    if (
        completedCount === checkboxes.length &&
        checkboxes.length > 0 &&
        !localStorage.getItem(bonusKey)
    ) {
        addXP(GOLDEN_DAY_BONUS);
        localStorage.setItem(bonusKey, "true");

        if (popup) popup.style.display = "flex";

        if (typeof confetti === "function") {
            confetti({
                particleCount: 180,
                spread: 90,
                origin: { y: 0.6 }
            });
        }
    }
}

// =====================================================
// 14. 90-DAY CALENDAR
// =====================================================

const CALENDAR_STATUS_LABELS = {
    green: "Golden day",
    yellow: "Partial day",
    red: "Missed day"
};

function loadCalendar() {
    if (!calendar) return;
    calendar.innerHTML = "";

    const fragment = document.createDocumentFragment();

    for (let i = 1; i <= CHALLENGE_LENGTH_DAYS; i++) {
        const day = document.createElement("div");
        day.classList.add("day");
        day.textContent = i;

        const status = localStorage.getItem(STORAGE_KEYS.dayStatus(i));
        if (status === "green" || status === "yellow" || status === "red") {
            day.classList.add(status);
        }

        const isToday = i === dayNumber && !isChallengeFinished();
        let label = `Day ${i}`;

        if (status && CALENDAR_STATUS_LABELS[status]) {
            label += `, ${CALENDAR_STATUS_LABELS[status]}`;
        }

        if (isToday) {
            day.classList.add("is-today");
            label += ", current day";
        }

        // Status must never be conveyed by colour alone.
        day.setAttribute("role", "listitem");
        day.setAttribute("aria-label", label);
        day.title = label;

        fragment.appendChild(day);
    }

    calendar.setAttribute("role", "list");
    calendar.setAttribute("aria-label", "90 day challenge calendar");

    calendar.appendChild(fragment);
}

// =====================================================
// 15. CHARTS MANAGEMENT
// =====================================================

function createCharts() {
    createWeeklyChart();
    createPieChart();
}

/**
 * Derives current weekly chart data directly from calendar dates (Mon - Sun).
 * Strictly bounds checks day numbers within 1..90.
 */
function getWeeklyChartData() {
    const currentWeekDates = getCurrentWeekDates();
    const today = getTodayKey();

    return currentWeekDates.map((dateKey) => {
        if (!challengeStart) return 0;

        const rawDayNum = daysBetween(challengeStart, dateKey) + 1;

        // Return 0 for any date outside the 1..90 challenge period
        if (rawDayNum < 1 || rawDayNum > CHALLENGE_LENGTH_DAYS) {
            return 0;
        }

        if (parseDateKey(dateKey) > parseDateKey(today)) {
            return 0; // Future days
        }

        if (dateKey === today) {
            return countCompletedCheckboxes();
        }

        const savedTasks = localStorage.getItem(STORAGE_KEYS.dayTasks(rawDayNum));
        return savedTasks !== null ? Number(savedTasks) : 0;
    });
}

/* Theme state ---------------------------------------------------------------
   Three explicit, user-selectable themes. The canonical value lives on
   <html data-theme>, which is what the CSS token blocks key off, and is
   mirrored into localStorage under the pre-existing STORAGE_KEYS.theme key so
   that users of the old two-state build keep their saved preference.
   "dark" / "light" are still valid stored values; only the binary model is
   gone.
   ------------------------------------------------------------------------- */

const THEMES = ["dark", "forest", "light"];
const DEFAULT_THEME = "dark";

/* Accepts anything ever written to storage and returns a known theme.
   Legacy "dark" / "light" pass through unchanged; "forest" is new; null,
   undefined, empty string and unknown junk all fall back to Dark. */
function normalizeTheme(value) {
    return THEMES.indexOf(value) !== -1 ? value : DEFAULT_THEME;
}

function getTheme() {
    return normalizeTheme(document.documentElement.getAttribute("data-theme"));
}

/* Chart palette — mirrors the CSS tokens so canvas matches the theme. */
const CHART_THEME = {
    dark: {
        tick: "#737c87",
        grid: "rgba(255,255,255,.07)",
        text: "#f2f5f8",
        accent: "#7cc0f0",
        accentSoft: "rgba(124,192,240,.16)",
        pos: "#46a16b",
        empty: "#1c2027",
        themeColor: "#08090b"
    },
    forest: {
        tick: "#94a3b8",
        grid: "rgba(255,255,255,.08)",
        text: "#ffffff",
        accent: "#38bdf8",
        accentSoft: "rgba(56,189,248,.18)",
        pos: "#22c55e",
        empty: "#334155",
        themeColor: "#0f172a"
    },
    light: {
        tick: "#8a7a61",
        grid: "rgba(96,66,32,.12)",
        text: "#3a2f25",
        accent: "#b0882f",
        accentSoft: "rgba(176,136,47,.16)",
        pos: "#6b8f5e",
        empty: "#eedfc0",
        themeColor: "#f7f0de"
    }
};

function getChartTheme() {
    return CHART_THEME[getTheme()];
}

function createWeeklyChart() {
    if (!ctx || typeof Chart === "undefined") return;

    const existingChart = Chart.getChart(ctx);
    if (existingChart) existingChart.destroy();

    const palette = getChartTheme();

    weeklyChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
                label: "Tasks Completed",
                data: getWeeklyChartData(),
                backgroundColor: palette.accentSoft,
                hoverBackgroundColor: palette.accent,
                borderColor: palette.accent,
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { color: palette.tick },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    max: checkboxes.length || 10,
                    ticks: { color: palette.tick, precision: 0 },
                    grid: { color: palette.grid }
                }
            }
        }
    });
}

function updateWeeklyChart() {
    if (!weeklyChart) {
        createWeeklyChart();
        return;
    }
    weeklyChart.data.datasets[0].data = getWeeklyChartData();
    weeklyChart.update();
}

function createPieChart() {
    if (!pieCtx || typeof Chart === "undefined") return;

    const existingChart = Chart.getChart(pieCtx);
    if (existingChart) existingChart.destroy();

    const completed = countCompletedCheckboxes();
    const palette = getChartTheme();

    pieChart = new Chart(pieCtx, {
        type: "doughnut",
        data: {
            labels: ["Completed", "Remaining"],
            datasets: [{
                data: [completed, checkboxes.length - completed],
                backgroundColor: [palette.pos, palette.empty],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            cutout: "65%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: palette.text,
                        usePointStyle: true,
                        pointStyle: "circle",
                        boxWidth: 8,
                        padding: 16
                    }
                }
            }
        }
    });
}

function updatePieChart() {
    if (!pieChart) {
        createPieChart();
        return;
    }
    const completed = countCompletedCheckboxes();
    pieChart.data.datasets[0].data = [completed, checkboxes.length - completed];
    pieChart.update();
}

// =====================================================
// 16. USER INTERFACE & UTILITIES
// =====================================================

function updateWelcome() {
    const userName = localStorage.getItem(STORAGE_KEYS.userName);
    if (!userName || !welcomeText) return;

    const hour = new Date().getHours();
    let greeting = "Good Morning";

    if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
    else if (hour >= 17 && hour < 21) greeting = "Good Evening";
    else if (hour >= 21 || hour < 5) greeting = "Good Night";

    welcomeText.textContent = `${greeting}, ${userName}`;
}

function updateDate() {
    if (!currentDate) return;
    const options = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
    currentDate.textContent = new Date().toLocaleDateString("en-US", options);
}

function initializeTheme() {

    const menuThemeBtn = document.getElementById("menuThemeBtn");
    const themeRadios = Array.from(document.querySelectorAll('.theme-switch input[name="aceTheme"]'));

    function applyThemeColors() {
        const palette = getChartTheme();

        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", palette.themeColor);

        /* Keeps native widgets (select popups, scrollbars, form controls)
           matching the active theme. Dark and Forest are both dark schemes,
           Light is the only light one. */
        const scheme = document.querySelector('meta[name="color-scheme"]');
        if (scheme) {
            scheme.setAttribute("content", getTheme() === "light" ? "light" : "dark");
        }

        [weeklyChart, pieChart, weightChart].forEach(ch => {
            if (!ch) return;

            if (ch.options.scales) {
                Object.values(ch.options.scales).forEach(scale => {
                    if (scale.ticks) scale.ticks.color = palette.tick;
                    if (scale.grid) scale.grid.color = palette.grid;
                });
            }

            if (ch.options.plugins && ch.options.plugins.legend && ch.options.plugins.legend.labels) {
                ch.options.plugins.legend.labels.color = palette.text;
            }

            const dataset = ch.data && ch.data.datasets && ch.data.datasets[0];

            if (dataset) {
                // Doughnut: [completed, remaining]
                if (Array.isArray(dataset.backgroundColor) && dataset.backgroundColor.length === 2) {
                    dataset.backgroundColor[0] = palette.pos;
                    dataset.backgroundColor[1] = palette.empty;
                }

                // Weight line: transparent fill under the stroke.
                if (dataset.borderColor) {
                    dataset.borderColor = palette.accent;
                    dataset.backgroundColor = palette.accentSoft;
                }
            }

            ch.update();
        });
    }

    /* Reflect the active theme in every theme control. The settings card uses
       a radio group, so only the checked state matters there; the drawer keeps
       a single button that cycles Dark -> Forest -> Light. */
    function updateThemeButtons() {
        const theme = getTheme();
        const label = theme.charAt(0).toUpperCase() + theme.slice(1) + " Mode";

        if (menuThemeBtn) {
            menuThemeBtn.textContent = label;
        }

        themeRadios.forEach(radio => {
            radio.checked = radio.value === theme;
        });
    }

    /* Single entry point for changing theme: writes the attribute the CSS
       keys off, persists it, then syncs controls and charts. */
    function setTheme(theme, { persist = true } = {}) {
        const next = normalizeTheme(theme);

        document.documentElement.setAttribute("data-theme", next);

        if (persist) {
            try {
                localStorage.setItem(STORAGE_KEYS.theme, next);
            } catch (e) { /* storage unavailable - theme still applies */ }
        }

        updateThemeButtons();
        applyThemeColors();
    }

    /* Adopt whatever is already on <html> (set pre-paint by the inline
       bootstrap) and reconcile it with storage. A legacy "light"/"dark"
       value is migrated in place; anything unrecognised is normalised. */
    const current = getTheme();

    try {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
        if (normalizeTheme(savedTheme) !== current) {
            setTheme(savedTheme, { persist: false });
        } else if (savedTheme !== current) {
            localStorage.setItem(STORAGE_KEYS.theme, current);
        }
    } catch (e) { /* storage unavailable */ }

    updateThemeButtons();
    applyThemeColors();

    // Drawer button: cycle through the three themes in order.
    if (menuThemeBtn) {
        menuThemeBtn.addEventListener("click", () => {
            const next = THEMES[(THEMES.indexOf(getTheme()) + 1) % THEMES.length];
            setTheme(next);
        });
    }

    // Settings card: one radio per theme.
    themeRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.checked) {
                setTheme(radio.value);
            }
        });
    });
}

let quoteTimer = null;

// Smoothly rotate the greeting quote. Uses a single controlled timer,
// fades via CSS (opacity + slight translate), and never re-renders the page.
function loadQuote() {
    if (!quote) return;

    // Guard against duplicate rotation timers (e.g. if init runs twice).
    if (quoteTimer) {
        clearInterval(quoteTimer);
        quoteTimer = null;
    }

    let lastIndex = -1;

    const pickQuote = () => {
        let idx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
        if (idx === lastIndex) {
            idx = (idx + 1) % MOTIVATIONAL_QUOTES.length;
        }
        lastIndex = idx;
        return MOTIVATIONAL_QUOTES[idx];
    };

    const reduced =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Initial quote (no animation on first paint).
    quote.textContent = pickQuote();

    if (reduced) return;

    const swap = () => {
        quote.classList.add("quote-swapping");
        // Let the fade-out begin before swapping text.
        setTimeout(() => {
            quote.textContent = pickQuote();
            quote.classList.remove("quote-swapping");
        }, 330);
    };

    quoteTimer = setInterval(swap, 16000);
}

function startClock() {
    if (!liveClock) return;
    const updateClock = () => {
        liveClock.textContent = new Date().toLocaleTimeString();
    };
    updateClock();
    setInterval(updateClock, 1000);
}

// =====================================================
// 17. EXPORT DATA (JSON)
// =====================================================

function initializeExport() {

    const settingsExportBtn =
        document.getElementById("settingsExportBtn");

    function downloadDetailedProgress() {

        const level =
            Math.floor(totalXP / XP_PER_LEVEL) + 1;

        const tasks =
            getTaskNames();

        const dailyProgress = [];

        for (let i = 1; i <= CHALLENGE_LENGTH_DAYS; i++) {

            const status =
                localStorage.getItem(
                    STORAGE_KEYS.dayStatus(i)
                ) || "not-started";

            const completedTasks =
                Number(
                    localStorage.getItem(
                        STORAGE_KEYS.dayTasks(i)
                    )
                ) || 0;

            const date =
                challengeStart
                    ? addDays(challengeStart, i - 1)
                    : null;

            dailyProgress.push({
                day: i,
                date: date,
                status: status,
                completedTasks: completedTasks,
                totalTasks: tasks.length
            });
        }

        const weightHistory =
            getWeightHistory();

        const height =
            Number(
                localStorage.getItem(
                    STORAGE_KEYS.height
                )
            ) || null;

        const progressData = {

            app: "Ace Tracker",

            exportVersion: "2.0",

            exportedAt:
                new Date().toISOString(),

            profile: {
                name:
                    localStorage.getItem(
                        STORAGE_KEYS.userName
                    ) || "User"
            },

            challenge: {
                startDate:
                    challengeStart || null,

                currentDay:
                    dayNumber,

                totalDays:
                    CHALLENGE_LENGTH_DAYS,

                finished:
                    isChallengeFinished()
            },

            overallProgress: {

                level: level,

                totalXP: totalXP,

                xpPerLevel: XP_PER_LEVEL,

                currentStreak: streak,

                bestStreak: bestStreak,

                goldenDays: goldenDays,

                totalTasksCompleted:
                    totalTasksCompleted,

                completionRate:
                    `${completionRate}%`
            },

            tasks: tasks,

            dailyProgress: dailyProgress,

            bodyStats: {

                heightCm: height,

                weightHistory: weightHistory
            }
        };

        const json =
            JSON.stringify(
                progressData,
                null,
                4
            );

        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        const date =
            getTodayKey();

        link.href = url;

        link.download =
            `AceTracker_Progress_${date}.json`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

        console.log(
            "📊 Detailed Ace Tracker progress downloaded."
        );
    }

    // New Settings button
    if (settingsExportBtn) {

        settingsExportBtn.addEventListener(
            "click",
            downloadDetailedProgress
        );
    }

    // Keep the old export button working
    if (exportBtn) {

        exportBtn.addEventListener(
            "click",
            downloadDetailedProgress
        );
    }
}

// =====================================================
// 18. LOGIN & AUTHENTICATION UI
// =====================================================

function initializeLogin() {
    if (!loginScreen) return;

    const savedUser = localStorage.getItem(STORAGE_KEYS.userName);
    loginScreen.style.display = savedUser ? "none" : "flex";

    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            const name = loginName ? loginName.value.trim() : "";
            if (!name) {
                alert("Please enter your name.");
                return;
            }
            localStorage.setItem(STORAGE_KEYS.userName, name);
            location.reload();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem(STORAGE_KEYS.userName);
            location.reload();
        });
    }
}

// =====================================================
// 19. GLOBAL RESET BUTTON
// =====================================================

function initializeResetButton() {
    if (!resetBtn) return;

    resetBtn.addEventListener("click", () => {
        const confirmReset = confirm("This will erase ALL progress, streaks, XP, and calendar data.\n\nAre you sure?");
        if (!confirmReset) return;

        const savedName = localStorage.getItem(STORAGE_KEYS.userName);
        // Normalised on the way out, so a legacy stored value is upgraded to
        // the current three-theme vocabulary rather than being restored as-is.
        const savedTheme = normalizeTheme(localStorage.getItem(STORAGE_KEYS.theme));

        localStorage.clear();

        if (savedName) localStorage.setItem(STORAGE_KEYS.userName, savedName);
        localStorage.setItem(STORAGE_KEYS.theme, savedTheme);

        alert("Ace Tracker progress has been reset.");
        location.reload();
    });
}

// =====================================================
// 20. PWA & SERVICE WORKER
// =====================================================

function initializePWA() {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("/service-worker.js")
                .then(() => console.log("Ace Tracker PWA Ready 🚀"))
                .catch((err) => console.log("Service Worker Error:", err));
        });
    }

    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        if (installBtn) installBtn.style.display = "block";
    });

    if (installBtn) {
        installBtn.addEventListener("click", async () => {
            if (!deferredInstallPrompt) return;
            deferredInstallPrompt.prompt();
            await deferredInstallPrompt.userChoice;
            deferredInstallPrompt = null;
            installBtn.style.display = "none";
        });
    }
}

// =====================================================
// TASK CUSTOMIZER - BUTTON CONNECTION TEST
// =====================================================

// =====================================================
// TASK CUSTOMIZER - PANEL TEST
// =====================================================

const taskCustomizerBtn = document.getElementById("taskCustomizerBtn");
const taskCustomizerPanel = document.getElementById("taskCustomizerPanel");
const closeTaskCustomizer = document.getElementById("closeTaskCustomizer");

if (taskCustomizerBtn && taskCustomizerPanel) {

    taskCustomizerBtn.addEventListener("click", () => {
        taskCustomizerPanel.style.display = "block";
    });

}

if (closeTaskCustomizer && taskCustomizerPanel) {

    closeTaskCustomizer.addEventListener("click", () => {
        taskCustomizerPanel.style.display = "none";
    });

}
// =====================================================
// TASK CUSTOMIZER - OPEN CUSTOMIZER
// =====================================================

// Load the tasks whenever the Customizer button is clicked
if (taskCustomizerBtn) {

    taskCustomizerBtn.addEventListener("click", () => {

        loadTasksIntoCustomizer();

    });

}


// =====================================================
// TASK CUSTOMIZER - TASK CONFIGURATION
// =====================================================

const DEFAULT_TASK_NAMES = [
    "😴 Get Good Sleep",
    "💪 Eat 100g+ Protein",
    "🏋 Hit the Gym",
    "💧 Drink 4 Litres Water",
    "⚡ Take Creatine",
    "💻 Learn Cybersecurity",
    "🚶 Walk 8000 Steps",
    "🥗 Stay in Calorie Deficit",
    "🔥 30 Push-ups",
    "⭐ Daily Custom Task"
];

function getTaskNames() {
    const savedTasks = localStorage.getItem("aceTaskNames");

    if (savedTasks) {
        try {
            const parsed = JSON.parse(savedTasks);

            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch (error) {
            console.warn("Could not load saved task names.");
        }
    }

    localStorage.setItem(
        "aceTaskNames",
        JSON.stringify(DEFAULT_TASK_NAMES)
    );

    return [...DEFAULT_TASK_NAMES];
}


// =====================================================
// TASK DASHBOARD RENDERER
// =====================================================

function renderTaskList() {

    const taskList = document.getElementById("taskList");

    if (!taskList) return;

    const taskNames = getTaskNames();

    taskList.innerHTML = "";

    taskNames.forEach((taskName, index) => {

        const label = document.createElement("label");
        label.className = "task";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "taskCheck";

        const span = document.createElement("span");
        span.textContent = taskName;

        label.appendChild(checkbox);
        label.appendChild(span);

        taskList.appendChild(label);
    });

    // Refresh checkbox collection
    checkboxes = document.querySelectorAll(".taskCheck");

    // Reconnect listeners
    taskListenersInitialized = false;
    initTaskListeners();

    // Restore today's progress
    loadTasks();

    // Update everything
    updateProgress();
    updateStatistics();
    updatePieChart();
    updateWeeklyChart();
}


// =====================================================
// TASK CUSTOMIZER - DISPLAY TASKS
// =====================================================

function loadTasksIntoCustomizer() {

    const customizerTaskList =
        document.getElementById("customizerTaskList");

    if (!customizerTaskList) return;

    const taskNames = getTaskNames();

    customizerTaskList.innerHTML = "";

    taskNames.forEach((taskText, index) => {

        customizerTaskList.appendChild(
            buildCustomizerTaskRow(index, taskText)
        );
    });
}

// Which row, if any, currently has its name editor open. Held in module
// scope rather than in the DOM so a full re-render can restore the same
// state. null means every row is showing its read view.
let editingTaskIndex = null;

function buildCustomizerTaskRow(index, taskText) {

    const taskRow = document.createElement("div");

    taskRow.className = "customizer-task-row";

    taskRow.dataset.index = index;

    renderCustomizerTaskRow(taskRow, index, taskText);

    return taskRow;
}

// Renders one row in whichever of its two states it is in: the read view, or
// an editor prefilled with the current name. Kept as a single function so
// closing an editor can never leave a half-updated row behind.
function renderCustomizerTaskRow(taskRow, index, taskText) {

    const isEditing = editingTaskIndex === index;

    taskRow.classList.toggle("is-editing", isEditing);

    taskRow.innerHTML = "";

    if (!isEditing) {

        const number = document.createElement("span");
        number.className = "customizer-task-number";
        number.textContent = index + 1;

        const name = document.createElement("span");
        name.className = "customizer-task-name";
        name.textContent = taskText;

        const actions = document.createElement("div");
        actions.className = "customizer-task-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-task-btn";
        editButton.dataset.index = index;
        editButton.textContent = "Edit";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-task-btn";
        deleteButton.dataset.index = index;
        deleteButton.textContent = "Delete";

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        taskRow.appendChild(number);
        taskRow.appendChild(name);
        taskRow.appendChild(actions);

        return taskRow;
    }

    const editor = document.createElement("div");
    editor.className = "customizer-task-editor";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "customizer-task-input";
    input.value = taskText;
    input.dataset.index = index;
    input.setAttribute("aria-label", "Task name");

    const editorActions = document.createElement("div");
    editorActions.className = "customizer-task-editor-actions";

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "btn btn-primary save-task-name-btn";
    saveButton.dataset.index = index;
    saveButton.textContent = "Save";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "btn btn-ghost cancel-task-name-btn";
    cancelButton.dataset.index = index;
    cancelButton.textContent = "Cancel";

    editorActions.appendChild(saveButton);
    editorActions.appendChild(cancelButton);

    editor.appendChild(input);
    editor.appendChild(editorActions);

    const error = document.createElement("p");
    error.className = "customizer-task-error";
    error.hidden = true;

    // Enter commits, Escape backs out - so the editor never traps the user.
    input.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {
            event.preventDefault();
            commitTaskNameEditor(taskRow, index);
        }

        if (event.key === "Escape") {
            event.preventDefault();
            closeTaskNameEditor(taskRow, index);
        }

    });

    taskRow.appendChild(editor);
    taskRow.appendChild(error);

    // Prefilled and ready to overwrite, matching the old prompt() behaviour.
    input.focus();
    input.select();

    return taskRow;
}

function openTaskNameEditor(taskRow, index) {

    const taskNames = getTaskNames();

    const taskText = taskNames[index];

    if (typeof taskText !== "string") return;

    // Only one editor at a time, so close any other open row first.
    if (editingTaskIndex !== null && editingTaskIndex !== index) {

        const taskNamesNow = getTaskNames();
        const previousRow = taskRow.parentElement
            ?.querySelector(
                `.customizer-task-row[data-index="${editingTaskIndex}"]`
            );

        if (previousRow) {

            closeTaskNameEditor(
                previousRow,
                editingTaskIndex,
                taskNamesNow[editingTaskIndex]
            );
        }

    }

    editingTaskIndex = index;

    renderCustomizerTaskRow(taskRow, index, taskText);
}

function closeTaskNameEditor(taskRow, index, taskText) {

    const taskNames = getTaskNames();

    editingTaskIndex = null;

    renderCustomizerTaskRow(
        taskRow,
        index,
        typeof taskText === "string"
            ? taskText
            : taskNames[index]
    );

    // Return the user to the control they came from.
    const editButton =
        taskRow.querySelector(".edit-task-btn");

    if (editButton) editButton.focus();
}

function commitTaskNameEditor(taskRow, index) {

    const input =
        taskRow.querySelector(".customizer-task-input");

    if (!input) return;

    const error =
        taskRow.querySelector(".customizer-task-error");

    const trimmedName = input.value.trim();

    // An empty name is rejected in place, leaving the editor open so the
    // typed text is never thrown away.
    if (!trimmedName) {

        if (error) {
            error.textContent = "Task name cannot be empty.";
            error.hidden = false;
        }

        input.focus();

        return;
    }

    const taskNames = getTaskNames();

    // Saving an unchanged name is a no-op: nothing is written and the row
    // simply returns to its read view.
    if (taskNames[index] === trimmedName) {

        closeTaskNameEditor(taskRow, index, trimmedName);

        return;
    }

    taskNames[index] = trimmedName;

    localStorage.setItem(
        "aceTaskNames",
        JSON.stringify(taskNames)
    );

    syncRenamedTaskLabel(index, trimmedName);

    // Only the notifications list caches a task name; refresh it so a rename
    // cannot go stale there. The dashboard is patched in place instead of
    // re-rendered, which keeps checkboxes, progress, XP and streaks exactly
    // as they were.
    if (notificationTaskList) {
        renderNotificationTaskList();
    }

    closeTaskNameEditor(taskRow, index, trimmedName);
}

// A rename does not change completion state or any statistic, so the visible
// label is updated directly rather than rebuilding the whole task list.
function syncRenamedTaskLabel(index, name) {

    const task = document.querySelectorAll(
        "#taskList .task"
    )[index];

    if (!task) return;

    const label = task.querySelector("span");

    if (label) label.textContent = name;
}

// =====================================================
// TASK CUSTOMIZER - EDIT TASK
// =====================================================

document.addEventListener("click", (event) => {

    const editButton =
        event.target.closest(".edit-task-btn");

    if (editButton) {

        const taskRow = editButton.closest(
            ".customizer-task-row"
        );

        if (!taskRow) return;

        openTaskNameEditor(
            taskRow,
            Number(editButton.dataset.index)
        );

        return;
    }

    const saveButton =
        event.target.closest(".save-task-name-btn");

    if (saveButton) {

        const taskRow = saveButton.closest(
            ".customizer-task-row"
        );

        if (!taskRow) return;

        commitTaskNameEditor(
            taskRow,
            Number(saveButton.dataset.index)
        );

        return;
    }

    const cancelButton =
        event.target.closest(".cancel-task-name-btn");

    if (cancelButton) {

        const taskRow = cancelButton.closest(
            ".customizer-task-row"
        );

        if (!taskRow) return;

        const index = Number(cancelButton.dataset.index);

        closeTaskNameEditor(taskRow, index);

        return;
    }

});


// =====================================================
// TASK CUSTOMIZER - ADD TASK
// =====================================================

const addTaskBtn = document.getElementById("addTaskBtn");

if (addTaskBtn) {

    addTaskBtn.addEventListener("click", () => {

        const taskName = prompt(
            "Enter the name of your new task:"
        );

        if (taskName === null) return;

        const trimmedName = taskName.trim();

        if (!trimmedName) {
            alert("Task name cannot be empty.");
            return;
        }

        const taskNames = getTaskNames();

        taskNames.push(trimmedName);

        localStorage.setItem(
            "aceTaskNames",
            JSON.stringify(taskNames)
        );

        renderTaskList();
        loadTasksIntoCustomizer();
    });
}


// =====================================================
// INITIAL TASK RENDER
// =====================================================

renderTaskList();

// =====================================================
// TASK CUSTOMIZER - DELETE TASK
// =====================================================

document.addEventListener("click", (event) => {

    const deleteButton = event.target.closest(".delete-task-btn");

    if (!deleteButton) return;

    const index = Number(deleteButton.dataset.index);

    const taskNames = getTaskNames();

    if (taskNames.length <= 1) {
        alert("You must keep at least one task.");
        return;
    }

    const taskName = taskNames[index];

    const confirmed = confirm(
        `Delete "${taskName}"?\n\nThis task will be removed from your daily tracker.`
    );

    if (!confirmed) return;

    taskNames.splice(index, 1);

    localStorage.setItem(
        "aceTaskNames",
        JSON.stringify(taskNames)
    );

    // Rebuild dashboard
    renderTaskList();

    // Rebuild customizer
    loadTasksIntoCustomizer();
});

// =====================================================
// WEIGHT & BMI TRACKER
// =====================================================

function getWeightHistory() {

    const savedHistory =
        localStorage.getItem(STORAGE_KEYS.weightHistory);

    if (!savedHistory) {
        return [];
    }

    try {

        const history = JSON.parse(savedHistory);

        if (!Array.isArray(history)) {
            return [];
        }

        return history;

    } catch (error) {

        console.warn("Could not load weight history.");
        return [];

    }
}


function saveWeightHistory(history) {

    localStorage.setItem(
        STORAGE_KEYS.weightHistory,
        JSON.stringify(history)
    );

}


// =====================================================
// HEIGHT
// =====================================================

function loadHeight() {

    const savedHeight =
        localStorage.getItem(STORAGE_KEYS.height);

    if (savedHeight && heightInput) {

        heightInput.value = savedHeight;

    }

}


function saveHeight() {

    if (!heightInput) return;

    const height =
        Number(heightInput.value);

    if (!height || height <= 0) {

        alert("Please enter a valid height.");

        return;

    }

    localStorage.setItem(
        STORAGE_KEYS.height,
        height
    );

    updateBodyStats();

    alert("Height saved successfully.");

}


// =====================================================
// ADD WEIGHT
// =====================================================

function addWeight() {

    if (!weightInput) return;

    const weight =
        Number(weightInput.value);

    if (!weight || weight <= 0) {

        alert("Please enter a valid weight.");

        return;

    }

    const today =
        getTodayKey();

    const history =
        getWeightHistory();


    // If today's weight already exists,
    // update today's entry instead of creating duplicate entries.

    const existingIndex =
        history.findIndex(
            entry => entry.date === today
        );


    if (existingIndex !== -1) {

        history[existingIndex].weight = weight;

    } else {

        history.push({
            date: today,
            weight: weight
        });

    }


    // Sort oldest → newest

    history.sort(
        (a, b) =>
            parseDateKey(a.date) -
            parseDateKey(b.date)
    );


    saveWeightHistory(history);

    weightInput.value = "";

    updateBodyStats();
    renderWeightHistory();
    updateWeightChart();

}


// =====================================================
// DELETE WEIGHT
// =====================================================

function deleteWeight(index) {

    const history =
        getWeightHistory();

    if (!history[index]) return;


    const confirmed =
        confirm(
            "Delete this weight entry?"
        );

    if (!confirmed) return;


    history.splice(index, 1);

    saveWeightHistory(history);

    updateBodyStats();
    renderWeightHistory();
    updateWeightChart();

}


// =====================================================
// BMI CALCULATION
// =====================================================

function calculateBMI(weight, heightCm) {

    if (
        !weight ||
        !heightCm ||
        weight <= 0 ||
        heightCm <= 0
    ) {

        return null;

    }


    const heightMeters =
        heightCm / 100;


    return weight /
        (heightMeters * heightMeters);

}


function getBMICategory(bmi) {

    if (bmi === null) {
        return "—";
    }

    if (bmi < 18.5) {
        return "Underweight";
    }

    if (bmi < 25) {
        return "Healthy range";
    }

    if (bmi < 30) {
        return "Overweight";
    }

    return "Obesity range";

}


// =====================================================
// UPDATE BODY STATS
// =====================================================

function updateBodyStats() {

    const history =
        getWeightHistory();

    const height =
        Number(
            localStorage.getItem(
                STORAGE_KEYS.height
            )
        );


    if (!history.length) {

        if (currentWeightText)
            currentWeightText.textContent = "—";

        if (currentBMIText)
            currentBMIText.textContent = "—";

        if (bmiCategoryText)
            bmiCategoryText.textContent = "—";

        if (weightChangeText)
            weightChangeText.textContent = "—";

        return;

    }


    const latest =
        history[history.length - 1];

    const currentWeight =
        Number(latest.weight);


    if (currentWeightText) {

        currentWeightText.textContent =
            `${currentWeight.toFixed(1)} kg`;

    }


    // BMI

    const bmi =
        calculateBMI(
            currentWeight,
            height
        );


    if (currentBMIText) {

        currentBMIText.textContent =
            bmi !== null
                ? bmi.toFixed(1)
                : "—";

    }


    if (bmiCategoryText) {

        bmiCategoryText.textContent =
            getBMICategory(bmi);

    }


    // Weight change

    if (weightChangeText) {

        if (history.length < 2) {

            weightChangeText.textContent =
                "—";

        } else {

            const firstWeight =
                Number(history[0].weight);

            const difference =
                currentWeight -
                firstWeight;


            const sign =
                difference > 0
                    ? "+"
                    : "";


            weightChangeText.textContent =
                `${sign}${difference.toFixed(1)} kg`;

        }

    }

}


// =====================================================
// WEIGHT HISTORY DISPLAY
// =====================================================

function renderWeightHistory() {

    if (!weightHistoryContainer) return;


    const history =
        getWeightHistory();


    weightHistoryContainer.innerHTML = "";


    if (!history.length) {

        const emptyMessage =
            document.createElement("p");

        emptyMessage.className =
            "no-weight-data";

        emptyMessage.textContent =
            "No weight entries yet.";

        weightHistoryContainer.appendChild(
            emptyMessage
        );

        return;

    }


    // Newest first

    [...history]
        .reverse()
        .forEach((entry, reversedIndex) => {

            const originalIndex =
                history.length -
                1 -
                reversedIndex;


            const row =
                document.createElement("div");

            row.className =
                "weight-history-row";


            const date =
                document.createElement("span");

            date.className =
                "weight-history-date";


            const formattedDate =
                parseDateKey(entry.date)
                    .toLocaleDateString(
                        "en-US",
                        {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            timeZone: "UTC"
                        }
                    );


            date.textContent =
                formattedDate;


            const value =
                document.createElement("span");

            value.className =
                "weight-history-value";

            value.textContent =
                `${Number(entry.weight).toFixed(1)} kg`;


            const deleteButton =
                document.createElement("button");

            deleteButton.className =
                "delete-weight-btn";

            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                () => deleteWeight(originalIndex)
            );


            row.appendChild(date);
            row.appendChild(value);
            row.appendChild(deleteButton);


            weightHistoryContainer.appendChild(
                row
            );

        });

}


// =====================================================
// WEIGHT CHART
// =====================================================

function createWeightChart() {

    if (
        !weightChartCanvas ||
        typeof Chart === "undefined"
    ) {
        return;
    }


    const existingChart =
        Chart.getChart(weightChartCanvas);

    if (existingChart) {

        existingChart.destroy();

    }


    const history =
        getWeightHistory();


    const labels =
        history.map(
            entry => {

                return parseDateKey(entry.date)
                    .toLocaleDateString(
                        "en-US",
                        {
                            day: "numeric",
                            month: "short",
                            timeZone: "UTC"
                        }
                    );

            }
        );


    const weights =
        history.map(
            entry =>
                Number(entry.weight)
        );


    weightChart =
        new Chart(
            weightChartCanvas,
            {
                type: "line",

                data: {

                    labels: labels,

                    datasets: [{

                        label: "Weight (kg)",

                        data: weights,

                        borderColor:
                            getChartTheme().accent,

                        backgroundColor:
                            getChartTheme().accentSoft,

                        pointBackgroundColor:
                            getChartTheme().accent,

                        pointBorderColor:
                            getChartTheme().themeColor,

                        fill: true,

                        borderWidth: 2,

                        tension: 0.35,

                        pointRadius: 4,

                        pointHoverRadius: 6

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: true,

                    plugins: {

                        legend: {
                            display: true
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: false,

                            title: {
                                display: true,
                                text: "Weight (kg)"
                            }

                        },

                        x: {

                            title: {
                                display: true,
                                text: "Date"
                            }

                        }

                    }

                }

            }
        );

}


function updateWeightChart() {

    createWeightChart();

}


// =====================================================
// INITIALIZE WEIGHT & BMI
// =====================================================

function initializeWeightTracker() {

    if (saveHeightBtn) {

        saveHeightBtn.addEventListener(
            "click",
            saveHeight
        );

    }


    if (addWeightBtn) {

        addWeightBtn.addEventListener(
            "click",
            addWeight
        );

    }


    loadHeight();

    updateBodyStats();

    renderWeightHistory();

    createWeightChart();

}

// =====================================================
// ACE TRACKER - NOTIFICATION SYSTEM
// =====================================================

const NOTIFICATION_KEYS = {

    enabled: "aceNotificationsEnabled",

    taskSettings: "aceTaskNotificationSettings",

    goldenDayEnabled: "aceGoldenDayNotificationEnabled",

    lastNotification: "aceLastNotification"

};

// =====================================================
// TASK NOTIFICATION DEFAULT SETTINGS
// =====================================================

const DEFAULT_TASK_NOTIFICATION_SETTINGS = {

    enabled: false,

    // once = once per day
    // 30min = every 30 minutes
    // 1hour = every 1 hour
    // 2hours = every 2 hours
    // 3hours = every 3 hours
    // custom = custom interval
    frequency: "once",

    // Used ONLY for "once per day"
    reminderTime: "20:00",

    // Used for repeating notifications
    startTime: "09:00",
    endTime: "21:00",

    // Used for repeating notifications
    customInterval: 60,

    // 0 = unlimited
    maxNotifications: 1,

    stopWhenCompleted: true,

    messageType: "default",

    customMessage: ""

};

// =====================================================
// GET ALL TASK NOTIFICATION SETTINGS
// =====================================================

function getTaskNotificationSettings() {

    const taskNames = getTaskNames();

    let savedSettings = {};

    try {

        savedSettings =
            JSON.parse(
                localStorage.getItem(
                    NOTIFICATION_KEYS.taskSettings
                )
            ) || {};

    } catch (error) {

        console.warn(
            "Could not load notification settings:",
            error
        );

    }


    const settings = {};


    taskNames.forEach((taskName, index) => {

        const existing =
            savedSettings[index] || {};

        settings[index] = {

            ...DEFAULT_TASK_NOTIFICATION_SETTINGS,

            ...existing,

            taskName: taskName

        };


    });


    return settings;

}


// =====================================================
// SAVE ALL TASK NOTIFICATION SETTINGS
// =====================================================

function saveTaskNotificationSettings(settings) {

    localStorage.setItem(

        NOTIFICATION_KEYS.taskSettings,

        JSON.stringify(settings)

    );

}

// =====================================================
// RENDER TASK NOTIFICATION CARDS
// =====================================================

function renderNotificationTaskList() {

    if (!notificationTaskList) return;

    const taskNames = getTaskNames();

    const settings = getTaskNotificationSettings();

    notificationTaskList.innerHTML = "";


    if (!taskNames.length) {

        const emptyMessage =
            document.createElement("p");

        emptyMessage.textContent =
            "No tasks available.";

        emptyMessage.className =
            "notification-empty";

        notificationTaskList.appendChild(
            emptyMessage
        );

        return;
    }


    taskNames.forEach((taskName, index) => {

        const taskSettings =
            settings[index];


        // =============================================
        // CARD
        // =============================================

        const card =
            document.createElement("div");

        card.className =
            "notification-task-card";


        // =============================================
        // HEADER
        // =============================================

        const header =
            document.createElement("div");

        header.className =
            "notification-task-header";


        const title =
            document.createElement("h4");

        title.textContent =
            taskName;


        // =============================================
        // ON / OFF SWITCH
        // =============================================

        const toggle =
            document.createElement("input");

        toggle.type =
            "checkbox";

        toggle.checked =
            taskSettings.enabled;

        toggle.className =
            "task-notification-toggle";


        toggle.addEventListener(
            "change",
            () => {

                taskSettings.enabled =
                    toggle.checked;

                settings[index] =
                    taskSettings;

                saveTaskNotificationSettings(
                    settings
                );

                renderNotificationTaskList();

                syncTaskReminderToServer(
                    index,
                    taskSettings
                );

            }
        );


        header.appendChild(title);

        header.appendChild(toggle);


        card.appendChild(header);


        // =============================================
        // OFF STATE
        // =============================================

        if (!taskSettings.enabled) {

            const offText =
                document.createElement("p");

            offText.className =
                "notification-task-description";

            offText.textContent =
                "🔕 Notifications are OFF for this task.";

            card.appendChild(
                offText
            );


            notificationTaskList.appendChild(
                card
            );

            return;

        }


        // =============================================
        // ON STATE
        // =============================================

        const status =
            document.createElement("p");

        status.className =
            "notification-task-description";

        status.textContent =
            `🔔 ON • ${getNotificationSummary(
                taskSettings
            )}`;

        card.appendChild(
            status
        );


        // =============================================
        // CONFIGURE BUTTON
        // =============================================

        const configureButton =
            document.createElement("button");

        configureButton.type =
            "button";

        configureButton.className =
            "configure-task-notification";

        configureButton.textContent =
            "Edit";

        configureButton.addEventListener(
            "click",
            () => {

                openTaskNotificationEditor(
                    index
                );

            }
        );


        card.appendChild(
            configureButton
        );


        notificationTaskList.appendChild(
            card
        );

    });

}

function getNotificationSummary(settings) {

    if (settings.frequency === "once") {

        return `Once daily at ${formatTime(
            settings.reminderTime || "20:00"
        )}`;

    }


    if (settings.frequency === "custom") {

        return `Every ${settings.customInterval || 60} minutes`;

    }


    return getNotificationFrequencyLabel(
        settings.frequency
    );

}

function getNotificationFrequencyLabel(frequency) {

    if (frequency === "30min") return "Every 30 minutes";
    if (frequency === "1hour") return "Every 1 hour";
    if (frequency === "2hours") return "Every 2 hours";
    if (frequency === "3hours") return "Every 3 hours";
    if (frequency === "custom") return "Custom interval";

    return "Once per day";

}

function formatTime(time) {

    if (!time) return "";

    const [hours, minutes] =
        time.split(":");

    const date =
        new Date();

    date.setHours(
        Number(hours),
        Number(minutes)
    );

    return date.toLocaleTimeString(
        [],
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// =====================================================
// TASK NOTIFICATION EDITOR
// =====================================================

function openTaskNotificationEditor(index) {

    const taskNames = getTaskNames();

    const taskName =
        taskNames[index];

    if (!taskName) return;


    const settings =
        getTaskNotificationSettings();

    const taskSettings =
        settings[index];


    const existingEditor =
        document.getElementById(
            "taskNotificationEditor"
        );

    if (existingEditor) {
        existingEditor.remove();
    }


    // =================================================
    // OVERLAY
    // =================================================

    const overlay =
        document.createElement("div");

    overlay.id =
        "taskNotificationEditor";

    overlay.className =
        "task-notification-editor";


    const content =
        document.createElement("div");

    content.className =
        "task-notification-editor-content";


    // =================================================
    // HEADER
    // =================================================

    const header =
        document.createElement("div");

    header.className =
        "task-notification-editor-header";


    const title =
        document.createElement("h2");

    title.textContent =
        `🔔 ${taskName}`;


    const closeButton =
        document.createElement("button");

    closeButton.type =
        "button";

    closeButton.textContent =
        "✕";

    closeButton.className =
        "close-task-notification-editor";


    header.appendChild(title);

    header.appendChild(closeButton);

    content.appendChild(header);


    // =================================================
    // FREQUENCY
    // =================================================

    const frequencyRow =
        document.createElement("div");

    frequencyRow.className =
        "notification-editor-field";


    const frequencyLabel =
        document.createElement("label");

    frequencyLabel.textContent =
        "⏱ Frequency";


    const frequencySelect =
        document.createElement("select");


    const frequencyOptions = [

        ["once", "Once per day"],

        ["30min", "Every 30 minutes"],

        ["1hour", "Every 1 hour"],

        ["2hours", "Every 2 hours"],

        ["3hours", "Every 3 hours"],

        ["custom", "Custom interval"]

    ];


    frequencyOptions.forEach(
        ([value, text]) => {

            const option =
                document.createElement("option");

            option.value =
                value;

            option.textContent =
                text;

            frequencySelect.appendChild(
                option
            );

        }
    );


    frequencySelect.value =
        taskSettings.frequency;


    frequencyRow.appendChild(
        frequencyLabel
    );

    frequencyRow.appendChild(
        frequencySelect
    );

    content.appendChild(
        frequencyRow
    );


    // =================================================
    // ONCE PER DAY SETTINGS
    // =================================================

    const onceSettings =
        document.createElement("div");

    onceSettings.className =
        "notification-frequency-settings";


    const reminderTimeRow =
        document.createElement("div");

    reminderTimeRow.className =
        "notification-editor-field";


    const reminderTimeLabel =
        document.createElement("label");

    reminderTimeLabel.textContent =
        "🕐 Reminder time";


    const reminderTimeInput =
        document.createElement("input");

    reminderTimeInput.type =
        "time";

    reminderTimeInput.value =
        taskSettings.reminderTime ||
        "20:00";


    reminderTimeRow.appendChild(
        reminderTimeLabel
    );

    reminderTimeRow.appendChild(
        reminderTimeInput
    );


    onceSettings.appendChild(
        reminderTimeRow
    );


    // =================================================
    // REPEATING SETTINGS
    // =================================================

    const repeatingSettings =
        document.createElement("div");

    repeatingSettings.className =
        "notification-frequency-settings";


    // START TIME

    const startRow =
        document.createElement("div");

    startRow.className =
        "notification-editor-field";


    const startLabel =
        document.createElement("label");

    startLabel.textContent =
        "🕐 Start time";


    const startInput =
        document.createElement("input");

    startInput.type =
        "time";

    startInput.value =
        taskSettings.startTime ||
        "09:00";


    startRow.appendChild(
        startLabel
    );

    startRow.appendChild(
        startInput
    );


    repeatingSettings.appendChild(
        startRow
    );


    // END TIME

    const endRow =
        document.createElement("div");

    endRow.className =
        "notification-editor-field";


    const endLabel =
        document.createElement("label");

    endLabel.textContent =
        "🕘 End time";


    const endInput =
        document.createElement("input");

    endInput.type =
        "time";

    endInput.value =
        taskSettings.endTime ||
        "21:00";


    endRow.appendChild(
        endLabel
    );

    endRow.appendChild(
        endInput
    );


    repeatingSettings.appendChild(
        endRow
    );


    // MAX REMINDERS

    const maxRow =
        document.createElement("div");

    maxRow.className =
        "notification-editor-field";


    const maxLabel =
        document.createElement("label");

    maxLabel.textContent =
        "🔢 Maximum reminders";


    const maxInput =
        document.createElement("input");

    maxInput.type =
        "number";

    maxInput.min =
        "1";

    maxInput.max =
        "100";

    maxInput.value =
        taskSettings.maxNotifications === 0
            ? ""
            : taskSettings.maxNotifications;


    maxInput.placeholder =
        "Leave empty for unlimited";


    maxRow.appendChild(
        maxLabel
    );

    maxRow.appendChild(
        maxInput
    );


    repeatingSettings.appendChild(
        maxRow
    );


    // CUSTOM INTERVAL

    const customIntervalRow =
        document.createElement("div");

    customIntervalRow.className =
        "notification-editor-field";


    const customIntervalLabel =
        document.createElement("label");

    customIntervalLabel.textContent =
        "⏱ Interval in minutes";


    const customIntervalInput =
        document.createElement("input");

    customIntervalInput.type =
        "number";

    customIntervalInput.min =
        "5";

    customIntervalInput.max =
        "1440";

    customIntervalInput.step =
        "5";

    customIntervalInput.value =
        taskSettings.customInterval ||
        60;


    customIntervalRow.appendChild(
        customIntervalLabel
    );

    customIntervalRow.appendChild(
        customIntervalInput
    );


    repeatingSettings.appendChild(
        customIntervalRow
    );


    // =================================================
    // STOP WHEN COMPLETED
    // =================================================

    const completedRow =
        document.createElement("div");

    completedRow.className =
        "notification-editor-row";


    const completedLabel =
        document.createElement("label");

    completedLabel.textContent =
        "Stop when task is completed";


    const completedCheckbox =
        document.createElement("input");

    completedCheckbox.type =
        "checkbox";

    completedCheckbox.checked =
        taskSettings.stopWhenCompleted;


    completedRow.appendChild(
        completedLabel
    );

    completedRow.appendChild(
        completedCheckbox
    );

    content.appendChild(
        completedRow
    );


    // =================================================
    // MESSAGE TYPE
    // =================================================

    const messageRow =
        document.createElement("div");

    messageRow.className =
        "notification-editor-field";


    const messageLabel =
        document.createElement("label");

    messageLabel.textContent =
        "💬 Message type";


    const messageSelect =
        document.createElement("select");


    [
        ["default", "Ace default message"],
        ["motivational", "Motivational"],
        ["short", "Short reminder"],
        ["custom", "Custom message"]

    ].forEach(
        ([value, text]) => {

            const option =
                document.createElement("option");

            option.value =
                value;

            option.textContent =
                text;

            messageSelect.appendChild(
                option
            );

        }
    );


    messageSelect.value =
        taskSettings.messageType ||
        "default";


    messageRow.appendChild(
        messageLabel
    );

    messageRow.appendChild(
        messageSelect
    );

    content.appendChild(
        messageRow
    );


    // =================================================
    // CUSTOM MESSAGE
    // =================================================

    const customMessageRow =
        document.createElement("div");

    customMessageRow.className =
        "notification-editor-field";


    const customMessageLabel =
        document.createElement("label");

    customMessageLabel.textContent =
        "Custom message";


    const customMessage =
        document.createElement("textarea");

    customMessage.placeholder =
        "Write your notification...";

    customMessage.value =
        taskSettings.customMessage ||
        "";


    customMessageRow.appendChild(
        customMessageLabel
    );

    customMessageRow.appendChild(
        customMessage
    );

    content.appendChild(
        customMessageRow
    );


    // =================================================
    // SAVE
    // =================================================

    const saveButton =
        document.createElement("button");

    saveButton.type =
        "button";

    saveButton.className =
        "save-task-notification";

    saveButton.textContent =
        "💾 Save Task Settings";


    saveButton.addEventListener(
        "click",
        () => {

            const frequency =
                frequencySelect.value;


            // =========================================
            // VALIDATION
            // =========================================

            if (
                frequency === "custom" &&
                Number(customIntervalInput.value) < 5
            ) {

                alert(
                    "Custom interval must be at least 5 minutes."
                );

                return;

            }


            if (
                frequency !== "once" &&
                startInput.value >= endInput.value
            ) {

                alert(
                    "End time must be later than start time."
                );

                return;

            }


            // =========================================
            // SAVE
            // =========================================

            taskSettings.frequency =
                frequency;

            taskSettings.reminderTime =
                reminderTimeInput.value;

            taskSettings.startTime =
                startInput.value;

            taskSettings.endTime =
                endInput.value;

            taskSettings.customInterval =
                Number(
                    customIntervalInput.value
                ) || 60;


            const maxValue =
                Number(maxInput.value);


            taskSettings.maxNotifications =
                maxInput.value.trim() === ""
                    ? 0
                    : Math.max(
                        1,
                        maxValue
                    );


            taskSettings.stopWhenCompleted =
                completedCheckbox.checked;

            taskSettings.messageType =
                messageSelect.value;

            taskSettings.customMessage =
                customMessage.value.trim();


            settings[index] =
                taskSettings;


            saveTaskNotificationSettings(
                settings
            );


            renderNotificationTaskList();

            overlay.remove();

            syncTaskReminderToServer(
                index,
                taskSettings
            );

        }
    );


    content.appendChild(
        saveButton
    );


    // =================================================
    // SHOW / HIDE CONDITIONAL SETTINGS
    // =================================================

    function updateFrequencyUI() {

        const isOnce =
            frequencySelect.value === "once";

        const isCustom =
            frequencySelect.value === "custom";


        onceSettings.style.display =
            isOnce
                ? "block"
                : "none";


        repeatingSettings.style.display =
            isOnce
                ? "none"
                : "block";


        customIntervalRow.style.display =
            isCustom
                ? "flex"
                : "none";

    }


    frequencySelect.addEventListener(
        "change",
        updateFrequencyUI
    );


    // Insert settings in correct order

    content.insertBefore(
        onceSettings,
        completedRow
    );

    content.insertBefore(
        repeatingSettings,
        completedRow
    );


    updateFrequencyUI();


    // =================================================
    // CLOSE
    // =================================================

    closeButton.addEventListener(
        "click",
        () => {

            overlay.remove();

        }
    );


    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target === overlay
            ) {

                overlay.remove();

            }

        }
    );


    overlay.appendChild(
        content
    );

    document.body.appendChild(
        overlay
    );

}


// =====================================================
// NOTIFICATION DOM ELEMENTS
// =====================================================

const notificationSettingsBtn =
    document.getElementById("notificationSettingsBtn");

const notificationPanel =
    document.getElementById("notificationPanel");

const notificationTaskList =
    document.getElementById("notificationTaskList");

const closeNotificationPanel =
    document.getElementById("closeNotificationPanel");

const enableNotificationsBtn =
    document.getElementById("enableNotificationsBtn");

const testPushNotificationBtn =
    document.getElementById("testPushNotificationBtn");

const saveNotificationSettings =
    document.getElementById("saveNotificationSettings");

const notificationStatus =
    document.getElementById("notificationStatus");

const permissionStatus =
    document.getElementById("permissionStatus");

const nextReminder =
    document.getElementById("nextReminder");


// =====================================================
// NOTIFICATION INITIALIZATION
// =====================================================

function isMasterNotificationsOn() {

    return localStorage.getItem(NOTIFICATION_KEYS.enabled) === "true";

}

function updateMasterNotificationSwitchUI() {

    const masterSwitch =
        document.getElementById("masterNotificationEnabled");

    if (!masterSwitch) return;

    masterSwitch.checked = isMasterNotificationsOn();

}

function updateGoldenDayNotificationSwitchUI() {

    const goldenSwitch =
        document.getElementById("goldenDayNotificationEnabled");

    if (!goldenSwitch) return;

    goldenSwitch.checked =
        localStorage.getItem(
            NOTIFICATION_KEYS.goldenDayEnabled
        ) !== "false";

}

function bindNotificationControlCenter() {

    const masterSwitch =
        document.getElementById("masterNotificationEnabled");

    const goldenSwitch =
        document.getElementById("goldenDayNotificationEnabled");

    updateMasterNotificationSwitchUI();
    updateGoldenDayNotificationSwitchUI();

    if (masterSwitch && !masterSwitch.dataset.aceBound) {

        masterSwitch.dataset.aceBound = "true";

        masterSwitch.addEventListener("change", async () => {

            if (masterSwitch.checked) {

                if (!("Notification" in window)) {
                    masterSwitch.checked = false;
                    localStorage.setItem(
                        NOTIFICATION_KEYS.enabled,
                        "false"
                    );
                    alert("Your browser does not support notifications.");
                    return;
                }

                if (Notification.permission !== "granted") {
                    await requestNotificationPermission();
                    masterSwitch.checked = isMasterNotificationsOn();
                    if (!masterSwitch.checked) return;
                } else {
                    localStorage.setItem(
                        NOTIFICATION_KEYS.enabled,
                        "true"
                    );
                    await subscribeToPushNotifications();
                }

                updateNotificationUI();
                await syncAllTaskRemindersToServer();

            } else {

                localStorage.setItem(
                    NOTIFICATION_KEYS.enabled,
                    "false"
                );

                updateNotificationUI();
                await unsubscribeFromPushNotifications();

            }

        });

    }

    if (goldenSwitch && !goldenSwitch.dataset.aceBound) {

        goldenSwitch.dataset.aceBound = "true";

        goldenSwitch.addEventListener("change", () => {

            localStorage.setItem(
                NOTIFICATION_KEYS.goldenDayEnabled,
                goldenSwitch.checked ? "true" : "false"
            );

        });

    }

    if (
        isMasterNotificationsOn() &&
        "Notification" in window &&
        Notification.permission === "granted"
    ) {

        subscribeToPushNotifications().then((ok) => {
            if (ok) {
                syncAllTaskRemindersToServer();
            }
        });

    } else if (!isMasterNotificationsOn()) {

        unsubscribeFromPushNotifications();

    }

}

function initializeNotifications() {

    updateNotificationUI();
    loadNotificationSettings();
    bindNotificationControlCenter();
    bindDiagnosticsRefresh();

    // Open settings
    if (notificationSettingsBtn) {

        notificationSettingsBtn.addEventListener("click", () => {

            loadNotificationSettings();

            if (notificationPanel) {
                notificationPanel.style.display = "block";
            }

            updatePermissionStatus();
            refreshPushDiagnostics();

        });

    }

    // Close settings
    if (closeNotificationPanel) {

        closeNotificationPanel.addEventListener("click", () => {

            notificationPanel.style.display = "none";

        });

    }

    // Enable notifications
    if (enableNotificationsBtn) {

        enableNotificationsBtn.addEventListener(
            "click",
            requestNotificationPermission
        );

    }

    if (testPushNotificationBtn) {

        testPushNotificationBtn.addEventListener(
            "click",
            sendTestPushNotification
        );

    }

    // Save settings
    if (saveNotificationSettings) {

        saveNotificationSettings.addEventListener(
            "click",
            saveNotificationPreferences
        );

    }

    // Close panel when clicking outside
    if (notificationPanel) {

        notificationPanel.addEventListener("click", (event) => {

            if (event.target === notificationPanel) {
                notificationPanel.style.display = "none";
            }

        });

    }

}


// =====================================================
// ACE TRACKER - PUSH SUBSCRIPTION
// =====================================================

// The push API lives on the Ace Tracker backend. On Vercel (static frontend)
// the backend is a separate host, so its base URL is injected at build time via
// api-config.js (VITE_API_URL). When unset it falls back to the same-origin
// path (/api), which is correct for local development or a single-node host.
const PUSH_SERVER_URL = (
    (typeof window.ACE_API_URL === "string" && window.ACE_API_URL.trim())
    || `${window.location.origin}/api`
).replace(/\/$/, "");

let cachedPushSubscription = null;
let backgroundPushActive = false;
let pushSessionPromise = null;

function pushApiFetch(path, options = {}) {
    // "include" works for both same-origin (local) and cross-origin (Vercel ->
    // backend) requests so the private HTTP-only session cookie is always sent.
    return fetch(`${PUSH_SERVER_URL}${path}`, {
        ...options,
        credentials: "include"
    }).then(async response => {
        // If session expired or invalid, clear cached session and retry once
        if (response.status === 401) {
            pushSessionPromise = null;
            cachedPushSubscription = null;
            // Retry the request once after session reset
            const retryResponse = await fetch(`${PUSH_SERVER_URL}${path}`, {
                ...options,
                credentials: "include"
            });
            return retryResponse;
        }
        return response;
    });
}

async function ensurePushSession() {
    if (!pushSessionPromise) {
        pushSessionPromise = pushApiFetch("/session", { method: "POST" })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Could not create a secure push session.");
                }
                return response.json();
            })
            .catch(error => {
                pushSessionPromise = null;
                throw error;
            });
    }

    try {
        return await pushSessionPromise;
    } catch (error) {
        pushSessionPromise = null;
        throw error;
    }
}

async function subscribeToPushNotifications() {
    try {
        if (!("serviceWorker" in navigator)) {
            console.error("❌ Service Worker is not supported.");
            return false;
        }

        if (!("PushManager" in window)) {
            console.error("❌ Push notifications are not supported.");
            return false;
        }

        if (!("Notification" in window) || Notification.permission !== "granted") {
            console.error("❌ Notification permission has not been granted.");
            return false;
        }

        await ensurePushSession();

        const registration =
            await navigator.serviceWorker.ready;

        // Get the public VAPID key from our backend
        const response = await pushApiFetch("/vapid-public-key");

        if (!response.ok) {
            throw new Error(
                "Could not get VAPID public key."
            );
        }

        const { publicKey } = await response.json();

        // Check whether this device already has a subscription
        let subscription =
            await registration.pushManager.getSubscription();

        // Create one if it doesn't exist
        if (!subscription) {
            subscription =
                await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey:
                        urlBase64ToUint8Array(publicKey)
                });
        }

        cachedPushSubscription = subscription;

        // Send subscription to our backend
        const saveResponse = await pushApiFetch(
            "/subscribe",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(subscription)
            }
        );

        if (!saveResponse.ok) {
            throw new Error(
                "Backend rejected the push subscription."
            );
        }

        console.log(
            "✅ Push subscription registered successfully."
        );

        return true;

    } catch (error) {
        console.error(
            "❌ Push subscription failed:",
            error
        );

        return false;
    }
}

async function getExistingPushSubscription() {

    try {

        if (cachedPushSubscription) {
            return cachedPushSubscription;
        }

        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            return null;
        }

        const registration = await navigator.serviceWorker.ready;
        cachedPushSubscription = await registration.pushManager.getSubscription();
        return cachedPushSubscription;

    } catch (error) {

        console.error("❌ Could not read push subscription:", error);
        return null;

    }

}

async function syncTaskReminderToServer(taskId, taskSettings) {

    try {

        const masterOn = isMasterNotificationsOn();
        const shouldSchedule =
            masterOn &&
            taskSettings &&
            taskSettings.enabled;

        let subscription = await getExistingPushSubscription();

        if (!subscription && shouldSchedule) {
            const subscribed = await subscribeToPushNotifications();
            if (!subscribed) return;
            subscription = await getExistingPushSubscription();
        }

        if (!subscription || !subscription.endpoint) {
            return;
        }

        if (!shouldSchedule) {

            const cancelResponse = await pushApiFetch(
                "/cancel-reminder",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        endpoint: subscription.endpoint,
                        taskId: String(taskId)
                    })
                }
            );

            if (!cancelResponse.ok) {
                console.error("❌ Could not cancel backend reminder.");
            }

            return;

        }

        const scheduleResponse = await pushApiFetch(
            "/schedule-reminder",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    taskId: String(taskId),
                    taskName: taskSettings.taskName,
                    reminderTime: taskSettings.reminderTime || "20:00",
                    message: getTaskNotificationMessage(
                        taskSettings.taskName,
                        taskSettings
                    ),
                    frequency: taskSettings.frequency || "once",
                    startTime: taskSettings.startTime || "09:00",
                    endTime: taskSettings.endTime || "21:00",
                    customInterval: taskSettings.customInterval || 60,
                    maxNotifications: taskSettings.maxNotifications,
                    stopWhenCompleted: taskSettings.stopWhenCompleted,
                    completed: isTaskCompleted(taskId),
                    completedDate: isTaskCompleted(taskId) ? getTodayKey() : null,
                    timezoneOffsetMinutes: -new Date().getTimezoneOffset()
                })
            }
        );

        if (!scheduleResponse.ok) {
            const status = scheduleResponse.status;
            // Subscription may be stale (deleted on backend, VAPID key changed, etc.)
            if (status === 404 || status === 410 || status === 403) {
                console.warn(`⚠️ Subscription invalid (${status}), clearing cache and retrying...`);
                cachedPushSubscription = null;
                backgroundPushActive = false;
                // Retry once with fresh subscription
                const subscribed = await subscribeToPushNotifications();
                if (subscribed) {
                    subscription = await getExistingPushSubscription();
                    if (subscription) {
                        return syncTaskReminderToServer(taskId, taskSettings);
                    }
                }
            }
            console.error("❌ Could not schedule backend reminder:", await scheduleResponse.text());
            return;
        }

        backgroundPushActive = true;

    } catch (error) {

        console.error("❌ Task reminder sync failed:", error);

    }

}

async function syncAllTaskRemindersToServer() {

    const settings = getTaskNotificationSettings();
    const taskNames = getTaskNames();

    for (let index = 0; index < taskNames.length; index += 1) {
        await syncTaskReminderToServer(index, settings[index]);
    }

}

async function cancelAllTaskRemindersOnServer() {

    const settings = getTaskNotificationSettings();
    const taskNames = getTaskNames();

    for (let index = 0; index < taskNames.length; index += 1) {
        const taskSettings = settings[index] || {};
        await syncTaskReminderToServer(index, {
            ...taskSettings,
            enabled: false
        });
    }

}

async function unsubscribeFromPushNotifications() {

    try {

        const subscription = await getExistingPushSubscription();

        if (!subscription || !subscription.endpoint) {
            backgroundPushActive = false;
            return;
        }

        // Remove the server copy first, then invalidate the browser subscription.
        // Either operation can fail independently, so both are attempted.
        try {
            const response = await pushApiFetch(
                "/unsubscribe",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ endpoint: subscription.endpoint })
                }
            );

            if (!response.ok) {
                console.error("❌ Could not remove the backend push subscription.");
            }
        } catch (error) {
            console.error("❌ Backend unsubscribe failed:", error);
        }

        await subscription.unsubscribe();
        cachedPushSubscription = null;
        backgroundPushActive = false;

    } catch (error) {

        console.error("❌ Could not unsubscribe from push notifications:", error);

    }

}

async function sendTestPushNotification() {

    try {

        if (!("Notification" in window) || Notification.permission !== "granted") {
            await requestNotificationPermission();
            return;
        }

        const subscribed = await subscribeToPushNotifications();
        if (!subscribed) {
            if (permissionStatus) {
                permissionStatus.textContent = "Push setup could not be completed on this device.";
            }
            return;
        }

        const response = await pushApiFetch("/send-test", { method: "POST" });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || "The test notification could not be delivered.");
        }

        if (permissionStatus) {
            // Be honest: backend accepted the Web Push request, but actual OS delivery
            // depends on browser push service, network, and OS notification settings.
            permissionStatus.textContent = `Backend accepted test push (delivered to ${result.delivered}/${result.attempted} subscriptions). Check your system notifications.`;
        }

    } catch (error) {

        console.error("❌ Test push failed:", error);
        if (permissionStatus) {
            permissionStatus.textContent = `Test failed: ${error.message}. Check connection and try again.`;
        }

    }

}

async function syncTaskCompletionToServer(taskId, completed) {

    try {

        if (!isMasterNotificationsOn()) return;

        const subscription = await getExistingPushSubscription();
        if (!subscription || !subscription.endpoint) return;

        await pushApiFetch(
            "/task-status",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    taskId: String(taskId),
                    completed: Boolean(completed),
                    dateKey: getTodayKey()
                })
            }
        );

    } catch (error) {

        console.error("❌ Task status sync failed:", error);

    }

}


// Convert VAPID public key into the format
// required by PushManager.subscribe()
function urlBase64ToUint8Array(base64String) {
    const padding =
        "=".repeat(
            (4 - base64String.length % 4) % 4
        );

    const base64 =
        (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");

    const rawData =
        window.atob(base64);

    return Uint8Array.from(
        [...rawData].map(
            char => char.charCodeAt(0)
        )
    );
}

// =====================================================
// REQUEST BROWSER PERMISSION
// =====================================================

async function requestNotificationPermission() {

    if (!("Notification" in window)) {

        alert(
            "Your browser does not support notifications."
        );

        return;

    }

    try {

        const permission =
            await Notification.requestPermission();

            if (permission === "granted") {
                localStorage.setItem(
                    NOTIFICATION_KEYS.enabled,
                    "true"
                );

                updateMasterNotificationSwitchUI();
            
                updatePermissionStatus();
                updateNotificationUI();
            
                // Register this device for background push notifications
                const pushRegistered =
                    await subscribeToPushNotifications();
            
                if (pushRegistered) {
                    await syncAllTaskRemindersToServer();
                    showAceNotification(
                        "Ace Tracker",
                        "Background notifications are now enabled!"
                    );
                } else {
                    showAceNotification(
                        "Ace Tracker",
                        "Browser notifications are enabled, but background push setup failed."
                    );
                }
            }



         else if (permission === "denied") {

            alert(
                "Notifications were blocked. You can enable them from your browser's site settings."
            );

            updatePermissionStatus();

        }

    } catch (error) {

        console.error(
            "Notification permission error:",
            error
        );

    }

}


// =====================================================
// SHOW NOTIFICATION
// =====================================================

async function showAceNotification(title, message, tag) {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    try {
        if ("serviceWorker" in navigator) {
            const registration = await navigator.serviceWorker.ready;

            await registration.showNotification(title, {
                body: message,
                icon: "icon.png",
                badge: "icon.png",
                tag: tag || "ace-tracker-reminder",
                renotify: true,
                data: { url: "/" }
            });

            return;
        }
    } catch (error) {
        console.warn(
            "Service Worker notification failed:",
            error
        );
    }

    try {
        new Notification(title, {
            body: message,
            icon: "icon.png",
            badge: "icon.png"
        });
    } catch (error) {
        console.error(
            "Notification failed:",
            error
        );
    }
}


// =====================================================
// LOAD SETTINGS
// =====================================================

function loadNotificationSettings() {

    renderNotificationTaskList();

}


/* =====================================================
// PUSH DIAGNOSTICS
===================================================== */

const DIAGNOSTIC_STATES = {
    READY: "READY",
    NOT_ENABLED: "NOT ENABLED",
    BLOCKED: "BLOCKED",
    OFFLINE: "OFFLINE",
    FAILED: "FAILED",
    UNKNOWN: "UNKNOWN"
};

const DIAGNOSTIC_LABELS = {
    browserPermission: "Browser permission",
    serviceWorker: "Service worker",
    pushAPI: "Push API",
    backend: "Backend",
    secureSession: "Secure session",
    pushSubscription: "Push subscription",
    reminderScheduler: "Reminder scheduler"
};

async function runPushDiagnostics() {
    const results = {};

    // Browser permission
    if (!("Notification" in window)) {
        results.browserPermission = { state: DIAGNOSTIC_STATES.BLOCKED, detail: "Notifications not supported" };
    } else if (Notification.permission === "granted") {
        results.browserPermission = { state: DIAGNOSTIC_STATES.READY, detail: "Granted" };
    } else if (Notification.permission === "denied") {
        results.browserPermission = { state: DIAGNOSTIC_STATES.BLOCKED, detail: "Blocked by user" };
    } else {
        results.browserPermission = { state: DIAGNOSTIC_STATES.NOT_ENABLED, detail: "Not prompted yet" };
    }

    // Service worker
    if (!("serviceWorker" in navigator)) {
        results.serviceWorker = { state: DIAGNOSTIC_STATES.BLOCKED, detail: "Service Worker not supported" };
    } else {
        try {
            const reg = await navigator.serviceWorker.ready;
            if (reg.active) {
                results.serviceWorker = { state: DIAGNOSTIC_STATES.READY, detail: "Active and controlling" };
            } else {
                results.serviceWorker = { state: DIAGNOSTIC_STATES.NOT_ENABLED, detail: "Registered but not active" };
            }
        } catch (e) {
            results.serviceWorker = { state: DIAGNOSTIC_STATES.FAILED, detail: e.message };
        }
    }

    // Push API
    if (!("PushManager" in window)) {
        results.pushAPI = { state: DIAGNOSTIC_STATES.BLOCKED, detail: "Push API not supported" };
    } else {
        results.pushAPI = { state: DIAGNOSTIC_STATES.READY, detail: "Supported" };
    }

    // Backend + Secure session + Push subscription + Scheduler
    try {
        const response = await pushApiFetch("/push-status");
        if (response.ok) {
            const data = await response.json();
            results.backend = { state: DIAGNOSTIC_STATES.READY, detail: "Online" };
            results.secureSession = { state: data.session === "authenticated" ? DIAGNOSTIC_STATES.READY : DIAGNOSTIC_STATES.FAILED, detail: data.session };
            results.pushSubscription = { state: data.subscription === "registered" ? DIAGNOSTIC_STATES.READY : DIAGNOSTIC_STATES.NOT_ENABLED, detail: data.subscription };
            results.reminderScheduler = { state: data.scheduler === "running" ? DIAGNOSTIC_STATES.READY : DIAGNOSTIC_STATES.FAILED, detail: data.scheduler };
            results.vapidConfigured = data.vapidConfigured;
        } else if (response.status === 401) {
            results.backend = { state: DIAGNOSTIC_STATES.NOT_ENABLED, detail: "Session expired" };
            results.secureSession = { state: DIAGNOSTIC_STATES.NOT_ENABLED, detail: "No valid session" };
            results.pushSubscription = { state: DIAGNOSTIC_STATES.NOT_ENABLED, detail: "Requires session" };
            results.reminderScheduler = { state: DIAGNOSTIC_STATES.UNKNOWN, detail: "Requires session" };
        } else {
            results.backend = { state: DIAGNOSTIC_STATES.FAILED, detail: `HTTP ${response.status}` };
            results.secureSession = { state: DIAGNOSTIC_STATES.FAILED, detail: "Backend error" };
            results.pushSubscription = { state: DIAGNOSTIC_STATES.FAILED, detail: "Backend error" };
            results.reminderScheduler = { state: DIAGNOSTIC_STATES.FAILED, detail: "Backend error" };
        }
    } catch (e) {
        results.backend = { state: DIAGNOSTIC_STATES.OFFLINE, detail: e.message };
        results.secureSession = { state: DIAGNOSTIC_STATES.OFFLINE, detail: "Network error" };
        results.pushSubscription = { state: DIAGNOSTIC_STATES.OFFLINE, detail: "Network error" };
        results.reminderScheduler = { state: DIAGNOSTIC_STATES.OFFLINE, detail: "Network error" };
    }

    return results;
}

function renderPushDiagnostics(results) {
    const container = document.getElementById("pushDiagnosticsList");
    if (!container) return;

    const order = [
        "browserPermission",
        "serviceWorker",
        "pushAPI",
        "backend",
        "secureSession",
        "pushSubscription",
        "reminderScheduler"
    ];

    container.innerHTML = "";

    for (const key of order) {
        const item = results[key];
        if (!item) continue;

        const row = document.createElement("div");
        row.className = "diagnostic-row";

        const stateClass = `diagnostic-${item.state.toLowerCase().replace(" ", "-")}`;

        row.innerHTML = `
            <span class="diagnostic-label">${DIAGNOSTIC_LABELS[key] || key}</span>
            <span class="diagnostic-state ${stateClass}">${item.state}</span>
            <span class="diagnostic-detail">${item.detail || ""}</span>
        `;

        container.appendChild(row);
    }
}

async function refreshPushDiagnostics() {
    const btn = document.getElementById("refreshDiagnosticsBtn");
    if (btn) {
        btn.disabled = true;
        btn.textContent = "Checking...";
    }

    try {
        const results = await runPushDiagnostics();
        renderPushDiagnostics(results);
    } catch (e) {
        console.error("Diagnostics failed:", e);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Refresh";
        }
    }
}

function bindDiagnosticsRefresh() {
    const btn = document.getElementById("refreshDiagnosticsBtn");
    if (btn && !btn.dataset.aceBound) {
        btn.dataset.aceBound = "true";
        btn.addEventListener("click", refreshPushDiagnostics);
    }
}


/* =====================================================
// SAVE SETTINGS
===================================================== */

function saveNotificationPreferences() {

    const goldenSwitch =
        document.getElementById("goldenDayNotificationEnabled");

    if (goldenSwitch) {

        localStorage.setItem(
            NOTIFICATION_KEYS.goldenDayEnabled,
            goldenSwitch.checked ? "true" : "false"
        );

    }

    updateMasterNotificationSwitchUI();
    updateNotificationUI();

    alert(
        "Notification settings saved!"
    );

}


// =====================================================
// UPDATE PERMISSION STATUS
// =====================================================

function updatePermissionStatus() {

    if (!permissionStatus) return;

    if (!("Notification" in window)) {

        permissionStatus.textContent =
            "Your browser does not support notifications.";

        return;

    }

    if (Notification.permission === "granted") {

        permissionStatus.textContent =
            "Browser notifications are enabled.";

        if (enableNotificationsBtn) {
            enableNotificationsBtn.textContent =
                "Notifications Enabled";
        }

    } else if (Notification.permission === "denied") {

        permissionStatus.textContent =
            "🚫 Notifications are blocked by your browser.";

        if (enableNotificationsBtn) {
            enableNotificationsBtn.textContent =
                "Notifications Blocked";
        }

    } else {

        permissionStatus.textContent =
            "🔔 Notifications have not been enabled yet.";

        if (enableNotificationsBtn) {
            enableNotificationsBtn.textContent =
                "🔔 Enable Notifications";
        }

    }

}


// =====================================================
// UPDATE MAIN NOTIFICATION CARD
// =====================================================

function updateNotificationUI() {

    if (!notificationStatus) return;

    const enabled =
        localStorage.getItem(
            NOTIFICATION_KEYS.enabled
        ) === "true";

    if (
        enabled &&
        "Notification" in window &&
        Notification.permission === "granted"
    ) {

        notificationStatus.textContent =
            "🟢 Notifications are active";

        updateNextReminder();

    } else {

        notificationStatus.textContent =
            "🔴 Notifications are currently OFF";

        if (nextReminder) {
            nextReminder.textContent =
                "No reminders scheduled";
        }

    }

}


// =====================================================
// NEXT REMINDER
// =====================================================

function updateNextReminder() {

    if (!nextReminder) return;

    const enabled =
        localStorage.getItem(
            NOTIFICATION_KEYS.dailyReminderEnabled
        ) === "true";

    const time =
        localStorage.getItem(
            NOTIFICATION_KEYS.dailyReminderTime
        ) || "20:00";

    if (!enabled) {

        nextReminder.textContent =
            "Daily reminder is OFF";

        return;

    }

    const [hours, minutes] =
        time.split(":").map(Number);

    const reminderDate = new Date();

    reminderDate.setHours(
        hours,
        minutes,
        0,
        0
    );

    // If today's reminder has passed
    if (reminderDate <= new Date()) {

        reminderDate.setDate(
            reminderDate.getDate() + 1
        );

    }

    nextReminder.textContent =
        `⏰ Next reminder: ${reminderDate.toLocaleString(
            [],
            {
                weekday: "short",
                hour: "numeric",
                minute: "2-digit"
            }
        )}`;

}





// =====================================================
// NOTIFICATION DISPLAY SYSTEM
// =====================================================

function showNotification(title, message, type = "reminder") {

    const container =
        document.getElementById("notificationContainer");

    if (!container) {
        console.warn("Notification container not found.");
        return;
    }

    const notification = document.createElement("div");

    notification.className = "smart-notification";

    if (type === "success") {
        notification.classList.add("success");
    }

    notification.innerHTML = `
        <button class="notification-close">✕</button>

        <h3>${title}</h3>

        <p>${message}</p>
    `;

    const closeButton =
        notification.querySelector(".notification-close");

    closeButton.addEventListener("click", () => {
        notification.remove();
    });

    container.appendChild(notification);

    // Automatically disappear after 8 seconds
    setTimeout(() => {

        if (notification.parentElement) {
            notification.remove();
        }

    }, 8000);
}


// =====================================================
// ACE TRACKER — SMART NOTIFICATION ENGINE 2.0
// =====================================================

let smartNotificationTimer = null;


// =====================================================
// CHECK MASTER NOTIFICATION SWITCH
// =====================================================

function areNotificationsEnabled() {

    return (
        localStorage.getItem(
            NOTIFICATION_KEYS.enabled
        ) === "true"
        &&
        "Notification" in window
        &&
        Notification.permission === "granted"
    );

}


// =====================================================
// GET TASK COMPLETION STATUS
// =====================================================

function isTaskCompleted(index) {

    if (!checkboxes || !checkboxes[index]) {
        return false;
    }

    return checkboxes[index].checked;

}


// =====================================================
// GET TODAY'S NOTIFICATION STATE
// =====================================================

function getNotificationState(index) {

    const today =
        getTodayKey();

    const key =
        `aceNotificationState-${today}-${index}`;

    try {

        return JSON.parse(
            localStorage.getItem(key)
        ) || {
            count: 0,
            lastSent: null
        };

    } catch {

        return {
            count: 0,
            lastSent: null
        };

    }

}


// =====================================================
// SAVE TODAY'S NOTIFICATION STATE
// =====================================================

function saveNotificationState(
    index,
    state
) {

    const today =
        getTodayKey();

    const key =
        `aceNotificationState-${today}-${index}`;

    localStorage.setItem(
        key,
        JSON.stringify(state)
    );

}


// =====================================================
// CONVERT HH:MM TO MINUTES
// =====================================================

function timeToMinutes(time) {

    if (!time) return 0;

    const parts =
        time.split(":");

    return (
        Number(parts[0]) * 60 +
        Number(parts[1])
    );

}


// =====================================================
// CURRENT TIME IN MINUTES
// =====================================================

function getCurrentMinutes() {

    const now =
        new Date();

    return (
        now.getHours() * 60 +
        now.getMinutes()
    );

}


// =====================================================
// GET MESSAGE
// =====================================================

function getTaskNotificationMessage(
    taskName,
    settings
) {

    if (
        settings.messageType ===
        "custom"
        &&
        settings.customMessage
    ) {

        return settings.customMessage;

    }


    if (
        settings.messageType ===
        "motivational"
    ) {

        return `💪 You've got this! Don't forget: ${taskName}`;

    }


    if (
        settings.messageType ===
        "short"
    ) {

        return `⏰ Reminder: ${taskName}`;

    }


    return `Don't forget: ${taskName}`;

}


// =====================================================
// CAN SEND ONCE-PER-DAY NOTIFICATION?
// =====================================================

function shouldSendOnceDaily(
    index,
    settings
) {
    const nowMinutes = getCurrentMinutes();
    const reminderMinutes = timeToMinutes(
        settings.reminderTime
    );

    // Not time yet
    if (nowMinutes < reminderMinutes) {
        return false;
    }

    const state = getNotificationState(index);
    const today = getTodayKey();

    // Already sent today
    if (state.lastSent) {
        const lastSentDate = new Date(state.lastSent);

        const lastSentDay =
            lastSentDate.getFullYear() + "-" +
            String(lastSentDate.getMonth() + 1).padStart(2, "0") + "-" +
            String(lastSentDate.getDate()).padStart(2, "0");

        if (lastSentDay === today) {
            return false;
        }
    }

    return true;
}

// =====================================================
// CAN SEND REPEATING NOTIFICATION?
// =====================================================

function shouldSendRepeating(
    index,
    settings
) {

    const nowMinutes =
        getCurrentMinutes();

    const startMinutes =
        timeToMinutes(
            settings.startTime
        );

    const endMinutes =
        timeToMinutes(
            settings.endTime
        );


    // Before notification window
    if (
        nowMinutes <
        startMinutes
    ) {

        return false;

    }


    // After notification window
    if (
        nowMinutes >
        endMinutes
    ) {

        return false;

    }


    const state =
        getNotificationState(index);


    // Maximum reached
    if (
        settings.maxNotifications > 0
        &&
        state.count >=
        settings.maxNotifications
    ) {

        return false;

    }


    // First notification
    if (!state.lastSent) {

        return true;

    }


    const lastSent =
        new Date(
            state.lastSent
        );


    const minutesSinceLast =
        Math.floor(
            (
                Date.now() -
                lastSent.getTime()
            ) /
            60000
        );


    let intervalMinutes;


    if (
        settings.frequency ===
        "30min"
    ) {

        intervalMinutes = 30;

    }

    else if (
        settings.frequency ===
        "1hour"
    ) {

        intervalMinutes = 60;

    }

    else if (
        settings.frequency ===
        "2hours"
    ) {

        intervalMinutes = 120;

    }

    else if (
        settings.frequency ===
        "3hours"
    ) {

        intervalMinutes = 180;

    }

    else if (
        settings.frequency ===
        "custom"
    ) {

        intervalMinutes =
            Number(
                settings.customInterval
            ) || 60;

    }

    else {

        intervalMinutes = 60;

    }


    return (
        minutesSinceLast >=
        intervalMinutes
    );

}


// =====================================================
// SEND TASK NOTIFICATION
// =====================================================

function sendTaskNotification(
    index,
    taskName,
    settings
) {

    const message =
        getTaskNotificationMessage(
            taskName,
            settings
        );


        showAceNotification(
            "🔔 Ace Reminder",
            message,
            `ace-task-${index}`
        );


    const state =
        getNotificationState(index);


    state.count += 1;

    state.lastSent =
        new Date().toISOString();


    saveNotificationState(
        index,
        state
    );


    console.log(
        `🔔 Notification sent for: ${taskName}`
    );

}


// =====================================================
// CHECK ONE TASK
// =====================================================

async function checkTaskNotification(
    index,
    taskName,
    settings
) {

    console.log(
        "🔎 Checking task notification:",
        taskName,
        settings
    );

    // Backend push is the source of truth for closed-tab reminders.
    // Check actual backend state rather than just in-memory flag.
    const subscription = await getExistingPushSubscription();
    const masterOn = isMasterNotificationsOn();
    const hasValidSubscription = subscription && subscription.endpoint;
    if (masterOn && hasValidSubscription) {
        // Background push is configured - local notifications not needed
        // when tab is open since backend will handle reminders
        return;
    }

    // Notification OFF
    if (!settings.enabled) {
        return;
    }


    // Task already completed
    if (
        settings.stopWhenCompleted
        &&
        isTaskCompleted(index)
    ) {

        return;

    }


    // Once per day
    if (
        settings.frequency ===
        "once"
    ) {

        if (
            shouldSendOnceDaily(
                index,
                settings
            )
        ) {

            sendTaskNotification(
                index,
                taskName,
                settings
            );

        }

        return;

    }


    // Repeating notification
    if (
        shouldSendRepeating(
            index,
            settings
        )
    ) {

        sendTaskNotification(
            index,
            taskName,
            settings
        );

    }

}


// =====================================================
// GOLDEN DAY NOTIFICATION
// =====================================================

function checkGoldenDayNotification() {

    const enabled =
        localStorage.getItem(
            NOTIFICATION_KEYS.goldenDayEnabled
        ) !== "false";


    if (!enabled) {
        return;
    }


    if (
        !checkboxes ||
        !checkboxes.length
    ) {

        return;

    }


    const allCompleted =
        Array.from(
            checkboxes
        ).every(
            checkbox =>
                checkbox.checked
        );


    if (!allCompleted) {
        return;
    }


    const today =
        getTodayKey();


    const key =
        `aceGoldenDayNotification-${today}`;


    if (
        localStorage.getItem(key)
    ) {

        return;

    }


    showAceNotification(
        "Golden Day!",
        "You've completed every task today. Amazing work!",
        "ace-golden-day"
    );


    localStorage.setItem(
        key,
        "true"
    );

}


function checkDailyReminderNotification() {
    const enabled =
        localStorage.getItem(
            NOTIFICATION_KEYS.dailyReminderEnabled
        ) === "true";

    if (!enabled) {
        return;
    }

    const reminderTime =
        localStorage.getItem(
            NOTIFICATION_KEYS.dailyReminderTime
        ) || "20:00";

    const now = new Date();

    const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

    const reminderMinutes =
        timeToMinutes(reminderTime);

        if (currentMinutes < reminderMinutes) {
            return;
        }

    const today = getTodayKey();

    const key =
        `aceDailyReminderNotification-${today}`;

    if (localStorage.getItem(key)) {
        return;
    }

    showAceNotification(
        "🔔 Ace Tracker Reminder",
        "Don't forget to complete your tasks today!"
    );

    localStorage.setItem(key, "true");

    console.log(
        "🔔 Daily reminder sent at:",
        reminderTime
    );
}


// =====================================================
// MAIN SMART NOTIFICATION CHECKER
// =====================================================

async function runSmartNotificationCheck() {

    // Master notification switch
    if (!areNotificationsEnabled()) {

        console.log(
            "🔕 Smart notifications skipped:",
            {
                masterEnabled: localStorage.getItem(
                    NOTIFICATION_KEYS.enabled
                ),
                permission:
                    "Notification" in window
                        ? Notification.permission
                        : "unsupported"
            }
        );

        return;
    }

    const taskNames = getTaskNames();
    const settings = getTaskNotificationSettings();

    // Check every task
    for (let index = 0; index < taskNames.length; index += 1) {
        const taskName = taskNames[index];
        const taskSettings = settings[index];

        if (!taskSettings) {
            continue;
        }

        await checkTaskNotification(index, taskName, taskSettings);
    }

    // Check daily reminder
    checkDailyReminderNotification();

    // Check Golden Day
    checkGoldenDayNotification();

}


// =====================================================
// START SMART NOTIFICATIONS
// =====================================================

function startSmartNotifications() {

    // Prevent duplicate timers.
    if (smartNotificationTimer) {
        clearTimeout(smartNotificationTimer);
        smartNotificationTimer = null;
    }

    function scheduleNextCheck() {
        const now = new Date();
        const nextMinute = new Date(now);
        nextMinute.setSeconds(0, 0);
        nextMinute.setMinutes(nextMinute.getMinutes() + 1);

        const delay = Math.max(250, nextMinute.getTime() - now.getTime());

        smartNotificationTimer = setTimeout(() => {
            runSmartNotificationCheck().catch(err => console.error("Smart notification check failed:", err));
            scheduleNextCheck();
        }, delay);
    }

    // Check immediately so an already-due reminder is not missed.
    runSmartNotificationCheck().catch(err => console.error("Smart notification check failed:", err));
    scheduleNextCheck();

    console.log(
        "🔔 Smart Notification Engine 2.0 started — minute-accurate scheduler."
    );
}


// =====================================================
// ACE TRACKER PHASE 1 — APP NAVIGATION
// =====================================================

(function initializeAceAppNavigation() {

    const menuButton = document.getElementById("appMenuBtn");
    const closeButton = document.getElementById("closeAppMenuBtn");
    const overlay = document.getElementById("appMenuOverlay");
    const sideMenu = document.getElementById("appSideMenu");
    const navItems = document.querySelectorAll(".app-nav-item");
    const tabItems = document.querySelectorAll(".app-tab");

    if (!menuButton || !closeButton || !overlay || !sideMenu) {
        return;
    }

    const pageClasses = [
        "page-dashboard",
        "page-progress",
        "page-tasks",
        "page-notifications",
        "page-settings"
    ];

    function closeMenu() {
        document.body.classList.remove("menu-open");
        menuButton.setAttribute("aria-expanded", "false");
        sideMenu.setAttribute("aria-hidden", "true");
    }

    function openMenu() {
        document.body.classList.add("menu-open");
        menuButton.setAttribute("aria-expanded", "true");
        sideMenu.setAttribute("aria-hidden", "false");
    }

    function syncItems(items, page) {
        items.forEach(item => {
            const isActive = item.dataset.page === page;
            item.classList.toggle("active", isActive);

            if (isActive) {
                item.setAttribute("aria-current", "page");
            } else {
                item.removeAttribute("aria-current");
            }
        });
    }

    function showPage(page) {
        if (!pageClasses.includes(`page-${page}`)) {
            page = "dashboard";
        }

        pageClasses.forEach(className => {
            document.body.classList.remove(className);
        });

        document.body.classList.add(`page-${page}`);

        // Keep the drawer nav and the mobile tab bar in sync.
        syncItems(navItems, page);
        syncItems(tabItems, page);

        // Always start the selected view at the top.
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        closeMenu();
    }

    menuButton.addEventListener("click", () => {
        if (document.body.classList.contains("menu-open")) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    closeButton.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            showPage(item.dataset.page);
        });
    });

    tabItems.forEach(item => {
        item.addEventListener("click", () => {
            showPage(item.dataset.page);
        });
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    // Menu quick actions reuse the existing, already-working controls.
    const menuCustomizeBtn = document.getElementById("menuCustomizeBtn");
    const menuThemeBtn = document.getElementById("menuThemeBtn");
    const menuResetBtn = document.getElementById("menuResetBtn");
    const menuLogoutBtn = document.getElementById("menuLogoutBtn");

    if (menuCustomizeBtn) {
        menuCustomizeBtn.addEventListener("click", () => {
            closeMenu();
            showPage("tasks");

            const button = document.getElementById("taskCustomizerBtn");
            if (button) {
                button.click();
            }
        });
    }



    if (menuResetBtn) {
        menuResetBtn.addEventListener("click", () => {
            closeMenu();

            const button = document.getElementById("resetBtn");
            if (button) {
                button.click();
            }
        });
    }

    if (menuLogoutBtn) {
        menuLogoutBtn.addEventListener("click", () => {
            closeMenu();

            const button = document.getElementById("logoutBtn");
            if (button) {
                button.click();
            }
        });
    }

    // Settings page buttons.
    const settingsCustomizeBtn =
        document.getElementById("settingsCustomizeBtn");

    const settingsNotificationsBtn =
        document.getElementById("settingsNotificationsBtn");

    const settingsResetBtn =
        document.getElementById("settingsResetBtn");

    const settingsLogoutBtn =
        document.getElementById("settingsLogoutBtn");

    if (settingsCustomizeBtn) {
        settingsCustomizeBtn.addEventListener("click", () => {
            showPage("tasks");

            const button = document.getElementById("taskCustomizerBtn");
            if (button) {
                button.click();
            }
        });
    }



    if (settingsNotificationsBtn) {
        settingsNotificationsBtn.addEventListener("click", () => {
            showPage("notifications");

            const button =
                document.getElementById("notificationSettingsBtn");

            if (button) {
                button.click();
            }
        });
    }

    if (settingsResetBtn) {
        settingsResetBtn.addEventListener("click", () => {
            const button = document.getElementById("resetBtn");

            if (button) {
                button.click();
            }
        });
    }

    if (settingsLogoutBtn) {
        settingsLogoutBtn.addEventListener("click", () => {
            const button = document.getElementById("logoutBtn");

            if (button) {
                button.click();
            }
        });
    }

    // Start on Dashboard.
    showPage("dashboard");

})();
