const gridEl = document.getElementById('grid');
const resourceValEl = document.getElementById('resource-val');
const installBar = document.getElementById('install-progress');
const installPercent = document.getElementById('install-percent');
const bsodOverlay = document.getElementById('bsod-overlay');

// --- Game State ---
let resources = 300;
let progress = 0; // 0 to 100
let isPlaying = true;
let isBossMode = false;

// Grid 8x8
const GRID_SIZE = 8;
const CELL_SIZE = 50; // px (css depends on container size)

// Path (Simple S shape or diagonal for now)
// 0,0 -> 0,1 -> 1,1 -> ... 7,7
const PATH = [
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 },
    { x: 1, y: 2 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 1, y: 4 },
    { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 3 }, { x: 4, y: 2 },
    { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 },
    { x: 7, y: 5 }, { x: 6, y: 5 }, { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 },
    { x: 6, y: 7 }, { x: 7, y: 7 }
];

let selectedTool = 'firewall';
const TOOLS = {
    'firewall': { cost: 50, icon: '🧱', range: 2, damage: 10, rate: 1000, type: 'tower' },
    'antivirus': { cost: 100, icon: '💉', range: 3, damage: 30, rate: 800, type: 'tower' },
    'quarantine': { cost: 150, icon: '📦', range: 1, damage: 5, rate: 200, type: 'slown' }
};

let towers = []; // {x, y, type, lastShot}
let enemies = []; // {pathIndex, progress (0-1), hp, el}
let projectiles = [];

// Init
function init() {
    renderGrid();
    requestAnimationFrame(loop);
    setInterval(updateProgress, 1000);
}

function renderGrid() {
    gridEl.innerHTML = '';
    // Draw visual path indicators?

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;

            // Check if path
            if (isPath(x, y)) {
                cell.style.backgroundColor = "#e6e6e6";
                // Add small dot for path?
            } else {
                cell.onclick = () => placeTower(x, y, cell);
            }
            gridEl.appendChild(cell);
        }
    }
}

function isPath(x, y) {
    return PATH.some(p => p.x === x && p.y === y);
}

function selectTool(tool) {
    selectedTool = tool;
    document.querySelectorAll('.tool-card').forEach(el => el.classList.remove('selected'));
    document.getElementById(`tool-${tool}`).classList.add('selected');
}

function placeTower(x, y, cell) {
    const tool = TOOLS[selectedTool];
    if (resources >= tool.cost && !towers.find(t => t.x === x && t.y === y)) {
        resources -= tool.cost;
        updateResources();

        towers.push({
            x, y,
            type: selectedTool,
            lastShot: 0
        });

        cell.innerHTML = tool.icon;
        cell.classList.add('has-tower');
    } else {
        // Error sound/flash
    }
}

function updateResources() {
    resourceValEl.textContent = resources;
}

// Loop
let lastTime = 0;
let spawnTimer = 0;

function loop(timestamp) {
    if (!isPlaying) return;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (!isBossMode) {
        updateGame(dt, timestamp);
    }

    requestAnimationFrame(loop);
}

function updateGame(dt, now) {
    // Spawn Enemies
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
        spawnEnemy();
        spawnTimer = Math.max(0.5, 3 - (progress / 20)); // Faster as progress increases
    }

    // Move Enemies
    enemies.forEach((en, idx) => {
        en.progress += en.speed * dt;
        if (en.progress >= 1) {
            en.pathIndex++;
            en.progress = 0;
            if (en.pathIndex >= PATH.length - 1) {
                // Reached End -> Damage System (Reduce install progress?)
                progress -= 5;
                if (progress < 0) progress = 0;
                updateUIProgress();
                removeEnemy(en);
                return;
            }
        }

        // Update DOM Position
        const p1 = PATH[en.pathIndex];
        const p2 = PATH[en.pathIndex + 1];
        if (p2) {
            const curX = p1.x + (p2.x - p1.x) * en.progress;
            const curY = p1.y + (p2.y - p1.y) * en.progress;
            en.el.style.left = (curX * 50 + 10) + 'px'; // 50 is cell size (approx in grid)
            en.el.style.top = (curY * 50 + 10) + 'px';

            en.x = curX;
            en.y = curY;
        }
    });

    // Towers Shoot
    towers.forEach(tow => {
        if (now - tow.lastShot > TOOLS[tow.type].rate) {
            const target = findTarget(tow);
            if (target) {
                shoot(tow, target);
                tow.lastShot = now;
            }
        }
    });
}

function spawnEnemy() {
    const el = document.createElement('div');
    el.className = 'enemy';
    el.innerHTML = '👾'; // virus icon
    gridEl.appendChild(el);

    enemies.push({
        pathIndex: 0,
        progress: 0,
        speed: 1 + Math.random(), // Speed varies
        hp: 30 + (progress * 2),
        el: el,
        x: PATH[0].x,
        y: PATH[0].y
    });
}

function findTarget(tower) {
    const range = TOOLS[tower.type].range;
    for (let en of enemies) {
        const dist = Math.sqrt(Math.pow(en.x - tower.x, 2) + Math.pow(en.y - tower.y, 2));
        if (dist <= range) return en;
    }
    return null;
}

function shoot(tower, enemy) {
    const stats = TOOLS[tower.type];

    // Visual Projectile (Simplified CSS flash on enemy for now or line)
    // createProjectile(tower, enemy);

    enemy.hp -= stats.damage;
    if (enemy.hp <= 0) {
        resources += 15; // Increased from 10
        updateResources();
        removeEnemy(enemy);

        // Progress Bonus for Kill
        progress += 2;
        updateUIProgress();

        // Add XP
        let currentXP = parseInt(localStorage.getItem('vicoTotalXP')) || 0;
        localStorage.setItem('vicoTotalXP', currentXP + 1);
    } else {
        // Hit effect
        enemy.el.style.transform = 'scale(1.2)';
        setTimeout(() => enemy.el.style.transform = 'scale(1)', 100);
    }
}

function removeEnemy(en) {
    en.el.remove();
    enemies = enemies.filter(e => e !== en);
}

function updateProgress() {
    if (!isPlaying || isBossMode) return;

    // Always update progress, even if overrun, but slower if overrun
    // Or just faster base rate
    let rate = 2; // Base 2% per second
    if (enemies.length >= 5) rate = 0.5; // Slow down if overwhelmed, don't stop

    progress += rate;

    if (progress >= 100) {
        progress = 100;
        // WIN
        alert("¡Actualización Completada! Sistema Seguro.");
        // Reset
        progress = 0;
        enemies.forEach(e => e.el.remove());
        enemies = [];
    }
    updateUIProgress();
}

function updateUIProgress() {
    installBar.style.width = progress + "%";
    installPercent.textContent = Math.floor(progress) + "%";
}

// Boss Key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleBossMode();
});

function toggleBossMode() {
    isBossMode = !isBossMode;
    if (isBossMode) {
        bsodOverlay.classList.remove('hidden');
    } else {
        bsodOverlay.classList.add('hidden');
    }
}

// Start
init();
