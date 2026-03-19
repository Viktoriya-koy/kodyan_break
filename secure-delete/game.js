const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const memoryEl = document.getElementById('memory');
const startMsg = document.getElementById('start-msg');
const startBtn = document.getElementById('start-btn');
const bossOverlay = document.getElementById('boss-overlay');
const diskGrid = document.getElementById('disk-grid');

// --- Config ---
let isPlaying = false;
let isBossMode = false;
let score = 0;
let memoryFreed = 0;
let lastTime = 0;
let spawnTimer = 0;

// --- Physics ---
const GRAVITY = 500; // px/s^2

// --- Entities ---
let documents = []; // { x, y, vx, vy, text, type, hp, width, height, color }
let particles = []; // { x, y, vx, vy, life, color, size }
let mousePath = []; // { x, y, time }

const FRASES_TOXICAS = [
    "No hay plata", "Ponete la camiseta", "Es urgente", "Para ayer",
    "Sin viáticos", "Prioridad Alta", "Reunión 18hs", "Falta justificar",
    "Recorte de gastos", "Horas extra (gratis)", "Vení el finde"
];

const FRASES_BOSS = [
    "DECRETO MINISTERIAL 452/26",
    "RESOLUCIÓN DE CONGELAMIENTO",
    "MEMORÁNDUM DE RESTRICCIÓN",
    "NOTA DEL MINISTRO"
];

// --- Resize ---
function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resize);
resize();

// --- Input ---
canvas.addEventListener('mousemove', (e) => {
    if (!isPlaying || isBossMode) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mousePath.push({ x, y, time: Date.now() });

    // Trim old path
    if (mousePath.length > 10) mousePath.shift();

    checkCollisions(x, y);
});

// --- Game Loop ---
function start() {
    isPlaying = true;
    score = 0;
    memoryFreed = 0;
    documents = [];
    particles = [];
    startMsg.style.display = 'none';
    startBtn.textContent = "LIMPIEZA EN CURSO...";
    startBtn.style.background = "#5cb85c"; // Green

    requestAnimationFrame(loop);
}

startBtn.addEventListener('click', () => {
    if (!isPlaying) start();
});

function loop(timestamp) {
    if (!isPlaying) return;

    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (!isBossMode) {
        update(dt);
        draw();
    }

    requestAnimationFrame(loop);
}

const FRASES_FRIENDLY = [
    "Bono de Sueldo", "Feriado Puente", "Aprobación de Licencia",
    "Ticket Canasta", "Wifi Libre", "Viernes Flex"
];

// ... (Resize function remains same)

function update(dt) {
    // Difficulty Scaling based on Score
    // Cap gravity at 1200, spawn interval min 0.3s
    let difficultyFactor = Math.min(score / 500, 1); // 0 to 1 over 500 score
    let currentGravity = GRAVITY + (difficultyFactor * 700);
    let spawnRateMin = 1.0 - (difficultyFactor * 0.7); // 1.0 -> 0.3

    // Spawning
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
        spawnDocument();
        spawnTimer = Math.random() * spawnRateMin + 0.3; // Random interval
    }

    // Update Documents
    documents.forEach(doc => {
        doc.x += doc.vx * dt;
        doc.y += doc.vy * dt;
        doc.vy += currentGravity * dt;
        doc.rotation += doc.rotSpeed * dt;
    });

    // ... (Cleaning arrays)

    // ... (Particles update)
}

function spawnDocument() {
    // Types: 
    // 65% Normal (Toxic)
    // 20% Friendly (Do NOT destroy)
    // 15% Boss (Minister)

    const r = Math.random();
    let type = 'normal';
    if (r < 0.2) type = 'friendly';
    else if (r > 0.85) type = 'boss';

    let text, color, textColor, hp;

    if (type === 'boss') {
        text = FRASES_BOSS[Math.floor(Math.random() * FRASES_BOSS.length)];
        color = '#8B0000'; // Dark Red
        textColor = '#FFF';
        hp = 3;
    } else if (type === 'friendly') {
        text = FRASES_FRIENDLY[Math.floor(Math.random() * FRASES_FRIENDLY.length)];
        color = '#4285f4'; // Nice Blue
        textColor = '#FFF';
        hp = 1;
    } else {
        text = FRASES_TOXICAS[Math.floor(Math.random() * FRASES_TOXICAS.length)];
        color = '#FFF';
        textColor = '#333';
        hp = 1;
    }

    const x = Math.random() * (canvas.width - 100) + 50;
    const y = canvas.height;
    const vx = (Math.random() - 0.5) * 300; // Horizontal throw
    // Throw harder as difficulty increases
    const vy = -(Math.random() * 300 + 500 + (score > 100 ? 200 : 0));

    // Estimate text width
    ctx.font = type === 'boss' ? "bold 20px 'Courier New'" : "16px 'Segoe UI'";
    const width = ctx.measureText(text).width + 20;
    const height = 40;

    documents.push({
        x, y, vx, vy,
        text, type, hp, width, height,
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 2,
        color, textColor
    });
}

