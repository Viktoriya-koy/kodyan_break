const queueList = document.getElementById('queue-list');
const jobCountEl = document.getElementById('job-count');
const printerStatusEl = document.getElementById('printer-status');
const bossOverlay = document.getElementById('boss-overlay');
const jamOverlay = document.getElementById('jam-overlay');
const jamBar = document.getElementById('jam-bar');
const inkFills = {
    cyan: document.querySelector('.cyan .ink-fill'),
    magenta: document.querySelector('.magenta .ink-fill'),
    yellow: document.querySelector('.yellow .ink-fill'),
    black: document.querySelector('.black .ink-fill')
};

// --- Game State ---
let queue = [];
let isPlaying = true;
let isBossMode = false;
let isJammed = false;
let jamProgress = 0;
let inkLevels = { cyan: 100, magenta: 100, yellow: 100, black: 100 };
let score = 0;
let scoreEl = null; // Maybe add to title?

// Config
const PRINT_SPEED = 20; // % per second
const SPAWN_RATE = 3000; // ms
let lastTime = 0;
let spawnTimer = 0;

const DOC_TYPES = [
    { type: 'normal', name: 'Informe_Semanal.docx', pages: 12, size: '2.4 MB', owner: 'Vico' },
    { type: 'normal', name: 'Presupuesto_2026.xlsx', pages: 5, size: '1.1 MB', owner: 'Contaduría' },
    { type: 'normal', name: 'Nota_Solicitud.pdf', pages: 1, size: '500 KB', owner: 'Mesa Entrada' },
    { type: 'boss', name: 'DECRETO_URGENTE.pdf', pages: 3, size: '4.5 MB', owner: 'MINISTRO' },
    { type: 'corrupt', name: 'X_x_VIRUS_x_X.exe.pdf', pages: 666, size: '1024 GB', owner: 'Unknown' },
    { type: 'corrupt', name: 'Oferta_Increible.html', pages: 1, size: '2 KB', owner: 'Spam' },
    { type: 'personal', name: 'Fotos_Playa_2025.zip', pages: 50, size: '200 MB', owner: 'Vico' },
    { type: 'personal', name: 'Entradas_Cine.pdf', pages: 2, size: '1 MB', owner: 'Vico' }
];

// --- Init ---
function init() {
    // Buttons
    document.getElementById('btn-cancel').addEventListener('click', () => {
        if (queue.length > 0) cancelJob(queue[0]);
    });

    document.getElementById('btn-pause').addEventListener('click', () => {
        if (queue.length > 0) toggleHold(queue[0]);
    });

    // Ink Refill interaction
    document.querySelectorAll('.ink-pot').forEach(pot => {
        pot.addEventListener('click', () => {
            const color = pot.classList[1]; // cyan, magenta...
            refillInk(color);
        });
    });

    requestAnimationFrame(loop);
}

// --- Loop ---
function loop(timestamp) {
    if (!isPlaying) return;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (!isBossMode && !isJammed) {
        update(dt);
    }
    render();

    requestAnimationFrame(loop);
}

function update(dt) {
    // Spawning
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
        spawnJob();
        spawnTimer = Math.random() * 2 + 1; // 1-3s
    }

    // Printing
    if (queue.length > 0) {
        const currentJob = queue[0];

        if (!currentJob.isPaused) {
            // Check Ink
            if (hasInk()) {
                currentJob.progress += PRINT_SPEED * dt;
                printerStatusEl.textContent = "Imprimiendo: " + currentJob.name;
                consumeInk(dt);

                // Random Jam
                if (Math.random() < 0.005) { // 0.5% chance per frame? Too high. 0.1% maybe
                    triggerJam();
                }

            } else {
                printerStatusEl.textContent = "⚠️ ERROR: Falta Tinta (Click cartuchos)";
            }

            // Job Complete
            if (currentJob.progress >= 100) {
                completeJob(currentJob);
            }
        } else {
            printerStatusEl.textContent = "En Pausa";
        }
    } else {
        printerStatusEl.textContent = "Listo";
    }
}

function spawnJob() {
    const template = DOC_TYPES[Math.floor(Math.random() * DOC_TYPES.length)];
    const job = {
        id: Date.now() + Math.random(),
        ...template,
        progress: 0,
        isPaused: false,
        status: 'En cola'
    };

    // If corrupt, maybe randomize name slightly
    if (job.type === 'corrupt') {
        job.name = job.name.replace('e', '3').replace('a', '@');
    }

    queue.push(job);
    renderQueue();
}

