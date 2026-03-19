document.addEventListener('DOMContentLoaded', () => {
    // --- Config ---
    const SPAWN_RATE_START = 2000;
    const MIN_SPAWN_RATE = 500;
    const MAX_ACTIVE_POPUPS = 10;

    // --- State ---
    let score = 0;
    let health = 100; // Represents Productivity. 0 = Fin del Juego.
    let activePopups = [];
    let gameInterval;
    let spawnTimer;
    let spawnRate = SPAWN_RATE_START;
    let startTime;
    let isBossMode = false;
    let isGameOver = false;

    // --- DOM ---
    const messageArea = document.getElementById('message-area');
    const healthDisplay = document.getElementById('health-display');
    const scoreDisplay = document.getElementById('score-display');
    const timeDisplay = document.getElementById('time-display');
    const gameOverModal = document.getElementById('game-over-modal');
    const finalScoreEl = document.getElementById('final-score');
    const bossOverlay = document.getElementById('boss-overlay');

    // --- Content Mockups ---
    const SENDERS = [
        { name: "Jefe", avatar: "#e01e5a", type: "urgent", text: "ASAP: Necesito el informe ya." },
        { name: "Marketing", avatar: "#ecb22e", type: "marketing", text: "¡Fiesta de fin de mes!" },
        { name: "IT Support", avatar: "#1164A3", type: "normal", text: "¿Reiniciaste el router?" },
        { name: "RRHH", avatar: "#2bac76", type: "normal", text: "Firmar actualización de póliza." },
        { name: "Pasante", avatar: "#666", type: "normal", text: "Borré la base de datos sin querer..." },
        { name: "Ventas", avatar: "#e01e5a", type: "normal", text: "Cliente nuevo esperando en línea." }
    ];

    // --- Init ---
    function initGame() {
        startTime = Date.now();
        gameInterval = setInterval(gameLoop, 100);
        scheduleNextSpawn();
    }

    // --- Game Logic ---
    function gameLoop() {
        if (isBossMode || isGameOver) return;

        updateTime();

        // Difficulty scaling: Spawn faster as score increases
        const speedUp = Math.min(1500, score * 10);
        spawnRate = Math.max(MIN_SPAWN_RATE, SPAWN_RATE_START - speedUp);

        // Passive health drain if too many popups
        if (activePopups.length > 5) {
            health -= 0.1;
            updateHUD();
        }

        if (health <= 0) endGame();
    }

    function scheduleNextSpawn() {
        if (isGameOver) return;

        spawnTimer = setTimeout(() => {
            if (!isBossMode && activePopups.length < MAX_ACTIVE_POPUPS) {
                spawnPopup();
            }
            scheduleNextSpawn();
        }, spawnRate);
    }

    function spawnPopup() {
        if (isBossMode) return;

        const data = SENDERS[Math.floor(Math.random() * SENDERS.length)];
        const id = Date.now() + Math.random();

        const el = document.createElement('div');
        el.className = `popup ${data.type}`;
        el.innerHTML = `
            <div class="popup-header">
                <span class="popup-user">${data.name}</span>
                <span class="popup-close">✕</span>
            </div>
            <div class="popup-body">${data.text}</div>
        `;

        // Random Position (within message-area)
        const areaRect = messageArea.getBoundingClientRect();
        // Padding to keep inside
        const maxX = areaRect.width - 320;
        const maxY = areaRect.height - 120;

        const x = Math.random() * maxX;
        const y = Math.random() * maxY;

        el.style.left = `${x}px`;
        el.style.top = `${y}px`;

        // Click Handler (Whack)
        el.onmousedown = (e) => {
            e.stopPropagation(); // prevent drag selection issues
            whackPopup(id, el, data.type);
        };

        messageArea.appendChild(el);
        activePopups.push({ id, el, createdAt: Date.now() });

        // Initial penalty for spawning (pressure)
        if (activePopups.length > 3) {
            // slight visuals indicating stress?
        }
    }

    function whackPopup(id, el, type) {
        if (isGameOver || isBossMode) return;

        // Remove from DOM
        el.style.transform = "scale(0.8)";
        el.style.opacity = "0";
        setTimeout(() => el.remove(), 100);

        // Remove from state
        activePopups = activePopups.filter(p => p.id !== id);

        // Score logic
        let points = 10;
        if (type === 'urgent') points = 20;
        if (type === 'marketing') points = 5;

        score += points;

        // Heal slightly
        health = Math.min(100, health + 2);

        updateHUD();
    }

    function updateTime() {
        const secondsElapsed = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        const secs = (secondsElapsed % 60).toString().padStart(2, '0');
        timeDisplay.textContent = `${mins}:${secs}`;
    }

    function updateHUD() {
        scoreDisplay.textContent = score;
        healthDisplay.textContent = Math.floor(health) + "%";
        healthDisplay.style.color = health < 30 ? "#e01e5a" : "#2bac76";
    }

    function endGame() {
        isGameOver = true;
        clearTimeout(spawnTimer);
        clearInterval(gameInterval);
        finalScoreEl.textContent = score;
        gameOverModal.classList.remove('hidden');
    }

    // --- Boss Key ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleBossMode();
        }
    });

    function toggleBossMode() {
        isBossMode = !isBossMode;
        if (isBossMode) {
            bossOverlay.classList.remove('hidden');
            document.title = "Manual_Procedimientos_Movilidad_2026.pdf";
            // Pause timer logically, though Date.now continue... 
            // In a simple game, we just pause the loop activity.
        } else {
            bossOverlay.classList.add('hidden');
            document.title = "Chat - CorpConnect";
        }
    }

    // Start
    initGame();
});
