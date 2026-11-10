
console.log("Trolley Problem Phase 5 loaded");

// ==================================================
// 1. HTML ELEMENTS
// ==================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startOverlay = document.getElementById("startOverlay");
const outcomeOverlay = document.getElementById("outcomeOverlay");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const outcomeRestartButton = document.getElementById("outcomeRestartButton");

const trackAButton = document.getElementById("trackAButton");
const trackBButton = document.getElementById("trackBButton");

const scenarioSelect = document.getElementById("scenarioSelect");
const scenarioTitle = document.getElementById("scenarioTitle");
const scenarioDescription = document.getElementById("scenarioDescription");
const scenarioCategory = document.getElementById("scenarioCategory");

const gameStatus = document.getElementById("gameStatus");

const outcomeTitle = document.getElementById("outcomeTitle");
const outcomeMessage = document.getElementById("outcomeMessage");
const earnedScore = document.getElementById("earnedScore");

const soundToggle = document.getElementById("soundToggle");

const peopleAValue = document.getElementById("peopleAValue");
const peopleBValue = document.getElementById("peopleBValue");
const selectedRouteValue = document.getElementById("selectedRouteValue");
const potentialImpact = document.getElementById("potentialImpact");
const impactPercentage = document.getElementById("impactPercentage");
const impactBar = document.getElementById("impactBar");
const ethicalNote = document.getElementById("ethicalNote");

const specialDecisionPanel = document.getElementById("specialDecisionPanel");
const specialDecisionTitle = document.getElementById("specialDecisionTitle");
const specialDecisionDescription = document.getElementById("specialDecisionDescription");
const specialOptionA = document.getElementById("specialOptionA");
const specialOptionB = document.getElementById("specialOptionB");

const historyList = document.getElementById("historyList");
const historyCount = document.getElementById("historyCount");
const resetStatsButton = document.getElementById("resetStatsButton");


// ==================================================
// 2. SCENARIO DATA
// ==================================================

const scenarios = {
    classic: {
        title: "The Classic Dilemma",
        category: "CLASSIC ETHICAL DILEMMA",
        description:
            "Five people are on Track A and one person is on Track B. You can divert the trolley, but every choice has consequences.",
        peopleA: 5,
        peopleB: 1,
        colorsA: ["#d85b50", "#4e91d2", "#e5b34c", "#9b75c8", "#55a58b"],
        colorsB: ["#e58b42"],
        ethicalNote:
            "Consider whether minimizing the number of people at risk should determine your decision.",
        special: null
    },

    workers: {
        title: "Railway Workers",
        category: "WORKPLACE ETHICS",
        description:
            "Three railway workers are on Track A, while two workers are on Track B. Decide which route the trolley should take.",
        peopleA: 3,
        peopleB: 2,
        colorsA: ["#e5a63b", "#e5a63b", "#e5a63b"],
        colorsB: ["#e5a63b", "#e5a63b"],
        ethicalNote:
            "Does the fact that the people are railway workers change how you evaluate the dilemma?",
        special: null
    },

    crowd: {
        title: "The Difficult Choice",
        category: "MORAL TRADE-OFF",
        description:
            "One person is on Track A and four people are on Track B. Consider the consequences before choosing.",
        peopleA: 1,
        peopleB: 4,
        colorsA: ["#55a58b"],
        colorsB: ["#d85b50", "#4e91d2", "#9b75c8", "#e5b34c"],
        ethicalNote:
            "A different number of people on each track can change your decision. Think about why.",
        special: null
    },

    bridge: {
        title: "The Bridge Dilemma",
        category: "ACTIVE INTERVENTION",
        description:
            "The trolley approaches a junction where people are in danger. You can choose a route and decide whether to warn the people.",
        peopleA: 4,
        peopleB: 1,
        colorsA: ["#d85b50", "#4e91d2", "#e5b34c", "#55a58b"],
        colorsB: ["#9b75c8"],
        ethicalNote:
            "Is taking an additional action to warn people part of your responsibility?",
        special: {
            title: "Would you activate the warning signal?",
            description:
                "Choose whether to activate the warning signal before the trolley reaches the selected track.",
            optionA: "🔔 Activate warning",
            optionB: "Continue without warning",
            bonus: 10
        }
    },

    emergency: {
        title: "Emergency Response",
        category: "EMERGENCY DECISION",
        description:
            "An emergency system gives you one chance to slow the trolley. Choose a track, then decide whether to use the emergency brake.",
        peopleA: 2,
        peopleB: 3,
        colorsA: ["#e5a63b", "#4e91d2"],
        colorsB: ["#d85b50", "#9b75c8", "#55a58b"],
        ethicalNote:
            "Think about whether delaying the trolley is worth attempting when the outcome is uncertain.",
        special: {
            title: "Use the emergency brake?",
            description:
                "The emergency brake can slow the trolley. In this simplified simulation, it does not guarantee that everyone will be safe.",
            optionA: "🛑 Activate emergency brake",
            optionB: "Do not activate brake",
            bonus: 10
        }
    }
};


