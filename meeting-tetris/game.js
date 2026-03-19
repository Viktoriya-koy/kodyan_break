const requestsContainer = document.getElementById('requests-container');
const reqCountEl = document.getElementById('req-count');
const scoreValEl = document.getElementById('score-val');
const failBarEl = document.getElementById('fail-bar');
const bossOverlay = document.getElementById('boss-overlay');
const dayColumns = [
    document.getElementById('col-0'),
    document.getElementById('col-1'),
    document.getElementById('col-2'),
    document.getElementById('col-3'),
    document.getElementById('col-4')
];

// Config per Level (Day of Week)
const LEVELS = [
    { name: "LUNES", rate: 0.005, maxQ: 4, pointsNeeded: 15, fixed: 1 },
    { name: "MARTES", rate: 0.008, maxQ: 5, pointsNeeded: 20, fixed: 2 },
    { name: "MIÉRCOLES", rate: 0.01, maxQ: 5, pointsNeeded: 25, fixed: 3 },
    { name: "JUEVES", rate: 0.015, maxQ: 6, pointsNeeded: 30, fixed: 4 },
    { name: "VIERNES", rate: 0.02, maxQ: 7, pointsNeeded: 35, fixed: 5 } // Panic
];

const SLOT_HEIGHT = 30; // px
const SLOTS_PER_DAY = 18; // 9 hours * 2

// State
let queue = [];
let gridState = Array(5).fill().map(() => Array(SLOTS_PER_DAY).fill(false)); // true if occupied
let score = 0;
let isPlaying = true;
let isBossMode = false;
let spawnTimer = 0;
let currentDay = 0; // 0=Mon, 4=Fri

// Event Types
const EVENT_TYPES = [
    { name: "Daily Standup", duration: 1, type: 'normal' }, // 30m
    { name: "Coffee Chat", duration: 1, type: 'chill' },
    { name: "Planning", duration: 2, type: 'normal' }, // 1h
    { name: "Workshop", duration: 4, type: 'normal' }, // 2h
    { name: "URGENTE: JEFE", duration: 1, type: 'urgent' },
    { name: "Revisión Q1", duration: 2, type: 'urgent' },
    { name: "All-Hands", duration: 3, type: 'urgent' }
];

function init() {
    startLevel(0);
    requestAnimationFrame(loop);
}

function startLevel(dayIdx) {
    currentDay = dayIdx;
    queue = [];
    score = 0;
    spawnTimer = 0;
    requestsContainer.innerHTML = '';

    // Reset Grid Visuals (keep placed for continuity? No, clean slate for gameplay focus)
    // Actually, expanding to 5 days means we play ONE day at a time or the WHOLE week?
    // Let's make it levels: Level 1 = Monday. Win = Clear X meetings without fail.

    // Clear Grid State
    gridState = Array(5).fill().map(() => Array(SLOTS_PER_DAY).fill(false));
    dayColumns.forEach(c => c.innerHTML = '');

    // Setup Obstructions
    const lvl = LEVELS[currentDay];
    document.querySelector('h1').textContent = `Meeting Tetris - ${lvl.name}`;
    scoreValEl.textContent = `0 / ${lvl.pointsNeeded}`;

    // Place Lunch
    for (let d = 0; d < 5; d++) placeFixedEvent(d, 8, 2, "Almuerzo");

    // Add difficulty obstructions
    for (let i = 0; i < lvl.fixed; i++) {
        const d = Math.floor(Math.random() * 5);
        const s = Math.floor(Math.random() * (SLOTS_PER_DAY - 4));
        if (!checkCollision(d, s, 2)) placeFixedEvent(d, s, 2, "Bloqueado");
    }

    spawnRequest();
}

function loop(timestamp) {
    if (!isPlaying) return;

    const lvl = LEVELS[currentDay];

    // Spawner
    if (Math.random() < lvl.rate && queue.length < lvl.maxQ) {
        spawnRequest();
    }

    // Fail check
    if (queue.length >= lvl.maxQ) {
        spawnTimer += 16;
        if (spawnTimer > 4000) { // 4s grace
            gameOver();
        }
    } else {
        spawnTimer = 0;
    }

    requestAnimationFrame(loop);
}

function spawnRequest() {
    const lvl = LEVELS[currentDay];
    if (queue.length >= lvl.maxQ) return;

    const template = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    const event = {
        id: Date.now() + Math.random(),
        ...template,
        dom: null
    };

    createEventDOM(event);
    queue.push(event);
    updateQueueUI();
}

function createEventDOM(event) {
    const el = document.createElement('div');
    el.className = `event-block type-${event.type}`;
    el.textContent = event.name;
    el.style.height = (event.duration * SLOT_HEIGHT) + 'px';

    // Drag Logic
    el.addEventListener('mousedown', (e) => startDrag(e, event, el));

    event.dom = el;
    requestsContainer.appendChild(el);
}

// Drag & Drop
let draggedEvent = null;
let draggedEl = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