function cancelJob(job) {
    // Logic: 
    // If it was corrupt/personal -> Good! Points.
    // If normal -> Bad! Warning.

    if (job.type === 'corrupt' || job.type === 'personal') {
        // Good catch
        // Visual feedback?
    } else {
        // Bad.
    }

    removeJob(job);
}

function completeJob(job) {
    // Logic:
    // If normal/boss -> Good! XP.
    // If corrupt/personal -> Bad!

    if (job.type === 'normal' || job.type === 'boss') {
        let xp = job.type === 'boss' ? 15 : 5;
        addXP(xp);
    } else {
        // Printed a virus or personal photos
        alert("¡ERROR! Has impreso " + job.name + ". Tu jefe te está mirando mal.");
        // Penalty?
    }

    removeJob(job);
}

function removeJob(job) {
    const idx = queue.indexOf(job);
    if (idx > -1) queue.splice(idx, 1);
    renderQueue();
}

function toggleHold(job) {
    job.isPaused = !job.isPaused;
    job.status = job.isPaused ? "Pausado" : "Imprimiendo...";
    renderQueue();
}

// --- Ink System ---
function hasInk() {
    return inkLevels.cyan > 0 && inkLevels.magenta > 0 && inkLevels.yellow > 0 && inkLevels.black > 0;
}

function consumeInk(dt) {
    const drain = 2 * dt;
    inkLevels.cyan -= drain * Math.random();
    inkLevels.magenta -= drain * Math.random();
    inkLevels.yellow -= drain * Math.random();
    inkLevels.black -= drain * 0.5; // Text uses mostly black?

    // Clamp
    for (let k in inkLevels) if (inkLevels[k] < 0) inkLevels[k] = 0;

    updateInkUI();
}

function refillInk(color) {
    inkLevels[color] = 100;
    updateInkUI();
}

function updateInkUI() {
    inkFills.cyan.style.height = inkLevels.cyan + "%";
    inkFills.magenta.style.height = inkLevels.magenta + "%";
    inkFills.yellow.style.height = inkLevels.yellow + "%";
    inkFills.black.style.height = inkLevels.black + "%";
}

// --- Jam System ---
function triggerJam() {
    isJammed = true;
    jamProgress = 0;
    jamOverlay.classList.remove('hidden');
    jamBar.style.width = "0%";
}

document.addEventListener('keydown', (e) => {
    if (isJammed && e.code === 'Space') {
        jamProgress += 10;
        jamBar.style.width = jamProgress + "%";
        if (jamProgress >= 100) {
            isJammed = false;
            jamOverlay.classList.add('hidden');
        }
    }

    // Boss Key
    if (e.key === 'Escape') toggleBossMode();
});

// --- Rendering ---
function renderQueue() {
    queueList.innerHTML = '';

    queue.forEach((job, index) => {
        const div = document.createElement('div');
        div.className = `queue-item ${index === 0 ? 'active-print' : ''}`;

        // Status text
        let status = job.status;
        if (index === 0 && !job.isPaused) status = "Imprimiendo...";
        else if (index > 0) status = "En cola";

        let icon = '📄';
        let docClass = 'doc-normal';
        if (job.type === 'corrupt') { icon = '👾'; docClass = 'doc-corrupt'; }
        if (job.type === 'boss') { icon = '🚨'; docClass = 'doc-boss'; }

        // Progress Bar (Only for top job)
        let progressHtml = '';
        if (index === 0) {
            progressHtml = `<div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${job.progress}%"></div></div>`;
        }

        div.innerHTML = `
            <div class="col-icon">${icon}</div>
            <div class="col-doc ${docClass}">${job.name}</div>
            <div class="col-status">${status}</div>
            <div class="col-owner">${job.owner}</div>
            <div class="col-pages">${Math.floor(job.progress / 100 * job.pages)}/${job.pages}</div>
            <div class="col-size">${job.size}</div>
            ${progressHtml}
        `;

        queueList.appendChild(div);
    });

    jobCountEl.textContent = `${queue.length} documentos en cola`;
}

function render() {
    // Only used for canvas games usually, but here updates happen in update()
}

// --- Global XP ---
function addXP(amount) {
    let current = parseInt(localStorage.getItem('vicoTotalXP')) || 0;
    localStorage.setItem('vicoTotalXP', current + amount);
}

// --- Boss Mode ---
function toggleBossMode() {
    isBossMode = !isBossMode;
    if (isBossMode) {
        bossOverlay.classList.remove('hidden');
        document.title = "Página de prueba de la impresora";
    } else {
        bossOverlay.classList.add('hidden');
        document.title = "Cola de Impresión - EPSON L380 (RED)";
    }
}

// Start
init();
