const floorEl = document.getElementById('office-floor');
const startScreen = document.getElementById('start-overlay');
const endScreen = document.getElementById('end-overlay');
const dayDisplay = document.getElementById('day-display');
const statusDisplay = document.getElementById('status-display');
const chairsDisplay = document.getElementById('chairs-display');

// Config
const WIDTH = 800;
const HEIGHT = 600;
const PLAYER_SPEED = 5;

// Game State
let day = 1;
let phase = 'WAIT'; // WAIT, WANDER, SCRAMBLE, RESULT
let player = { x: 400, y: 300, vx: 0, vy: 0, el: null, seated: false };
let npcs = [];
let desks = [];
let obstacles = [];
let gameLoopId;
let roundTimer = 0;

// Levels Config
const LEVELS = [
    { name: "Lunes: La Calma", npcCount: 5, npcSpeed: 1.5, obstacles: 0, removedChairs: 1 },
    { name: "Martes: Café Doble", npcCount: 8, npcSpeed: 2.5, obstacles: 3, removedChairs: 2 },
    { name: "Miércoles: Bloqueo", npcCount: 12, npcSpeed: 3.2, obstacles: 5, removedChairs: 3 },
    { name: "Jueves: Agile", npcCount: 15, npcSpeed: 4.0, obstacles: 6, removedChairs: 4 },
    { name: "Viernes: Hunger Games", npcCount: 20, npcSpeed: 5.0, obstacles: 8, removedChairs: 6 }
];

function startGame() {
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    day = 1;
    startRound();
}

function startRound() {
    if (day > LEVELS.length) {
        winGame();
        return;
    }

    const lvl = LEVELS[day - 1];
    dayDisplay.textContent = day;
    statusDisplay.textContent = "☕ Descanso (Deambula)";
    statusDisplay.style.color = '#f1c40f'; // Yellow

    // Reset Entities
    floorEl.innerHTML = '';
    npcs = [];
    desks = [];
    obstacles = [];
    player.seated = false;
    player.el = createDiv('player entity', '👷');
    // Player spawned LATER to check obstacles

    // Spawn Obstacles
    for (let i = 0; i < lvl.obstacles; i++) {
        const obs = {
            x: Math.random() * (WIDTH - 60),
            y: Math.random() * (HEIGHT - 60),
            w: 40 + Math.random() * 60,
            h: 40 + Math.random() * 60,
            el: null
        };
        obs.el = createDiv('obstacle', '');
        obs.el.style.width = obs.w + 'px';
        obs.el.style.height = obs.h + 'px';
        obs.el.style.left = obs.x + 'px';
        obs.el.style.top = obs.y + 'px';
        floorEl.appendChild(obs.el);
        obstacles.push(obs);
    }

    // Spawn Player Safe (Now that obstacles exist)
    spawnSafe(player);

    // Spawn Desks
    const totalPeople = lvl.npcCount + 1;
    const totalDesks = totalPeople - (lvl.removedChairs || 1);
    chairsDisplay.textContent = `0/${totalDesks}`;

    for (let i = 0; i < totalDesks; i++) {
        const desk = { x: 0, y: 0, w: 40, h: 40, taken: false, el: createDiv('desk', '') };
        spawnSafe(desk);
        desks.push(desk);
    }

    // Spawn NPCs
    for (let i = 0; i < lvl.npcCount; i++) {
        const npc = {
            x: 0, y: 0,
            vx: 0, vy: 0,
            speed: lvl.npcSpeed,
            target: null,
            seated: false,
            el: createDiv('npc entity', '👔')
        };
        spawnSafe(npc);
        npcs.push(npc);
    }

    phase = 'WANDER';
    roundTimer = 300 + Math.random() * 300; // Random time before alarm

    if (gameLoopId) clearInterval(gameLoopId);
    gameLoopId = setInterval(gameLoop, 20); // 50fps
}