function checkCollisions(mx, my) {
    if (mousePath.length < 2) return;

    const prev = mousePath[mousePath.length - 2];

    // Simple point collision for slice
    // A proper line intersection is better but point check is cheap for fast mouse

    documents.forEach(doc => {
        // Simple rotated AABB approximation check (distance)
        const dx = mx - doc.x;
        const dy = my - doc.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < doc.width / 1.5) {
            // Check Cooldown
            const now = Date.now();
            if (doc.lastHit && now - doc.lastHit < 100) return; // 100ms immunity interval

            // HIT
            doc.hp--;
            doc.lastHit = now;
            createParticles(doc.x, doc.y, doc.color, 5);

            // Push back effect (impact)
            doc.vy -= 100;
            doc.vx += (Math.random() - 0.5) * 200;

            if (doc.hp <= 0) {
                // DESTROYED
                destroyDocument(doc);
            }
        }
    });

    documents = documents.filter(doc => doc.hp > 0);
}

function destroyDocument(doc) {
    // Scoring Logic
    if (doc.type === 'friendly') {
        score -= 50;
        memoryFreed -= 50;
        // Visual penalty maybe? Red flash?
        createParticles(doc.x, doc.y, 'red', 30); // Blood/Error
    } else {
        score += doc.type === 'boss' ? 50 : 10;
        memoryFreed += doc.type === 'boss' ? 15 : 2;
        createParticles(doc.x, doc.y, doc.color, 20); // Confetti

        // Award Global XP
        let currentXP = parseInt(localStorage.getItem('vicoTotalXP')) || 0;
        currentXP += doc.type === 'boss' ? 10 : 2; // XP reward
        localStorage.setItem('vicoTotalXP', currentXP);
    }

    // Prevent negative score
    if (score < 0) score = 0;
    if (memoryFreed < 0) memoryFreed = 0;

    scoreEl.textContent = score;
    memoryEl.textContent = memoryFreed + " MB";
}

function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 500,
            vy: (Math.random() - 0.5) * 500,
            life: Math.random() * 0.5 + 0.2, // 0.2-0.7s
            color: color,
            size: Math.random() * 5 + 2
        });
    }
}

function draw() {
    // Clear
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Documents
    documents.forEach(doc => {
        ctx.save();
        ctx.translate(doc.x, doc.y);
        ctx.rotate(doc.rotation);

        // Paper Body
        ctx.fillStyle = doc.color;
        ctx.fillRect(-doc.width / 2, -doc.height / 2, doc.width, doc.height);

        // Border
        ctx.strokeStyle = "#999";
        ctx.lineWidth = 1;
        ctx.strokeRect(-doc.width / 2, -doc.height / 2, doc.width, doc.height);

        // Text
        ctx.fillStyle = doc.textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = doc.type === 'boss' ? "bold 16px 'Courier New'" : "14px 'Segoe UI'";
        ctx.fillText(doc.text, 0, 0);

        // Boss HP Bar
        if (doc.type === 'boss') {
            ctx.fillStyle = "red";
            ctx.fillRect(-doc.width / 2, doc.height / 2 + 5, doc.width * (doc.hp / 3), 4);
        }

        ctx.restore();
    });

    // Draw Particles (Confetti)
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life * 2; // Fade out
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1;
    });

    // Draw Slash Trace
    if (mousePath.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0, 255, 255, 0.5)"; // Cyan slash
        ctx.lineWidth = 3;
        ctx.moveTo(mousePath[0].x, mousePath[0].y);
        for (let i = 1; i < mousePath.length; i++) {
            ctx.lineTo(mousePath[i].x, mousePath[i].y);
        }
        ctx.stroke();
    }
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
        document.title = "Desfragmentando Disco Local (C:)";
        // Start fake defrag visual
        renderDefrag();
    } else {
        bossOverlay.classList.add('hidden');
        document.title = "SecureDelete v4.0 - Gobierno de San Luis";
    }
}

function renderDefrag() {
    diskGrid.innerHTML = '';
    // Create fake disk blocks
    for (let i = 0; i < 300; i++) {
        const div = document.createElement('div');
        div.className = 'disk-block ' + getRandomBlockStatus();
        diskGrid.appendChild(div);
    }

    // Simulate activity
    setInterval(() => {
        if (!isBossMode) return;
        const index = Math.floor(Math.random() * 300);
        const block = diskGrid.children[index];
        if (block) block.className = 'disk-block block-reading';
        setTimeout(() => {
            if (block) block.className = 'disk-block block-optimized';
        }, 200);

        // Update prog text
        const prog = document.getElementById('defrag-prog');
        let val = parseInt(prog.textContent);
        if (val < 99) prog.textContent = (val + 1) + "%";
    }, 500);
}

function getRandomBlockStatus() {
    const r = Math.random();
    if (r < 0.6) return 'block-used';
    if (r < 0.8) return 'block-free';
    return 'block-optimized';
}