// ==================================================
// 3. GAME VARIABLES
// ==================================================

let gameState = "ready";
let currentScenario = "classic";

let mainProgress = 0;
let branchProgress = 0;

let selectedTrack = null;
let specialChoice = null;
let brakeStopProgress = null;
let brakeStopped = false;

let previousTime = 0;
let countdown = 3;

let outcomeRecorded = false;
let soundEnabled = true;

let audioContext = null;
let lastTrainSoundTime = 0;

const TRAIN_SPEED = 0.24;


// ==================================================
// 4. TRACK DEFINITIONS
// ==================================================

const mainTrack = {
    start: { x: 40, y: 280 },
    control: { x: 260, y: 280 },
    end: { x: 480, y: 280 }
};

const trackA = {
    start: { x: 480, y: 280 },
    control: { x: 700, y: 120 },
    end: { x: 960, y: 120 }
};

const trackB = {
    start: { x: 480, y: 280 },
    control: { x: 700, y: 440 },
    end: { x: 960, y: 440 }
};


// ==================================================
// 5. CHARACTER CREATION
// ==================================================

let peopleOnTrackA = [];
let peopleOnTrackB = [];

function createPeople(count, colors) {
    const people = [];

    for (let i = 0; i < count; i++) {
        people.push({
            progress: 0.64 + i * 0.075,
            offset: i % 2 === 0 ? -17 : 17,
            shirt: colors[i % colors.length],
            skin: ["#d6a17e", "#edbd98", "#b87955", "#e2ad83"][i % 4],
            hair: ["#30251f", "#4a3025", "#1e1d20", "#70503a"][i % 4],
            evacuated: false
        });
    }

    return people;
}

function loadScenario() {
    const scenario = scenarios[currentScenario];

    peopleOnTrackA = createPeople(
        scenario.peopleA,
        scenario.colorsA
    );

    peopleOnTrackB = createPeople(
        scenario.peopleB,
        scenario.colorsB
    );

    scenarioTitle.textContent = scenario.title;
    scenarioDescription.textContent = scenario.description;
    scenarioCategory.textContent = scenario.category;

    ethicalNote.textContent = scenario.ethicalNote;

    peopleAValue.textContent = scenario.peopleA;
    peopleBValue.textContent = scenario.peopleB;

    selectedRouteValue.textContent = "Not selected";
    potentialImpact.textContent = "--";
    impactPercentage.textContent = "0%";
    impactBar.style.width = "0%";

    specialDecisionPanel.classList.add("hidden");

    drawGame();
}


// ==================================================
// 6. SOUND SYSTEM
// ==================================================

function initializeAudio() {
    if (!audioContext) {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (AudioContextClass) {
            audioContext = new AudioContextClass();
        }
    }

    if (audioContext && audioContext.state === "suspended") {
        audioContext.resume();
    }
}