function startDrag(e, event, el) {
    if (isBossMode) return;
    draggedEvent = event;
    draggedEl = el;

    // Calculate offset to prevent "jump"
    const rect = el.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;

    draggedEl.classList.add('dragging');
    draggedEl.style.width = '150px';

    // Initial position sync
    draggedEl.style.left = (e.clientX - dragOffsetX) + 'px';
    draggedEl.style.top = (e.clientY - dragOffsetY) + 'px';

    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
}

function onDragMove(e) {
    if (!draggedEl) return;
    draggedEl.style.left = (e.clientX - dragOffsetX) + 'px';
    draggedEl.style.top = (e.clientY - dragOffsetY) + 'px';
}

function onDragEnd(e) {
    if (!draggedEl) return;
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
    draggedEl.classList.remove('dragging');
    draggedEl.style.position = '';
    draggedEl.style.left = '';
    draggedEl.style.top = '';
    draggedEl.style.width = '';
    attemptDrop(e.clientX, e.clientY);
    draggedEvent = null;
    draggedEl = null;
}

function attemptDrop(x, y) {
    for (let i = 0; i < 5; i++) {
        const col = dayColumns[i];
        const rect = col.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            const relY = y - rect.top; // scrollTop is usually 0 here
            const slotIndex = Math.floor(relY / SLOT_HEIGHT);

            if (slotIndex >= 0 && slotIndex + draggedEvent.duration <= SLOTS_PER_DAY) {
                if (!checkCollision(i, slotIndex, draggedEvent.duration)) {
                    placeEvent(i, slotIndex, draggedEvent);
                } else {
                    flashError(col);
                }
            }
            return;
        }
    }
}

function checkCollision(dayIndex, startSlot, duration) {
    if (startSlot + duration > SLOTS_PER_DAY) return true; // Bounds Check
    for (let i = 0; i < duration; i++) {
        if (gridState[dayIndex][startSlot + i]) return true;
    }
    return false;
}

function placeEvent(dayIndex, startSlot, event) {
    for (let i = 0; i < event.duration; i++) {
        gridState[dayIndex][startSlot + i] = true;
    }

    const col = dayColumns[dayIndex];
    event.dom.classList.remove('dragging');
    event.dom.classList.add('placed');
    event.dom.style.top = (startSlot * SLOT_HEIGHT) + 'px';
    event.dom.style.height = (event.duration * SLOT_HEIGHT - 2) + 'px';

    queue = queue.filter(e => e !== event);
    col.appendChild(event.dom);

    const newClone = event.dom.cloneNode(true);
    event.dom.replaceWith(newClone);
    event.dom = newClone; // Update ref just in case

    score++;
    const lvl = LEVELS[currentDay];
    scoreValEl.textContent = `${score} / ${lvl.pointsNeeded}`;
    addXP(10);

    if (score >= lvl.pointsNeeded) {
        winLevel();
    }
    updateQueueUI();
}

function winLevel() {
    // Assuming 'placedCount' is meant to be 'score' based on the original logic
    // and 'initDay' is meant to be 'startLevel'
    if (score >= LEVELS[currentDay].pointsNeeded) { // Replaced 'placedCount === 30' with original win condition
        alert(`DÍA ${currentDay + 1} COMPLETADO. Sobreviviste a la agenda.`);

        if (currentDay < 4) {
            currentDay++;
            localStorage.setItem('vico_level_tetris', currentDay + 1); // Save Progress
            startLevel(currentDay); // Changed initDay to startLevel
        } else {
            isPlaying = false; // Added from original winLevel
            alert("¡SEMANA INFERNAL COMPLETADA! Eres el maestro del tiempo.");
            addXP(500); // Added from original winLevel
            location.reload();
        }
    }
}

function placeFixedEvent(day, slot, duration, name) {
    for (let i = 0; i < duration; i++) {
        gridState[day][slot + i] = true;
    }
    const div = document.createElement('div');
    div.className = 'event-block type-fixed placed';
    div.textContent = name;
    div.style.top = (slot * SLOT_HEIGHT) + 'px';
    div.style.height = (duration * SLOT_HEIGHT - 2) + 'px';
    dayColumns[day].appendChild(div);
}

function updateQueueUI() {
    const lvl = LEVELS[currentDay];
    reqCountEl.textContent = queue.length;
    let pct = (queue.length / lvl.maxQ) * 100;
    failBarEl.style.width = pct + '%';
    if (pct > 80) failBarEl.style.backgroundColor = 'red';
    else failBarEl.style.backgroundColor = '#ea4335';
}

function flashError(el) {
    el.style.backgroundColor = '#ffebee';
    setTimeout(() => el.style.backgroundColor = '', 200);
}

function gameOver() {
    isPlaying = false;
    alert(`¡AGENDA COLAPSADA! Te despidieron el ${LEVELS[currentDay].name}.`);
    location.reload();
}

function addXP(amount) {
    let current = parseInt(localStorage.getItem('vicoTotalXP')) || 0;
    localStorage.setItem('vicoTotalXP', current + amount);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        isBossMode = !isBossMode;
        bossOverlay.classList.toggle('hidden');
    }
});

init();
