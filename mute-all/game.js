const gridContainer = document.getElementById('grid-container');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const attentionFillEl = document.getElementById('attention-fill');
const bossOverlay = document.getElementById('boss-overlay');
const btnMic = document.getElementById('btn-mic');

// Config
const PARTICIPANTS = ["Juan", "Ana", "Pedro", "Maria", "Luisa", "Carlos", "Sofia", "Miguel", "Lucia"];
const AVATARS = ["👨‍💼", "👩‍💼", "🧔", "👱‍♀️", "👵", "👴", "👧", "👦", "👩‍🦱"];

// State
let users = []; // Objects { id, el, state: 'normal'|'noisy'|'sleeping', timer }
let score = 0;
let isPlaying = true;
let isBossMode = false;
let gameTime = 0;
let attention = 100;
let bossSpeaking = false;

function init() {
    createGrid();
    requestAnimationFrame(loop);

    // Boss mechanic trigger
    setInterval(() => {
        if (!isPlaying || isBossMode) return;
        if (Math.random() < 0.2) startBossSpeech();
    }, 5000);
}

function createGrid() {
    gridContainer.innerHTML = '';
    users = [];

    // 9 slots
    for (let i = 0; i < 9; i++) {
        const user = {
            id: i,
            name: PARTICIPANTS[i],
            avatar: AVATARS[i],
            state: 'normal',
            el: null
        };

        const el = document.createElement('div');
        el.className = 'video-feed';
        el.dataset.id = i;
        el.innerHTML = `
            <div class="avatar">${user.avatar}</div>
            <div class="name-tag">${user.name}</div>
            <div class="status-icon">🔊</div>
            <div class="mute-overlay">MUTED</div>
        `;

        el.addEventListener('click', () => handleInteraction(user));

        user.el = el;
        users.push(user);
        gridContainer.appendChild(el);
    }
}

function loop(timestamp) {
    if (!isPlaying) return;

    // Game Timer
    // Roughly 60fps
    if (!isBossMode) {
        gameTime += 16;
        updateTimer();

        // Random events
        if (Math.random() < 0.01) triggerEvent();

        // Attention decay
        if (bossSpeaking) {
            attention -= 0.2;
            if (attention <= 0) gameOver("El jefe notó que no estabas prestando atención.");
        } else {
            if (attention < 100) attention += 0.05;
        }
        updateUI();
    }

    requestAnimationFrame(loop);
}

function triggerEvent() {
    // Pick random normal user
    const normalUsers = users.filter(u => u.state === 'normal');
    if (normalUsers.length === 0) return;

    const target = normalUsers[Math.floor(Math.random() * normalUsers.length)];
    const type = Math.random() < 0.5 ? 'noisy' : 'sleeping';

    target.state = type;

    if (type === 'noisy') {
        target.el.classList.add('noisy');
        target.el.querySelector('.status-icon').style.display = 'block';
    } else {
        target.el.classList.add('sleeping');
        target.el.querySelector('.avatar').textContent = '😴';
    }

    // Auto-fail if not fixed in time?
    setTimeout(() => {
        if (target.state === type && isPlaying) {
            // Failed to fix
            score -= 10;
            flashDamage();
            // Reset state anyway to keep flow
            resetUser(target);
        }
    }, 4000);
}

function handleInteraction(user) {
    if (user.state === 'normal') return;

    if (user.state === 'noisy') {
        // Mute them
        score += 20;
        addXP(2);
        showFloatText("🔇 MUTED", user.el);
        resetUser(user);
        // Visual mute effect
        user.el.classList.add('muted');
        setTimeout(() => user.el.classList.remove('muted'), 1000); // unmute after a bit
    } else if (user.state === 'sleeping') {
        // Wake up
        score += 20;
        addXP(2);
        showFloatText("⏰ WAKE UP!", user.el);
        resetUser(user);
    }

    checkWin();
}

function resetUser(user) {
    user.state = 'normal';
    user.el.className = 'video-feed';
    user.el.querySelector('.status-icon').style.display = 'none';
    user.el.querySelector('.avatar').textContent = user.avatar;
}

function startBossSpeech() {
    bossSpeaking = true;
    btnMic.classList.add('alert');
    // Maybe show a popup "JEFE HABLANDO..."
    const notif = document.createElement('div');
    notif.textContent = "📢 JEFE HABLANDO... (Presiona ESPACIO para asentir)";
    notif.style.position = 'absolute';
    notif.style.top = '60px';
    notif.style.width = '100%';
    notif.style.textAlign = 'center';
    notif.style.background = '#fbc02d';
    notif.style.color = 'black';
    notif.style.padding = '5px';
    notif.style.zIndex = 100;
    notif.id = 'boss-notif';
    document.querySelector('.app-frame').appendChild(notif);

    setTimeout(() => {
        bossSpeaking = false;
        btnMic.classList.remove('alert');
        const n = document.getElementById('boss-notif');
        if (n) n.remove();
    }, 5000);
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && bossSpeaking) {
        // Nodding
        attention = Math.min(attention + 5, 100);
        showFloatText("👍 Asintiendo...", document.body); // Abstract pos
    }

    if (e.key === 'Escape') {
        isBossMode = !isBossMode;
        bossOverlay.classList.toggle('hidden');
    }
});

function updateTimer() {
    const totalSeconds = Math.floor(gameTime / 1000);
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
}

function updateUI() {
    scoreEl.textContent = score;
    attentionFillEl.style.width = attention + '%';
    if (attention < 30) attentionFillEl.style.backgroundColor = 'red';
    else attentionFillEl.style.backgroundColor = '#4caf50';
}

function flashDamage() {
    document.body.style.backgroundColor = '#5a0000';
    setTimeout(() => document.body.style.backgroundColor = '#1f1f1f', 100);
}

function showFloatText(text, parent) {
    // simplified
}

function checkWin() {
    if (score >= 500) {
        isPlaying = false;
        alert("¡REUNIÓN FINALIZADA! 🎉\nHas mantenido el orden corporativo impecablemente.");
        location.reload();
    }
}

function gameOver(reason) {
    isPlaying = false;
    alert("¡DESPEDIDO! " + reason);
    location.reload();
}

function addXP(amount) {
    let current = parseInt(localStorage.getItem('vicoTotalXP')) || 0;
    localStorage.setItem('vicoTotalXP', current + amount);
}

init();
