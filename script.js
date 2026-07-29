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
    "Stay consistent 💪",
    "Small steps every day 🚀",
    "Progress beats perfection ⭐",
    "Discipline creates freedom 🔥",
    "Today's effort is tomorrow's success 🏆",
    "Keep going, you're improving 🌟"
];

// Single source of truth for all localStorage keys
const STORAGE_KEYS = {
    userName: "userName",
    theme: "theme",
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
const checkboxes = document.querySelectorAll(".taskCheck");
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
const themeToggle = document.getElementById("themeToggle");
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
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((parseDateKey(dateKeyB) - parseDateKey(dateKeyA)) / msPerDay);
}

function getDayNumberForDate(dateKey) {
    if (!challengeStart) return 1;
    const rawDay = daysBetween(challengeStart, dateKey) + 1;
    return Math.min(CHALLENGE_LENGTH_DAYS, Math.max(1, rawDay));
}

function isChallengeFinished(dateKey = getTodayKey()) {
    if (!challengeStart) return false;
    return daysBetween(challengeStart, dateKey) + 1 > CHALLENGE_LENGTH_DAYS;
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
    loadTasks();

    updateWelcome();
    updateDate();
    updateStreak(today);
    updateStatistics();
    loadCalendar();

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

        if (completedCount > 0) {
            let earnedXP = completedCount * XP_PER_TASK;
            const totalCheckboxCount = checkboxes.length || 10;

            if (completedCount === totalCheckboxCount && totalCheckboxCount > 0) {
                earnedXP += GOLDEN_DAY_BONUS;
            }

            addXP(earnedXP);
        }

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
    if (amount <= 0) return;
    totalXP = (Number(localStorage.getItem(STORAGE_KEYS.totalXP)) || 0) + amount;
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
        alert("The 90-day challenge is completed! 🏆");
        return;
    }

    const taskElement = box.closest(".task");
    if (taskElement) {
        taskElement.classList.toggle("completed", box.checked);
    }

    localStorage.setItem(STORAGE_KEYS.task(index), box.checked);

    const completed = countCompletedCheckboxes();

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

    if (goldenDaysText) goldenDaysText.textContent = goldenDays;
    if (completionRateText) completionRateText.textContent = `${completionRate}%`;
    if (daysRemainingText) {
        daysRemainingText.textContent = finished ? 0 : Math.max(CHALLENGE_LENGTH_DAYS - dayNumber, 0);
    }
    if (totalTasksText) totalTasksText.textContent = `${totalTasksCompleted} / ${maxTotalTasks}`;

    if (monthTasks) monthTasks.textContent = totalTasksCompleted;
    if (monthGolden) monthGolden.textContent = goldenDays;
    if (monthAverage) monthAverage.textContent = `${completionRate}%`;

    if (challengeDayText) {
        if (finished) {
            challengeDayText.textContent = "Challenge Completed! 🏆";
        } else {
            challengeDayText.textContent = `Day ${dayNumber} / ${CHALLENGE_LENGTH_DAYS}`;
        }
    }
}

// =====================================================
// 13. GOLDEN DAY POPUP
// =====================================================

function checkGoldenDay(completedCount) {
    if (completedCount === checkboxes.length && checkboxes.length > 0) {
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

        if (i === dayNumber && !isChallengeFinished()) {
            day.style.border = "3px solid white";
        }

        fragment.appendChild(day);
    }

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

function createWeeklyChart() {
    if (!ctx || typeof Chart === "undefined") return;

    const existingChart = Chart.getChart(ctx);
    if (existingChart) existingChart.destroy();

    weeklyChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
                label: "Tasks Completed",
                data: getWeeklyChartData(),
                backgroundColor: "#38bdf8",
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: checkboxes.length || 10
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

    pieChart = new Chart(pieCtx, {
        type: "doughnut",
        data: {
            labels: ["Completed", "Remaining"],
            datasets: [{
                data: [completed, checkboxes.length - completed],
                backgroundColor: ["#22c55e", "#334155"],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            cutout: "65%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { color: "white" }
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

    welcomeText.textContent = `${greeting}, ${userName} 👋`;
}

function updateDate() {
    if (!currentDate) return;
    const options = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
    currentDate.textContent = new Date().toLocaleDateString("en-US", options);
}

function initializeTheme() {
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    if (savedTheme === "light") {
        document.body.classList.add("light");
        themeToggle.textContent = "☀️ Light Mode";
    } else {
        themeToggle.textContent = "🌙 Dark Mode";
    }

    themeToggle.addEventListener("click", () => {
        const isLight = document.body.classList.toggle("light");
        localStorage.setItem(STORAGE_KEYS.theme, isLight ? "light" : "dark");
        themeToggle.textContent = isLight ? "☀️ Light Mode" : "🌙 Dark Mode";
    });
}

function loadQuote() {
    if (!quote) return;
    quote.textContent = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
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
    if (!exportBtn) return;

    exportBtn.addEventListener("click", () => {
        const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;

        const progressData = {
            name: localStorage.getItem(STORAGE_KEYS.userName) || "User",
            totalXP,
            level,
            goldenDays,
            completionRate: `${completionRate}%`,
            totalTasks: totalTasksCompleted,
            challengeDay: dayNumber,
            streak,
            bestStreak,
            exportedOn: new Date().toLocaleString()
        };

        const blob = new Blob([JSON.stringify(progressData, null, 4)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "AceTrackerProgress.json";
        link.click();
        URL.revokeObjectURL(link.href);
    });
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
        const confirmReset = confirm("⚠️ This will erase ALL progress, streaks, XP, and calendar data.\n\nAre you sure?");
        if (!confirmReset) return;

        const savedName = localStorage.getItem(STORAGE_KEYS.userName);
        const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);

        localStorage.clear();

        if (savedName) localStorage.setItem(STORAGE_KEYS.userName, savedName);
        if (savedTheme) localStorage.setItem(STORAGE_KEYS.theme, savedTheme);

        alert("✅ Ace Tracker progress has been reset.");
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
                .register("service-worker.js")
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