const desktop = document.getElementById('desktop-area');
const scoreEl = document.getElementById('score-val');
const timerEl = document.getElementById('timer-val');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

let score = parseInt(localStorage.getItem('vico_score_tabs')) || 0;
let timeRemaining = 60;
let baseSpawnInterval = 1200; // starts slow
let gameInterval;
let spawnTimer;
let isPlaying = true;

function addCoins(amount) {
    let coins = parseInt(localStorage.getItem('office_coins')) || 0;
    coins += amount;
    localStorage.setItem('office_coins', coins);
    if (window.parent && window.parent.document.getElementById('global-coins')) {
        window.parent.document.getElementById('global-coins').textContent = coins;
    }
}

const adContents = [
    { title: "¡ADVERTENCIA!", text: "Tu PC está infectada con 342 virus.", emoji: "⚠️", class: "shake" },
    { title: "FELICIDADES", text: "¡Eres el visitante 1,000,000! Reclama tu iPhone.", emoji: "🎁", class: "" },
    { title: "DESCARGAR RAM", text: "Haz clic aquí para descargar 16GB de RAM DDR4 gratis.", emoji: "💾", class: "" },
    { title: "SOLTERAS CERCA", text: "Hay 5 solteras en tu área esperando.", emoji: "🔥", class: "fast-move" },
    { title: "ACTUALIZACIÓN", text: "Flash Player necesita una actualización crítica.", emoji: "🔄", class: "" },
    { title: "ERROR DE SISTEMA", text: "Fallo de registro 0x000F837. Clic para reparar.", emoji: "🛑", class: "shake" }
];

function initGame() {
    scoreEl.textContent = score;
    gameOverScreen.classList.add('hidden');
    desktop.innerHTML = '';
    timeRemaining = 60;
    baseSpawnInterval = 1500;
    isPlaying = true;

    updateClock();
    
    // Spawn initial popups
    spawnPopup();
    spawnPopup();
    
    startGameLoop();
}

function updateClock() {
    let m = Math.floor(timeRemaining / 60);
    let s = timeRemaining % 60;
    timerEl.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function startGameLoop() {
    if (gameInterval) clearInterval(gameInterval);
    if (spawnTimer) clearTimeout(spawnTimer);
    
    gameInterval = setInterval(() => {
        if (!isPlaying || !document.getElementById('boss-overlay').classList.contains('hidden')) return;
        
        timeRemaining--;
        updateClock();
        
        if (timeRemaining <= 0) {
            endGame();
        }
    }, 1000);

    scheduleNextSpawn();
}

function scheduleNextSpawn() {
    if (!isPlaying) return;
    
    // Increase difficulty as time drops
    let delay = baseSpawnInterval * (Math.max(0.3, timeRemaining / 60));
    
    spawnTimer = setTimeout(() => {
        if (isPlaying && document.getElementById('boss-overlay').classList.contains('hidden')) {
            spawnPopup();
        }
        scheduleNextSpawn();
    }, delay);
}

function spawnPopup() {
    // If there are too many popups, crash early!
    if (desktop.children.length > 25) {
        endGame();
        return;
    }

    const popupData = adContents[Math.floor(Math.random() * adContents.length)];
    const el = document.createElement('div');
    el.className = `popup-window ${popupData.class}`;
    
    // Random position avoiding edges
    const maxLeft = window.innerWidth - 350;
    const maxTop = window.innerHeight - 250;
    let rx = Math.max(0, Math.floor(Math.random() * maxLeft));
    let ry = Math.max(0, Math.floor(Math.random() * maxTop));
    
    el.style.left = `${rx}px`;
    el.style.top = `${ry}px`;
    el.style.zIndex = Math.floor(Math.random() * 1000); // Random stacking

    el.innerHTML = `
        <div class="popup-header">
            <span>Microsoft Internet Explorer</span>
            <button class="close-btn">X</button>
        </div>
        <div class="popup-body">
            <h3>${popupData.emoji} ${popupData.title}</h3>
            <p>${popupData.text}</p>
        </div>
    `;

    // The safe close button
    const closeBtn = el.querySelector('.close-btn');
    closeBtn.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        el.remove();
        score += 5; // 5 MB freed
        addCoins(1);
        scoreEl.textContent = score;
        localStorage.setItem('vico_score_tabs', score);
    });

    // The TRAP: clicking the body
    const bodyEl = el.querySelector('.popup-body');
    bodyEl.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        // Spawns 2 exact copies of itself as penalty!
        spawnPopup();
        spawnPopup();
        score = Math.max(0, score - 15);
        scoreEl.textContent = score;
    });

    // Evasive maneuver (fast-move class)
    if (popupData.class === 'fast-move') {
        el.addEventListener('mouseenter', () => {
            let nx = Math.max(0, Math.floor(Math.random() * maxLeft));
            let ny = Math.max(0, Math.floor(Math.random() * maxTop));
            el.style.left = `${nx}px`;
            el.style.top = `${ny}px`;
        });
    }

    desktop.appendChild(el);
}

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    clearTimeout(spawnTimer);
    
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

restartBtn.addEventListener('click', initGame);

// Boss Key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('boss-overlay').classList.toggle('hidden');
    }
});

// Start
initGame();