function playTone(frequency, duration, type = "sine", volume = 0.08) {
    if (!soundEnabled) return;

    initializeAudio();

    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(
        frequency,
        audioContext.currentTime
    );

    gain.gain.setValueAtTime(
        volume,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

function playCountdownSound() {
    playTone(600, 0.12, "sine", 0.07);
}

function playSelectionSound() {
    playTone(800, 0.18, "triangle", 0.08);
}

function playWarningSound() {
    playTone(350, 0.25, "sawtooth", 0.045);
}

function playOutcomeSound() {
    playTone(480, 0.2, "sine", 0.08);

    if (soundEnabled) {
        // A second short tone gives the outcome a distinct finish.
        // It is scheduled through the Web Audio API.
        initializeAudio();

        if (audioContext) {
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = 620;

            gain.gain.setValueAtTime(0.06, audioContext.currentTime + 0.2);
            gain.gain.exponentialRampToValueAtTime(
                0.001,
                audioContext.currentTime + 0.55
            );

            oscillator.connect(gain);
            gain.connect(audioContext.destination);

            oscillator.start(audioContext.currentTime + 0.2);
            oscillator.stop(audioContext.currentTime + 0.55);
        }
    }
}

function updateSoundButton() {
    soundToggle.textContent = soundEnabled
        ? "🔊 Sound: ON"
        : "🔇 Sound: OFF";
}

soundToggle.addEventListener("click", function () {
    soundEnabled = !soundEnabled;

    if (soundEnabled) {
        initializeAudio();
        playSelectionSound();
    }

    updateSoundButton();
});


// ==================================================
// 7. BACKGROUND
// ==================================================

function drawBackground() {
    ctx.fillStyle = "#304c35";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 180; i++) {
        const x = (i * 137) % canvas.width;
        const y = (i * 83) % canvas.height;

        ctx.fillStyle = i % 2 === 0
            ? "rgba(155, 190, 110, 0.12)"
            : "rgba(10, 30, 15, 0.12)";

        ctx.fillRect(x, y, 3, 3);
    }
}


// ==================================================
// 8. BEZIER TRACK HELPERS
// ==================================================

function getPointOnTrack(track, progress) {
    const t = Math.max(0, Math.min(1, progress));
    const inverse = 1 - t;

    const x =
        inverse * inverse * track.start.x +
        2 * inverse * t * track.control.x +
        t * t * track.end.x;

    const y =
        inverse * inverse * track.start.y +
        2 * inverse * t * track.control.y +
        t * t * track.end.y;

    return { x, y };
}

function getTrackAngle(track, progress) {
    const step = 0.001;

    const p1 = getPointOnTrack(
        track,
        Math.max(0, progress - step)
    );

    const p2 = getPointOnTrack(
        track,
        Math.min(1, progress + step)
    );

    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function getOffsetPosition(track, progress, offset) {
    const point = getPointOnTrack(track, progress);
    const angle = getTrackAngle(track, progress);

    return {
        x: point.x - Math.sin(angle) * offset,
        y: point.y + Math.cos(angle) * offset
    };
}


// ==================================================
// 9. DRAW TRACKS
// ==================================================

function drawTrack(track) {
    const steps = 65;

    ctx.beginPath();

    for (let i = 0; i <= steps; i++) {
        const point = getPointOnTrack(track, i / steps);

        if (i === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    }

    // Gravel bed
    ctx.lineWidth = 78;
    ctx.strokeStyle = "#777b73";
    ctx.stroke();

    ctx.lineWidth = 70;
    ctx.strokeStyle = "#656a63";
    ctx.stroke();

    // Railway sleepers
    for (let i = 0; i <= 36; i++) {
        const progress = i / 36;
        const point = getPointOnTrack(track, progress);
        const angle = getTrackAngle(track, progress);

        ctx.save();
        ctx.translate(point.x, point.y);
        ctx.rotate(angle);

        ctx.fillStyle = "#44382d";
        ctx.fillRect(-6, -43, 12, 86);

        ctx.restore();
    }

    // Rails
    for (const offset of [-25, 25]) {
        ctx.beginPath();

        for (let i = 0; i <= steps; i++) {
            const point = getOffsetPosition(track, i / steps, offset);

            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }

        ctx.lineWidth = 7;
        ctx.strokeStyle = "#252c34";
        ctx.stroke();

        ctx.lineWidth = 4;
        ctx.strokeStyle = "#c6cbd0";
        ctx.stroke();
    }
}


// ==================================================
// 10. DRAW PEOPLE
// ==================================================

function drawPerson(x, y, person) {
    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(2, 5, 13, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.lineCap = "round";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#283443";

    ctx.beginPath();
    ctx.moveTo(-4, 5);
    ctx.lineTo(-6, 15);
    ctx.moveTo(4, 5);
    ctx.lineTo(6, 15);
    ctx.stroke();

    // Arms
    ctx.lineWidth = 5;
    ctx.strokeStyle = person.skin;

    ctx.beginPath();
    ctx.moveTo(-7, -3);
    ctx.lineTo(-13, 5);
    ctx.moveTo(7, -3);
    ctx.lineTo(13, 5);
    ctx.stroke();

    // Body
    ctx.fillStyle = person.shirt;
    ctx.strokeStyle = "#202833";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(-8, -9, 16, 20, 5);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.fillStyle = person.skin;
    ctx.beginPath();
    ctx.arc(0, -15, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hair
    ctx.fillStyle = person.hair;
    ctx.beginPath();
    ctx.arc(0, -17, 7, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawPeopleOnTrack(track, people) {
    people.forEach(person => {
        if (person.evacuated) return;

        const position = getOffsetPosition(
            track,
            person.progress,
            person.offset
        );

        drawPerson(position.x, position.y, person);
    });
}


// ==================================================
// 11. DRAW TRACK LABELS
// ==================================================

function drawTrackLabels() {
    ctx.save();

    ctx.font = "bold 19px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";

    ctx.fillText("TRACK A", 825, 65);
    ctx.fillText("TRACK B", 825, 520);

    ctx.fillStyle = "#f2d28b";
    ctx.font = "bold 14px Arial";

    ctx.fillText(
        `${peopleOnTrackA.length} ${peopleOnTrackA.length === 1 ? "PERSON" : "PEOPLE"}`,
        825,
        88
    );

    ctx.fillText(
        `${peopleOnTrackB.length} ${peopleOnTrackB.length === 1 ? "PERSON" : "PEOPLE"}`,
        825,
        543
    );

    ctx.restore();
}


// ==================================================
// 12. DRAW JUNCTION
// ==================================================

function drawSwitch() {
    ctx.save();

    ctx.fillStyle = "#d4a64d";
    ctx.beginPath();
    ctx.arc(480, 280, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#252c34";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(480, 280);
    ctx.lineTo(495, 255);
    ctx.stroke();

    ctx.fillStyle = "#f5d18a";
    ctx.beginPath();
    ctx.arc(495, 255, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}


// ==================================================
// 13. DRAW TRAIN
// ==================================================

function drawTrain(x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(-32, -13, 70, 34);

    // Train body
    ctx.fillStyle = "#c84a42";
    ctx.strokeStyle = "#501e1e";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.roundRect(-38, -15, 75, 30, 7);
    ctx.fill();
    ctx.stroke();

    // Front
    ctx.fillStyle = "#e6a34c";
    ctx.fillRect(16, -12, 15, 24);

    // Windows
    ctx.fillStyle = "#9fd0df";
    ctx.fillRect(-28, -10, 13, 20);
    ctx.fillRect(-9, -10, 13, 20);

    // Wheels
    ctx.fillStyle = "#171b20";

    for (const wheelX of [-25, 20]) {
        ctx.beginPath();
        ctx.arc(wheelX, -17, 5, 0, Math.PI * 2);
        ctx.arc(wheelX, 17, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Headlight
    ctx.fillStyle = "#fff3b0";
    ctx.beginPath();
    ctx.arc(35, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}


// ==================================================
// 14. GET TRAIN POSITION
// ==================================================

function getTrainPosition() {
    if (
        gameState === "moving-branch" ||
        gameState === "outcome" ||
        gameState === "finished"
    ) {
        const route = selectedTrack === "A" ? trackA : trackB;

        return {
            ...getPointOnTrack(route, branchProgress),
            angle: getTrackAngle(route, branchProgress)
        };
    }

    return {
        ...getPointOnTrack(mainTrack, mainProgress),
        angle: getTrackAngle(mainTrack, mainProgress)
    };
}


// ==================================================
// 15. COLLISION DETECTION
// ==================================================

function checkCollision() {
    const people = selectedTrack === "A"
        ? peopleOnTrackA
        : peopleOnTrackB;

    const route = selectedTrack === "A" ? trackA : trackB;
    const trainPosition = getTrainPosition();

    for (const person of people) {
        if (person.evacuated) continue;

        const personPosition = getOffsetPosition(
            route,
            person.progress,
            person.offset
        );

        const distance = Math.hypot(
            trainPosition.x - personPosition.x,
            trainPosition.y - personPosition.y
        );

        if (distance < 42) {
            return true;
        }
    }

    return false;
}


// ==================================================
// 16. DRAW SCENE
// ==================================================

function drawGame() {
    drawBackground();

    drawTrack(mainTrack);
    drawTrack(trackA);
    drawTrack(trackB);

    drawPeopleOnTrack(trackA, peopleOnTrackA);
    drawPeopleOnTrack(trackB, peopleOnTrackB);

    drawTrackLabels();
    drawSwitch();

    const train = getTrainPosition();

    drawTrain(train.x, train.y, train.angle);

    if (gameState === "countdown") {
        ctx.save();

        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 75px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            Math.ceil(countdown),
            canvas.width / 2,
            canvas.height / 2
        );

        ctx.restore();
    }

    if (gameState === "waiting-at-junction") {
        ctx.save();

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(300, 15, 400, 42);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "CHOOSE TRACK A OR TRACK B",
            500,
            43
        );

        ctx.restore();
    }
}


// ==================================================
// 17. ROUTE BUTTONS
// ==================================================

function enableRouteButtons(enabled) {
    trackAButton.disabled = !enabled;
    trackBButton.disabled = !enabled;
}


// ==================================================
// 18. START GAME
// ==================================================

function startGame() {
    if (gameState !== "ready") return;

    initializeAudio();

    mainProgress = 0;
    branchProgress = 0;

    selectedTrack = null;
    specialChoice = null;
    brakeStopProgress = null;
    brakeStopped = false;

    countdown = 3;
    gameState = "countdown";

    outcomeRecorded = false;
    lastTrainSoundTime = 0;

    startOverlay.classList.add("hidden");
    outcomeOverlay.classList.add("hidden");
    specialDecisionPanel.classList.add("hidden");

    enableRouteButtons(false);

    selectedRouteValue.textContent = "Not selected";
    potentialImpact.textContent = "--";
    impactPercentage.textContent = "0%";
    impactBar.style.width = "0%";

    gameStatus.textContent = "Simulation starting...";
}


// ==================================================
// 19. UPDATE GAME
// ==================================================

function updateGame(deltaTime, currentTime) {
    if (gameState === "countdown") {
        const oldCountdown = Math.ceil(countdown);

        countdown -= deltaTime;

        if (Math.ceil(countdown) < oldCountdown && countdown > 0) {
            playCountdownSound();
        }

        if (countdown <= 0) {
            gameState = "moving-main";
            gameStatus.textContent = "Trolley approaching junction";
            playWarningSound();
        }
    }

    else if (gameState === "moving-main") {
        mainProgress += TRAIN_SPEED * deltaTime;

        if (currentTime - lastTrainSoundTime > 1000) {
            playTone(110, 0.12, "sawtooth", 0.025);
            lastTrainSoundTime = currentTime;
        }

        if (mainProgress >= 1) {
            mainProgress = 1;

            gameState = "waiting-at-junction";

            gameStatus.textContent = "Choose a track now";

            enableRouteButtons(true);
            playWarningSound();
        }
    }

    else if (gameState === "moving-branch") {
        const brakeMultiplier = specialChoice === "brake" ? 0.55 : 1;

        branchProgress += TRAIN_SPEED * brakeMultiplier * deltaTime;

        if (currentTime - lastTrainSoundTime > 1000) {
            playTone(100, 0.12, "sawtooth", 0.025);
            lastTrainSoundTime = currentTime;
        }

        // The emergency brake stops the trolley before the first person.
        if (
            specialChoice === "brake" &&
            brakeStopProgress !== null &&
            branchProgress >= brakeStopProgress
        ) {
            branchProgress = brakeStopProgress;
            brakeStopped = true;
            gameState = "finished";
            showOutcome(false);
        }
        else if (checkCollision()) {
            gameState = "outcome";
            showOutcome(true);
        }
        else if (branchProgress >= 1) {
            branchProgress = 1;
            gameState = "finished";
            showOutcome(false);
        }
    }
}


// ==================================================
// 20. ROUTE SELECTION
// ==================================================

function selectTrack(route) {
    if (gameState !== "waiting-at-junction") return;

    selectedTrack = route;

    selectedRouteValue.textContent = `Track ${route}`;

    const peopleCount = route === "A"
        ? peopleOnTrackA.length
        : peopleOnTrackB.length;

    // Impact percentage is a descriptive game indicator,
    // not a moral judgement or real-world risk calculation.
    const impact = Math.round(
        (peopleCount / Math.max(peopleOnTrackA.length, peopleOnTrackB.length)) * 100
    );

    potentialImpact.textContent =
        `${peopleCount} ${peopleCount === 1 ? "person" : "people"}`;

    impactPercentage.textContent = `${impact}%`;
    impactBar.style.width = `${impact}%`;

    ethicalNote.textContent =
        `You selected Track ${route}, where ${peopleCount} ` +
        `${peopleCount === 1 ? "person is" : "people are"} placed. ` +
        `Consider the possible consequences of this choice.`;

    playSelectionSound();

    enableRouteButtons(false);

    const scenario = scenarios[currentScenario];

    if (scenario.special) {
        gameState = "waiting-special";

        specialDecisionTitle.textContent = scenario.special.title;
        specialDecisionDescription.textContent = scenario.special.description;

        specialOptionA.textContent = scenario.special.optionA;
        specialOptionB.textContent = scenario.special.optionB;

        specialDecisionPanel.classList.remove("hidden");

        gameStatus.textContent = "Make your additional decision";

        return;
    }

    beginBranchMovement();
}


// ==================================================
// 21. SPECIAL DECISION
// ==================================================

function makeSpecialDecision(choice) {
    if (gameState !== "waiting-special") return;

    specialChoice = choice;

    specialDecisionPanel.classList.add("hidden");

    if (choice === "warning") {
        // Simplified scenario rule: the warning gives people time to clear this track.
        const selectedPeople = selectedTrack === "A"
            ? peopleOnTrackA
            : peopleOnTrackB;

        selectedPeople.forEach(person => {
            person.evacuated = true;
        });

        ethicalNote.textContent =
            "The warning signal was activated. In this simplified simulation, people clear the selected track before the trolley arrives.";

        playWarningSound();
    } else if (choice === "brake") {
        const selectedPeople = selectedTrack === "A"
            ? peopleOnTrackA
            : peopleOnTrackB;

        const firstPersonProgress = Math.min(
            ...selectedPeople.map(person => person.progress)
        );

        // Leave enough distance for the train's front and collision radius.
        brakeStopProgress = Math.max(0, firstPersonProgress - 0.14);

        ethicalNote.textContent =
            "The emergency brake is active. The trolley will stop before reaching the first person.";

        playTone(220, 0.4, "sawtooth", 0.06);
    } else {
        playSelectionSound();
    }

    beginBranchMovement();
}

function beginBranchMovement() {
    branchProgress = 0;
    gameState = "moving-branch";

    gameStatus.textContent = `Trolley moving on Track ${selectedTrack}`;
}


// ==================================================
// 22. STORAGE HELPERS
// ==================================================

const HISTORY_KEY = "trolleyPhase5History";
const SCORE_KEY = "trolleyPhase5Score";

function readHistory() {
    try {
        const data = JSON.parse(localStorage.getItem(HISTORY_KEY));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Could not read saved history:", error);
        return [];
    }
}

function readScore() {
    try {
        const data = JSON.parse(localStorage.getItem(SCORE_KEY));

        if (data && typeof data === "object") {
            return {
                total: Number(data.total) || 0,
                best: Number(data.best) || 0
            };
        }
    } catch (error) {
        console.error("Could not read saved score:", error);
    }

    return { total: 0, best: 0 };
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Could not save game data:", error);
        return false;
    }
}


// ==================================================
// 23. SCORING SYSTEM
// ==================================================

function calculateScore(peopleCount) {
    // A smaller number of people on the selected track
    // produces a higher game impact score.
    const decisionPoints = Math.max(10, 100 - peopleCount * 15);

    // Award points for completing the scenario.
    const completionBonus = 20;

    // Special choices award a small participation bonus.
    const specialBonus = specialChoice &&
        (specialChoice === "warning" || specialChoice === "brake")
        ? 10
        : 0;

    return {
        decisionPoints,
        completionBonus,
        specialBonus,
        total: decisionPoints + completionBonus + specialBonus
    };
}


// ==================================================
// 24. COMPLETE DECISION AND SHOW OUTCOME
// ==================================================

function showOutcome(collision) {
    enableRouteButtons(false);
    specialDecisionPanel.classList.add("hidden");

    const scenario = scenarios[currentScenario];

    const peopleA = peopleOnTrackA.length;
    const peopleB = peopleOnTrackB.length;

    const peopleOnChosenTrack = selectedTrack === "A"
        ? peopleA
        : peopleB;

    const resultText = collision
        ? `The trolley reached the people on Track ${selectedTrack}.`
        : brakeStopped
            ? "The emergency brake stopped the trolley before it reached the people."
            : specialChoice === "warning"
                ? "The warning signal gave the people time to clear the selected track."
                : "The trolley reached the end of the selected track without reaching a character.";

    const score = calculateScore(peopleOnChosenTrack);

    outcomeTitle.textContent = collision
        ? "Decision Outcome"
        : "Simulation Complete";

    let specialText = "";

    if (specialChoice === "warning") {
        specialText = " You activated the warning signal.";
    } else if (specialChoice === "brake") {
        specialText = " You activated the emergency brake.";
    } else if (specialChoice === "no-warning") {
        specialText = " You continued without activating the warning signal.";
    } else if (specialChoice === "no-brake") {
        specialText = " You chose not to activate the emergency brake.";
    }

    outcomeMessage.textContent =
        `${resultText} You selected Track ${selectedTrack}, where ` +
        `${peopleOnChosenTrack} ${peopleOnChosenTrack === 1 ? "person was" : "people were"} placed. ` +
        `Track A had ${peopleA} and Track B had ${peopleB}.` +
        specialText;

    earnedScore.textContent = score.total;

    gameStatus.textContent = collision
        ? `Outcome: Track ${selectedTrack}`
        : "Simulation completed";

    outcomeOverlay.classList.remove("hidden");

    if (!outcomeRecorded) {
        const entry = {
            scenario: scenario.title,
            route: selectedTrack,
            peopleA,
            peopleB,
            selectedPeople: peopleOnChosenTrack,
            collision,
            brakeStopped,
            specialChoice: specialChoice || "None",
            decisionPoints: score.decisionPoints,
            completionBonus: score.completionBonus,
            specialBonus: score.specialBonus,
            score: score.total,
            result: resultText,
            date: new Date().toLocaleString()
        };

        const history = readHistory();
        history.unshift(entry);

        // Keep the most recent 50 decisions.
        writeStorage(HISTORY_KEY, history.slice(0, 50));

        const savedScore = readScore();

        savedScore.total += score.total;
        savedScore.best = Math.max(savedScore.best, score.total);

        writeStorage(SCORE_KEY, savedScore);

        outcomeRecorded = true;

        playOutcomeSound();

        updateDashboard();
        renderHistory();
    }
}


// ==================================================
// 25. DECISION HISTORY
// ==================================================

function renderHistory() {
    const history = readHistory();

    historyCount.textContent = history.length;

    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <span>📋</span>
                <p>No decisions yet.</p>
                <small>Complete a scenario to see your history.</small>
            </div>
        `;

        return;
    }

    historyList.innerHTML = "";

    history.forEach((entry, index) => {
        const item = document.createElement("article");
        item.className = "history-item";

        const title = document.createElement("h3");
        title.textContent = `${index + 1}. ${entry.scenario}`;

        const route = document.createElement("p");
        route.textContent = `Selected route: Track ${entry.route}`;

        const people = document.createElement("p");
        people.textContent =
            `Track A: ${entry.peopleA} | Track B: ${entry.peopleB}`;

        const result = document.createElement("p");
        result.textContent = entry.result;

        const special = document.createElement("p");
        special.textContent =
            `Additional action: ${formatSpecialChoice(entry.specialChoice)}`;

        const points = document.createElement("p");
        points.textContent = `Points earned: ${entry.score}`;

        const date = document.createElement("p");
        date.className = "history-date";
        date.textContent = entry.date;

        item.append(
            title,
            route,
            people,
            result,
            special,
            points,
            date
        );

        historyList.appendChild(item);
    });
}

function formatSpecialChoice(choice) {
    const labels = {
        warning: "Warning signal activated",
        "no-warning": "No warning signal",
        brake: "Emergency brake activated",
        "no-brake": "Emergency brake not used",
        None: "No additional action"
    };

    return labels[choice] || "No additional action";
}


// ==================================================
// 26. ANALYTICS DASHBOARD
// ==================================================

function updateDashboard() {
    const history = readHistory();
    const savedScore = readScore();

    const total = history.length;

    const trackACount = history.filter(
        entry => entry.route === "A"
    ).length;

    const trackBCount = history.filter(
        entry => entry.route === "B"
    ).length;

    const selectedPeopleTotal = history.reduce(
        (sum, entry) => sum + (Number(entry.selectedPeople) || 0),
        0
    );

    const totalPoints = history.reduce(
        (sum, entry) => sum + (Number(entry.score) || 0),
        0
    );

    const decisionPoints = history.reduce(
        (sum, entry) => sum + (Number(entry.decisionPoints) || 0),
        0
    );

    const completionPoints = history.reduce(
        (sum, entry) => sum + (Number(entry.completionBonus) || 0),
        0
    );

    const averageImpact = total > 0
        ? Math.round(
            history.reduce(
                (sum, entry) => sum + (Number(entry.selectedPeople) || 0),
                0
            ) / total
        )
        : 0;

    const averagePoints = total > 0
        ? Math.round(totalPoints / total)
        : 0;

    document.getElementById("totalScore").textContent = savedScore.total;
    document.getElementById("totalDecisions").textContent = total;

    document.getElementById("averageImpact").textContent =
        total > 0 ? averageImpact : "--";

    document.getElementById("bestScore").textContent = savedScore.best;

    document.getElementById("trackACount").textContent = trackACount;
    document.getElementById("trackBCount").textContent = trackBCount;

    document.getElementById("completedCount").textContent = total;

    document.getElementById("selectedPeopleTotal").textContent =
        selectedPeopleTotal;

    document.getElementById("averagePoints").textContent =
        averagePoints;

    document.getElementById("decisionPoints").textContent =
        decisionPoints;

    document.getElementById("completionPoints").textContent =
        completionPoints;

    document.getElementById("dashboardScore").textContent =
        savedScore.total;

    const trackAPercentage = total > 0
        ? (trackACount / total) * 100
        : 0;

    const trackBPercentage = total > 0
        ? (trackBCount / total) * 100
        : 0;

    document.getElementById("trackABar").style.width =
        `${trackAPercentage}%`;

    document.getElementById("trackBBar").style.width =
        `${trackBPercentage}%`;
}


// ==================================================
// 27. RESTART SIMULATION
// ==================================================

function restartGame() {
    gameState = "ready";

    mainProgress = 0;
    branchProgress = 0;

    selectedTrack = null;
    specialChoice = null;
    brakeStopProgress = null;
    brakeStopped = false;

    countdown = 3;
    outcomeRecorded = false;

    startOverlay.classList.remove("hidden");
    outcomeOverlay.classList.add("hidden");
    specialDecisionPanel.classList.add("hidden");

    enableRouteButtons(false);

    gameStatus.textContent = "Ready to begin";

    selectedRouteValue.textContent = "Not selected";
    potentialImpact.textContent = "--";
    impactPercentage.textContent = "0%";
    impactBar.style.width = "0%";

    drawGame();
}


// ==================================================
// 28. CHANGE SCENARIO
// ==================================================

scenarioSelect.addEventListener("change", function () {
    const activeStates = [
        "countdown",
        "moving-main",
        "waiting-at-junction",
        "waiting-special",
        "moving-branch"
    ];

    if (activeStates.includes(gameState)) {
        scenarioSelect.value = currentScenario;
        return;
    }

    currentScenario = scenarioSelect.value;

    restartGame();
    loadScenario();
});


// ==================================================
// 29. EVENT LISTENERS
// ==================================================

startButton.addEventListener("click", startGame);

restartButton.addEventListener("click", restartGame);

outcomeRestartButton.addEventListener("click", restartGame);

trackAButton.addEventListener("click", () => selectTrack("A"));

trackBButton.addEventListener("click", () => selectTrack("B"));

specialOptionA.addEventListener("click", function () {
    if (currentScenario === "bridge") {
        makeSpecialDecision("warning");
    } else if (currentScenario === "emergency") {
        makeSpecialDecision("brake");
    }
});

specialOptionB.addEventListener("click", function () {
    if (currentScenario === "bridge") {
        makeSpecialDecision("no-warning");
    } else if (currentScenario === "emergency") {
        makeSpecialDecision("no-brake");
    }
});


// ==================================================
// 30. RESET STATISTICS
// ==================================================

resetStatsButton.addEventListener("click", function () {
    const confirmed = confirm(
        "Are you sure you want to reset all scores, analytics and decision history?"
    );

    if (!confirmed) return;

    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(SCORE_KEY);

    updateDashboard();
    renderHistory();

    ethicalNote.textContent =
        scenarios[currentScenario].ethicalNote;
});


// ==================================================
// 31. KEYBOARD CONTROLS
// ==================================================

document.addEventListener("keydown", function (event) {
    if (
        event.target.tagName === "SELECT" ||
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
    ) {
        return;
    }

    const key = event.key.toLowerCase();

    if (key === "a") {
        selectTrack("A");
    }

    else if (key === "b") {
        selectTrack("B");
    }

    else if (key === "r") {
        restartGame();
    }
});


// ==================================================
// 32. ANIMATION LOOP
// ==================================================

function animate(currentTime) {
    if (!previousTime) {
        previousTime = currentTime;
    }

    let deltaTime = (currentTime - previousTime) / 1000;

    previousTime = currentTime;

    // Avoid sudden jumps after a browser tab is inactive.
    deltaTime = Math.min(deltaTime, 0.05);

    updateGame(deltaTime, currentTime);
    drawGame();

    requestAnimationFrame(animate);
}


// ==================================================
// 33. INITIALIZE APPLICATION
// ==================================================

loadScenario();

renderHistory();
updateDashboard();

enableRouteButtons(false);
updateSoundButton();

requestAnimationFrame(animate);