function spawnSafe(item) {
    let safe = false;
    let attempts = 0;
    while (!safe && attempts < 2000) {
        attempts++;
        item.x = Math.random() * (WIDTH - (item.w || 30));
        item.y = Math.random() * (HEIGHT - (item.h || 30));

        // Check collision with obstacles (Buffer 5px)
        let collides = obstacles.some(obs => rectIntersect(
            { x: item.x - 5, y: item.y - 5, w: (item.w || 30) + 10, h: (item.h || 30) + 10 },
            obs
        ));

        // Check collision with other desks
        if (!collides) {
            collides = desks.some(d => {
                if (d === item) return false; // Self
                const dist = Math.hypot(d.x - item.x, d.y - item.y);
                return dist < 60;
            });
        }

        // Check collision with NPCs
        if (!collides) {
            collides = npcs.some(n => {
                if (n === item) return false;
                const dist = Math.hypot(n.x - item.x, n.y - item.y);
                return dist < 40;
            });
        }

        // Check collision with Player (if item is NOT player)
        if (!collides && player.el && item !== player) {
            const dist = Math.hypot(player.x - item.x, player.y - item.y);
            if (dist < 60) collides = true;
        }

        if (!collides) safe = true;
    }

    if (!safe) {
        console.warn("Spawn failed after 2000 attempts. Forcing random position.", item);
        item.x = Math.random() * (WIDTH - 50);
        item.y = Math.random() * (HEIGHT - 50);
    }

    // Use transform for positioning to be consistent with updateEl
    item.el.style.transform = `translate(${item.x}px, ${item.y}px)`;
    floorEl.appendChild(item.el);
}

function createDiv(cls, content) {
    const div = document.createElement('div');
    div.className = cls;
    div.textContent = content;
    return div;
}

function spawnEntity(ent) {
    ent.x = Math.random() * (WIDTH - 30);
    ent.y = Math.random() * (HEIGHT - 30);
    floorEl.appendChild(ent.el);
}

function updateNPC(npc) {
    if (npc.seated) return;

    if (phase === 'WANDER') {
        // Random drift
        if (Math.random() < 0.05) {
            const angle = Math.random() * Math.PI * 2;
            npc.vx = Math.cos(angle) * (npc.speed * 0.5);
            npc.vy = Math.sin(angle) * (npc.speed * 0.5);
        }
    } else if (phase === 'SCRAMBLE') {
        // Seek nearest free desk
        let target = null;
        let minDist = Infinity;

        desks.forEach(d => {
            if (!d.taken) {
                const dist = Math.hypot(d.x - npc.x, d.y - npc.y);
                if (dist < minDist) {
                    minDist = dist;
                    target = d;
                }
            }
        });

        if (target) {
            const angle = Math.atan2(target.y - npc.y, target.x - npc.x);
            npc.vx = Math.cos(angle) * npc.speed;
            npc.vy = Math.sin(angle) * npc.speed;
        } else {
            npc.vx = 0; npc.vy = 0;
        }
    }

    // Move X
    let nx = npc.x + npc.vx;
    // Check bounds and obstacles for X
    if (nx > 0 && nx < WIDTH - 30) {
        if (!checkObstacleCol(nx, npc.y)) {
            npc.x = nx;
        } else {
            npc.vx *= -1; // Simple bounce
        }
    } else {
        npc.vx *= -1;
    }

    // Move Y
    let ny = npc.y + npc.vy;
    // Check bounds and obstacles for Y
    if (ny > 0 && ny < HEIGHT - 30) {
        if (!checkObstacleCol(npc.x, ny)) {
            npc.y = ny;
        } else {
            npc.vy *= -1;
        }
    } else {
        npc.vy *= -1;
    }

    updateEl(npc);
}

function spawnSafe(item) {
    let safe = false;
    let attempts = 0;
    while (!safe && attempts < 2000) {
        attempts++;
        item.x = Math.random() * (WIDTH - (item.w || 30));
        item.y = Math.random() * (HEIGHT - (item.h || 30));

        // Check collision with obstacles (Buffer 5px)
        let collides = obstacles.some(obs => rectIntersect(
            { x: item.x - 5, y: item.y - 5, w: (item.w || 30) + 10, h: (item.h || 30) + 10 },
            obs
        ));

        // Check collision with other desks 
        if (!collides) {
            collides = desks.some(d => {
                if (d === item) return false; // Self
                const dist = Math.hypot(d.x - item.x, d.y - item.y);
                return dist < 60;
            });
        }

        // Check collision with NPCs (Prevent spawn overlap)
        if (!collides) {
            collides = npcs.some(n => {
                if (n === item) return false;
                const dist = Math.hypot(n.x - item.x, n.y - item.y);
                return dist < 40;
            });
        }

        // Check collision with Player
        if (!collides && player.el) {
            const dist = Math.hypot(player.x - item.x, player.y - item.y);
            if (dist < 60) collides = true;
        }

        if (!collides) safe = true;
    }

    if (!safe) {
        console.warn("Spawn failed after 2000 attempts. Forcing random position.", item);
        item.x = Math.random() * (WIDTH - 50);
        item.y = Math.random() * (HEIGHT - 50);
    }

    // Use transform for positioning to be consistent with updateEl
    item.el.style.transform = `translate(${item.x}px, ${item.y}px)`;
    floorEl.appendChild(item.el);
}

