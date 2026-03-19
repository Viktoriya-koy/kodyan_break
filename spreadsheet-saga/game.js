document.addEventListener('DOMContentLoaded', () => {
    // Configuración del Juego
    const COLS = 20; // A-T
    const ROWS = 30;
    const START_BALANCE = 1000;

    const LEVELS = [
        { name: "Caja Chica", enemies: 15, dmg: 1.0, loot: 10, time: 40 },
        { name: "Nómina RRHH", enemies: 25, dmg: 1.2, loot: 8, time: 35 },
        { name: "Presupuesto IT", enemies: 40, dmg: 1.5, loot: 6, time: 30 },
        { name: "Inversiones", enemies: 60, dmg: 2.0, loot: 4, time: 25 },
        { name: "BALANCE FINAL", enemies: 100, dmg: 3.0, loot: 2, time: 45 } // Chaos
    ];

    // Estado
    const state = {
        player: { x: 0, y: 0 },
        balance: START_BALANCE,
        level: 0,
        enemies: [], // {x, y, val}
        loot: [],    // {x, y, val}
        goal: { x: COLS - 1, y: ROWS - 1 },
        isBossMode: false,
        gameOver: false,
        timeLeft: 30,
        timerInterval: null
    };

    // Referencias DOM
    const gridContainer = document.getElementById('grid-container');
    const colHeaders = document.getElementById('col-headers');
    const rowHeaders = document.getElementById('row-headers');
    const displayCell = document.getElementById('current-cell-display');
    const gameLog = document.getElementById('game-log');
    const playerHealthDisplay = document.getElementById('player-health');
    const bossOverlay = document.getElementById('boss-overlay');
    const sheetTabsContainer = document.querySelector('.sheet-tabs');
    const gameStatusDisplay = document.getElementById('game-status');

    // Inicializar Grid CSS en JS
    function initGridSystem() {
        gridContainer.style.gridTemplateColumns = `repeat(${COLS}, 80px)`;
        gridContainer.style.gridTemplateRows = `repeat(${ROWS}, 24px)`;
        colHeaders.style.gridTemplateColumns = `repeat(${COLS}, 80px)`;
        rowHeaders.style.gridTemplateRows = `repeat(${ROWS}, 24px)`;

        // Headers
        colHeaders.innerHTML = '';
        for (let i = 0; i < COLS; i++) {
            const h = document.createElement('div');
            h.className = 'col-header';
            h.textContent = String.fromCharCode(65 + i);
            colHeaders.appendChild(h);
        }

        rowHeaders.innerHTML = '';
        for (let i = 0; i < ROWS; i++) {
            const r = document.createElement('div');
            r.className = 'row-header';
            r.textContent = i + 1;
            rowHeaders.appendChild(r);
        }

        buildGridCells(); // Construir celdas iniciales
    }

    function buildGridCells() {
        gridContainer.innerHTML = ''; // Limpiar grid anterior
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = `cell-${x}-${y}`;
                // Decoración aleatoria
                if (Math.random() < 0.1) {
                    cell.textContent = Math.floor(Math.random() * 500) + 100;
                    cell.style.color = '#ccc';
                }
                gridContainer.appendChild(cell);
            }
        }
    }

    // Generar Entidades con Dificultad Escalable
    function spawnEntities() {
        state.enemies = [];
        state.loot = [];
        const lvlConfig = LEVELS[state.level];

        // Enemigos
        for (let i = 0; i < lvlConfig.enemies; i++) {
            const ex = Math.floor(Math.random() * COLS);
            const ey = Math.floor(Math.random() * ROWS);
            if ((ex === 0 && ey === 0) || (ex === state.goal.x && ey === state.goal.y)) continue;
            if (document.getElementById(`cell-${ex}-${ey}`).classList.contains('enemy')) continue;

            const baseDamage = Math.floor(Math.random() * 300) + 50;
            const finalDamage = Math.floor(baseDamage * lvlConfig.dmg);

            state.enemies.push({ x: ex, y: ey, val: -finalDamage });

            const cell = document.getElementById(`cell-${ex}-${ey}`);
            cell.textContent = -finalDamage;
            cell.classList.add('enemy');
            cell.style.color = ''; // Reset color decorativo
        }

        // Botín 
        for (let i = 0; i < lvlConfig.loot; i++) {
            const lx = Math.floor(Math.random() * COLS);
            const ly = Math.floor(Math.random() * ROWS);
            if ((lx === 0 && ly === 0) || (lx === state.goal.x && ly === state.goal.y)) continue;
            if (document.getElementById(`cell-${lx}-${ly}`).classList.contains('enemy')) continue;

            const heal = Math.floor(Math.random() * 200) + 50;
            state.loot.push({ x: lx, y: ly, val: heal });

            const cell = document.getElementById(`cell-${lx}-${ly}`);
            cell.textContent = heal;
            cell.classList.add('loot');
            cell.style.color = '';
        }

        // Meta siempre al final
        const goalCell = document.getElementById(`cell-${state.goal.x}-${state.goal.y}`);
        goalCell.textContent = "TOTAL";
        goalCell.classList.add('goal');
        goalCell.style.color = '';
    }

    function updatePlayerVisual() {
        document.querySelectorAll('.player').forEach(el => el.classList.remove('player'));
        const cell = document.getElementById(`cell-${state.player.x}-${state.player.y}`);
        if (cell) {
            cell.classList.add('player');
            cell.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
        const colChar = String.fromCharCode(65 + state.player.x);
        displayCell.textContent = `${colChar}${state.player.y + 1}`;
    }

    function updateTabs() {
        const currentParams = LEVELS[state.level];
        let html = '';

        LEVELS.forEach((l, idx) => {
            if (idx === state.level) {
                html += `<div class="sheet-tab active">${l.name}</div>`;
            } else if (idx < state.level) {
                html += `<div class="sheet-tab" style="color:#aaa">✅ ${l.name}</div>`;
            } else {
                html += `<div class="sheet-tab" style="color:#aaa">${l.name}</div>`;
            }
        });

        sheetTabsContainer.innerHTML = html;
        document.title = `${currentParams.name} - Excel`;
    }

    function log(msg) {
        gameLog.textContent = `= "${msg}"`;
    }

    function move(dx, dy) {
        if (state.gameOver || state.isBossMode) return;
        const nx = state.player.x + dx;
        const ny = state.player.y + dy;
        if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return;

        state.player.x = nx;
        state.player.y = ny;
        updatePlayerVisual();
        checkCollision(nx, ny);
    }

    function checkCollision(x, y) {
        // Enforce integer matching just in case
        const enemyIndex = state.enemies.findIndex(e => e.x === x && e.y === y);
        if (enemyIndex !== -1) {
            const dmg = state.enemies[enemyIndex].val;
            state.balance += dmg; // dmg is negative
            log(`ERROR DE CÁLCULO: ${dmg}`);
            state.enemies.splice(enemyIndex, 1);
            const cell = document.getElementById(`cell-${x}-${y}`);
            cell.textContent = "0.00";
            cell.classList.remove('enemy');
            playerHealthDisplay.style.color = 'red';
            setTimeout(() => playerHealthDisplay.style.color = '#666', 200);
        }

        const lootIndex = state.loot.findIndex(l => l.x === x && l.y === y);
        if (lootIndex !== -1) {
            const gain = state.loot[lootIndex].val;
            state.balance += gain;
            log(`AJUSTE POSITIVO: +${gain}`);
            state.loot.splice(lootIndex, 1);
            const cell = document.getElementById(`cell-${x}-${y}`);
            cell.textContent = "0.00";
            cell.classList.remove('loot');
        }

        // Meta alcanzada
        if (x === state.goal.x && y === state.goal.y) {
            nextLevel();
            return;
        }

        playerHealthDisplay.textContent = `Balance: $${state.balance}`;

        if (state.balance <= 0) {
            gameOver("QUIEBRA TÉCNICA - Fondos insuficientes");
        }
    }

    function startTimer() {
        if (state.timerInterval) clearInterval(state.timerInterval);
        state.timeLeft = LEVELS[state.level].time;
        updateTimerDisplay();

        state.timerInterval = setInterval(() => {
            if (!state.isBossMode && !state.gameOver) {
                state.timeLeft--;
                updateTimerDisplay();
                if (state.timeLeft <= 0) {
                    gameOver("TIMEOUT - No se pudo cerrar el mes a tiempo");
                }
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        if (gameStatusDisplay) {
            gameStatusDisplay.textContent = `Autoguardado en: ${state.timeLeft}s`;
            if (state.timeLeft <= 5) {
                gameStatusDisplay.style.color = 'red';
                gameStatusDisplay.style.fontWeight = 'bold';
            } else {
                gameStatusDisplay.style.color = '#666';
                gameStatusDisplay.style.fontWeight = 'normal';
            }
        }
    }

    function gameOver(reason) {
        state.gameOver = true;
        state.balance = 0;
        playerHealthDisplay.textContent = `Balance: $0 (QUIEBRA)`;
        if (state.timerInterval) clearInterval(state.timerInterval);
        log(`ERROR CRÍTICO: ${reason}`);
        alert(`GAME OVER\nCausa: ${reason}\nHoja actual: ${LEVELS[state.level].name}`);
        location.reload();
    }

    function nextLevel() {
        state.level++;
        if (state.level >= LEVELS.length) {
            winGame();
        } else {
            initLevel();
        }
    }

    function initLevel() {
        log(`HOJA COMPUTADA. Abriendo ${LEVELS[state.level].name}...`);
        // Reset player pos
        state.player.x = 0;
        state.player.y = 0;

        // Rebuild grid content
        buildGridCells();
        spawnEntities();
        updatePlayerVisual();
        updateTabs();
        startTimer(); // Reset timer for new level
    }

    function winGame() {
        state.gameOver = true;
        if (state.timerInterval) clearInterval(state.timerInterval);
        log("¡CIERRE ANUAL EXITOSO!");
        setTimeout(() => {
            alert("¡CONTADOR LEGENDARIO! 📊🏆\nHas balanceado todas las cuentas sin ir a la cárcel.");
            addXP(1000);
            location.reload();
        }, 1000);
    }

    function addXP(amount) {
        let current = parseInt(localStorage.getItem('vicoTotalXP')) || 0;
        localStorage.setItem('vicoTotalXP', current + amount);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            toggleBossMode();
            return;
        }
        if (state.isBossMode) return;

        switch (e.key) {
            case 'ArrowUp': move(0, -1); break;
            case 'ArrowDown': move(0, 1); break;
            case 'ArrowLeft': move(-1, 0); break;
            case 'ArrowRight': move(1, 0); break;
        }
    });

    function toggleBossMode() {
        state.isBossMode = !state.isBossMode;
        if (state.isBossMode) {
            bossOverlay.classList.remove('hidden');
        } else {
            bossOverlay.classList.add('hidden');
        }
    }

    // Init
    initGridSystem();
    spawnEntities();
    updatePlayerVisual();
    updateTabs();
    startTimer();
    log("Iniciando Sistema Contable v2.0...");
});
