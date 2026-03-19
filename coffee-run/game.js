const gridEl = document.getElementById('game-grid');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const bossOverlay = document.getElementById('boss-overlay');

const COLS = 20;
const ROWS = 15;
const CELL_SIZE = 30;

// LEVELS
const LEVELS = [
    // Level 1: Simple
    [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
        [1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1],
        [1, 0, 1, 0, 1, 1, 0, 1, 1, 9, 9, 1, 1, 0, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 9, 9, 9, 9, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 1, 9, 9, 9, 9, 1, 1, 0, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
        [1, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    // Level 2: More Walls
    [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 2, 1],
        [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 0, 1, 1, 0, 1, 9, 9, 9, 9, 1, 0, 1, 1, 0, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
        [1, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1],
        [1, 2, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    // Level 3: Corridors
    [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
        [1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 0, 1, 1, 1, 9, 9, 9, 9, 1, 1, 1, 0, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
        [1, 0, 1, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    // Level 4: Maze
    [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
        [1, 0, 0, 0, 2, 0, 0, 0, 9, 9, 9, 9, 0, 0, 2, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 0, 9, 9, 9, 9, 0, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1],
        [1, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    // Level 5: Open & Dangerous
    [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2, 1],
        [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
        [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 0, 9, 9, 9, 9, 0, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 0, 9, 9, 9, 9, 0, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
        [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
];

// State
let currentLevel = 0;
let player = { x: 1, y: 1, dir: { x: 0, y: 0 }, nextDir: { x: 0, y: 0 } };
let enemies = [];
let beans = [];
let powerups = [];
let score = 0;
let totalBeans = 0;
let isPlaying = false;
let isBossMode = false;
let gameLoopId;
let scaredTimer = 0;

// Init
function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    currentLevel = 0;
    loadLevel(currentLevel);
    isPlaying = true;
    gameLoopId = setInterval(gameLoop, 150);
}

function loadLevel(lvlIdx) {
    if (lvlIdx >= LEVELS.length) {
        winGameFinal();
        return;
    }

    levelEl.textContent = lvlIdx + 1;
    player = { x: 1, y: 1, dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 } };

    // Add enemies based on level
    enemies = [
        { x: 9, y: 5, color: '#e74c3c', dir: { x: 0, y: -1 }, name: 'HR' },
        { x: 10, y: 5, color: '#9b59b6', dir: { x: 0, y: 1 }, name: 'Marketing' },
        { x: 9, y: 6, color: '#e67e22', dir: { x: -1, y: 0 }, name: 'Sales' }
    ];
    // Add extra enemies for hard levels
    if (lvlIdx >= 2) {
        enemies.push({ x: 10, y: 6, color: '#2ecc71', dir: { x: 1, y: 0 }, name: 'Intern' });
    }
    if (lvlIdx >= 4) {
        enemies.push({ x: 9, y: 7, color: '#f1c40f', dir: { x: -1, y: 0 }, name: 'Manager' });
    }

    // Parse map
    beans = [];
    powerups = [];
    totalBeans = 0;

    gridEl.innerHTML = '';

    const map = LEVELS[lvlIdx];
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${x}-${y}`;

            const type = map[y][x];
            if (type === 1) {
                cell.classList.add('wall');
            } else {
                cell.classList.add('floor');
                if (type === 0) {
                    const bean = document.createElement('div');
                    bean.className = 'bean';
                    bean.textContent = '•';
                    cell.appendChild(bean);
                    beans.push(`${x},${y}`);
                } else if (type === 2) {
                    const pup = document.createElement('div');
                    pup.className = 'powerup';
                    pup.textContent = '☕';
                    cell.appendChild(pup);
                    powerups.push(`${x},${y}`);
                }
            }
            gridEl.appendChild(cell);
        }
    }

    totalBeans = beans.length;
    scoreEl.textContent = '0';

    createEntityEl('player', '👷');
    enemies.forEach((e, i) => createEntityEl(`enemy-${i}`, '👔'));

    updateView();
}

function createEntityEl(id, icon) {
    const el = document.createElement('div');
    el.id = id;
    el.className = id.includes('player') ? 'player cell' : 'enemy cell';
    el.textContent = icon;
    el.style.position = 'absolute';
    el.style.top = '0';
    el.style.left = '0';
    gridEl.appendChild(el);
}

function gameLoop() {
    if (!isPlaying || isBossMode) return;

    // Move Player
    if (canMove(player.x + player.nextDir.x, player.y + player.nextDir.y)) {
        player.dir = player.nextDir;
    }

    if (canMove(player.x + player.dir.x, player.y + player.dir.y)) {
        player.x += player.dir.x;
        player.y += player.dir.y;
    }

    // Move Enemies
    enemies.forEach(e => moveEnemy(e));

    // Collisions & Pickups
    checkPickups();
    checkCollisions();

    updateView();

    if (scaredTimer > 0) scaredTimer--;
}

function moveEnemy(e) {
    const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
    let valid = dirs.filter(d => canMove(e.x + d.x, e.y + d.y));

    if (valid.length > 0) {
        if (scaredTimer === 0 && Math.random() < 0.5) {
            valid.sort((a, b) => {
                const distA = Math.abs((e.x + a.x) - player.x) + Math.abs((e.y + a.y) - player.y);
                const distB = Math.abs((e.x + b.x) - player.x) + Math.abs((e.y + b.y) - player.y);
                return distA - distB;
            });
        } else if (scaredTimer > 0) {
            valid.sort((a, b) => {
                const distA = Math.abs((e.x + a.x) - player.x) + Math.abs((e.y + a.y) - player.y);
                const distB = Math.abs((e.x + b.x) - player.x) + Math.abs((e.y + b.y) - player.y);
                return distB - distA;
            });
        }

        // Don't reverse immediately if possible (simple heuristic)
        // (Skipped for simplicity, randomness handles it mostly)

        let move = valid[0];
        if (Math.random() < 0.2 && valid.length > 1) {
            move = valid[Math.floor(Math.random() * valid.length)];
        }

        e.x += move.x;
        e.y += move.y;
    }
}

function canMove(x, y) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    return LEVELS[currentLevel][y][x] !== 1;
}

function checkPickups() {
    const key = `${player.x},${player.y}`;

    const beanIdx = beans.indexOf(key);
    if (beanIdx !== -1) {
        beans.splice(beanIdx, 1);
        const cell = document.getElementById(`cell-${player.x}-${player.y}`);
        const beanEl = cell.querySelector('.bean');
        if (beanEl) beanEl.remove();

        const collected = totalBeans - beans.length;
        scoreEl.textContent = Math.floor((collected / totalBeans) * 100);

        if (beans.length === 0) winLevel();
    }

    const pupIdx = powerups.indexOf(key);
    if (pupIdx !== -1) {
        powerups.splice(pupIdx, 1);
        const cell = document.getElementById(`cell-${player.x}-${player.y}`);
        const pupEl = cell.querySelector('.powerup');
        if (pupEl) pupEl.remove();
        activatePowerup();
    }
}

function activatePowerup() {
    scaredTimer = 50;
    document.querySelectorAll('.enemy').forEach(el => el.classList.add('scared'));
}

function checkCollisions() {
    enemies.forEach((e, i) => {
        if (e.x === player.x && e.y === player.y) {
            if (scaredTimer > 0) {
                e.x = 9; e.y = 5; // Respawn
            } else {
                gameOver();
            }
        }
    });
}

function updateView() {
    const pEl = document.getElementById('player');
    if (pEl) pEl.style.transform = `translate(${player.x * 30}px, ${player.y * 30}px)`;

    enemies.forEach((e, i) => {
        const eEl = document.getElementById(`enemy-${i}`);
        if (eEl) {
            eEl.style.transform = `translate(${e.x * 30}px, ${e.y * 30}px)`;
            if (scaredTimer > 0) eEl.classList.add('scared');
            else eEl.classList.remove('scared');
        }
    });
}

function gameOver() {
    isPlaying = false;
    clearInterval(gameLoopId);
    gameOverScreen.classList.remove('hidden');
    document.getElementById('go-msg').textContent = "Te han asignado más trabajo.";
}

function winLevel() {
    isPlaying = false;
    clearInterval(gameLoopId);

    if (currentLevel < LEVELS.length - 1) {
        currentLevel++;
        alert(`¡NIVEL ${currentLevel} COMPLETADO! La cafetera está en otro piso...`);
        loadLevel(currentLevel);
        isPlaying = true;
        gameLoopId = setInterval(gameLoop, 150);
    } else {
        winGameFinal();
    }
}

function winGameFinal() {
    isPlaying = false;
    clearInterval(gameLoopId);
    gameOverScreen.classList.remove('hidden');
    document.getElementById('go-title').textContent = "¡VICTORIA SUPREMA!";
    document.getElementById('go-msg').textContent = "Has sobrevivido a la semana completa.";
}

// Input and Boss Key
document.addEventListener('keydown', e => {
    // Boss Key
    if (e.key === 'Escape' || e.key.toLowerCase() === 'b') {
        isBossMode = !isBossMode;
        if (isBossMode) {
            bossOverlay.classList.remove('hidden');
            document.title = "Hoja de Cálculo - Gastos Q1";
        } else {
            bossOverlay.classList.add('hidden');
            document.title = "Coffee Run - Survival Monday";
        }
    }

    if (isBossMode) return;

    if (['ArrowUp', 'w', 'W'].includes(e.key)) player.nextDir = { x: 0, y: -1 };
    if (['ArrowDown', 's', 'S'].includes(e.key)) player.nextDir = { x: 0, y: 1 };
    if (['ArrowLeft', 'a', 'A'].includes(e.key)) player.nextDir = { x: -1, y: 0 };
    if (['ArrowRight', 'd', 'D'].includes(e.key)) player.nextDir = { x: 1, y: 0 };
});