const bossOverlay = document.getElementById('boss-overlay');
let isBossMode = false;

function gameLoop() {
    if (phase === 'RESULT' || isBossMode) return;

    // Movement Player
    if (!player.seated) {
        let nx = player.x + player.vx;
        let ny = player.y + player.vy;

        // Bounds
        nx = Math.max(0, Math.min(WIDTH - 30, nx));
        ny = Math.max(0, Math.min(HEIGHT - 30, ny));

        // Obstacles
        if (!checkObstacleCol(nx, ny)) {
            player.x = nx;
            player.y = ny;
        }
        updateEl(player);
    }

    // Movement NPCs
    npcs.forEach(npc => updateNPC(npc));

    // Phase Logic
    if (phase === 'WANDER') {
        roundTimer--;
        if (roundTimer <= 0) {
            triigerAlarm();
        }
    } else if (phase === 'SCRAMBLE') {
        // Checking collision with desks
        checkSeat(player);
        npcs.forEach(npc => checkSeat(npc));

        // Check End Condition
        const freeDesks = desks.filter(d => !d.taken).length;
        if (freeDesks === 0) {
            endRound();
        }
    }
}

function updateNPC(npc) {
    if (npc.seated) return;

    // Initialize timers if needed
    if (!npc.stuckTimer) npc.stuckTimer = 0;
    if (!npc.unstickTimer) npc.unstickTimer = 0;

    // Phase Logic
    if (npc.unstickTimer > 0) {
        // Unsticking: Keep moving in random direction
        npc.unstickTimer--;
    } else if (phase === 'WANDER') {
        // Random drift
        if (Math.random() < 0.05) {
            const angle = Math.random() * Math.PI * 2;
            npc.vx = Math.cos(angle) * (npc.speed * 0.5);
            npc.vy = Math.sin(angle) * (npc.speed * 0.5);
        }
    } else if (phase === 'SCRAMBLE') {
        // Seek nearest free desk
        let target = null;
        let minDist = Infinity;

        desks.forEach(d => {
            if (!d.taken) {
                const dist = Math.hypot(d.x - npc.x, d.y - npc.y);
                if (dist < minDist) {
                    minDist = dist;
                    target = d;
                }
            }
        });

        if (target) {
            const angle = Math.atan2(target.y - npc.y, target.x - npc.x);
            npc.vx = Math.cos(angle) * npc.speed;
            npc.vy = Math.sin(angle) * npc.speed;
        } else {
            npc.vx = 0; npc.vy = 0;
        }
    }

    // Soft Repulsion from other NPCs
    npcs.forEach(other => {
        if (other === npc || other.seated) return;
        const dx = npc.x - other.x;
        const dy = npc.y - other.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 20 && dist > 0) {
            npc.vx += (dx / dist) * 0.5;
            npc.vy += (dy / dist) * 0.5;
        }
    });

    // Move X (Sliding)
    let nx = npc.x + npc.vx;
    let movedX = false;
    if (nx > 0 && nx < WIDTH - 30) {
        if (!checkObstacleCol(nx, npc.y)) {
            npc.x = nx;
            movedX = true;
        } else {
            npc.vx *= -1; // Bounce X
        }
    } else {
        npc.vx *= -1;
    }

    // Move Y (Sliding)
    let ny = npc.y + npc.vy;
    let movedY = false;
    if (ny > 0 && ny < HEIGHT - 30) {
        if (!checkObstacleCol(npc.x, ny)) {
            npc.y = ny;
            movedY = true;
        } else {
            npc.vy *= -1; // Bounce Y
        }
    } else {
        npc.vy *= -1;
    }

    // Stuck Detection
    if (!movedX && !movedY && phase === 'SCRAMBLE') {
        npc.stuckTimer++;
        if (npc.stuckTimer > 20) { // Stuck for 20 frames
            npc.unstickTimer = 30; // Move random for 30 frames
            npc.stuckTimer = 0;
            const angle = Math.random() * Math.PI * 2;
            npc.vx = Math.cos(angle) * npc.speed;
            npc.vy = Math.sin(angle) * npc.speed;
        }
    } else {
        npc.stuckTimer = 0;
    }

    updateEl(npc);
}

function checkObstacleCol(x, y) {
    const pRect = { x: x, y: y, w: 30, h: 30 };
    return obstacles.some(obs => rectIntersect(pRect, obs));
}

function rectIntersect(r1, r2) {
    return !(r2.x > r1.x + r1.w ||
        r2.x + r2.w < r1.x ||
        r2.y > r1.y + r1.h ||
        r2.y + r2.h < r1.y);
}

function triigerAlarm() {
    phase = 'SCRAMBLE';
    statusDisplay.textContent = "🚨 ¡ALARMA! ¡BUSCA SITIO!";
    statusDisplay.style.color = '#e74c3c'; // Red
    document.body.style.backgroundColor = '#c0392b'; // Flash Effect
    setTimeout(() => document.body.style.backgroundColor = '#2c3e50', 500);
}

function checkSeat(ent) {
    if (ent.seated) return;

    // Find colliding desk
    const seat = desks.find(d => !d.taken && rectIntersect(
        { x: ent.x + 10, y: ent.y + 10, w: 10, h: 10 }, // Smaller hitbox center
        { x: d.x, y: d.y, w: 40, h: 40 }
    ));

    if (seat) {
        seat.taken = true;
        seat.el.classList.add('occupied');
        ent.seated = true;
        ent.el.classList.add('seated');
        // Snap to center
        ent.x = seat.x + 5;
        ent.y = seat.y + 5;
        updateEl(ent);

        updateChairsCount();
    }
}

function updateChairsCount() {
    const taken = desks.filter(d => d.taken).length;
    chairsDisplay.textContent = `${taken}/${desks.length}`;
}

function updateEl(ent) {
    ent.el.style.transform = `translate(${ent.x}px, ${ent.y}px)`;
}

function endRound() {
    phase = 'RESULT';
    clearInterval(gameLoopId);

    if (player.seated) {
        // Win
        setTimeout(() => {
            alert(`¡SOBREVIVISTE AL DÍA ${day}!`);
            day++;
            startRound();
        }, 1000);
    } else {
        // Lose
        endScreen.classList.remove('hidden');
        document.getElementById('end-title').textContent = "¡DESPEDIDO!";
        document.getElementById('end-msg').textContent = "Te quedaste sin silla y sin trabajo.";
    }
}

function winGame() {
    endScreen.classList.remove('hidden');
    document.getElementById('end-title').textContent = "¡EMPLEADO DEL MES!";
    document.getElementById('end-msg').textContent = "Has dominado el arte del Hot Desking.";
}



// Input
const keys = {};
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        isBossMode = !isBossMode;
        if (isBossMode) {
            bossOverlay.classList.remove('hidden');
            document.title = "Hoja de Cálculo - Gastos Q1";
        } else {
            bossOverlay.classList.add('hidden');
            document.title = "Hot Desking Survival";
        }
    }

    if (isBossMode) return;

    keys[e.key] = true;
    updatePlayerVel();
});
document.addEventListener('keyup', e => {
    keys[e.key] = false;
    updatePlayerVel();
});

function updatePlayerVel() {
    player.vx = 0;
    player.vy = 0;
    if (keys['ArrowUp'] || keys['w']) player.vy = -PLAYER_SPEED;
    if (keys['ArrowDown'] || keys['s']) player.vy = PLAYER_SPEED;
    if (keys['ArrowLeft'] || keys['a']) player.vx = -PLAYER_SPEED;
    if (keys['ArrowRight'] || keys['d']) player.vx = PLAYER_SPEED;
}
