const ticketCard = document.getElementById('ticket-card');
const fxOverlay = document.getElementById('fx-overlay');
const bossOverlay = document.getElementById('boss-overlay');
const feedbackMsg = document.getElementById('feedback-msg');

let currentDamage = 0;
let isBossMode = false;

// Setup buttons
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        applyEffect(btn.dataset.effect);
    });
});

function applyEffect(type) {
    if (isBossMode) return;

    // Add XP just for venting
    addXP(5);
    currentDamage++;

    switch (type) {
        case 'fire':
            ticketCard.classList.add('burning');
            feedbackMsg.textContent = "Incidente escalado a Incendio Nivel 5.";
            createParticles('🔥');
            break;
        case 'shred':
            ticketCard.classList.add('shredded');
            feedbackMsg.textContent = "Ticket reorganizado verticalmente.";
            break;
        case 'water':
            ticketCard.classList.add('wet');
            feedbackMsg.textContent = "Problema diluido con fluidos calientes.";
            createParticles('💧');
            break;
        case 'hammer':
            ticketCard.classList.add('shaking');
            createParticles('💥');
            feedbackMsg.textContent = "Mantenimiento percusivo aplicado.";
            setTimeout(() => ticketCard.classList.remove('shaking'), 500); // Stop shake after hit
            break;
        case 'stamp':
            ticketCard.classList.add('stamped');
            feedbackMsg.textContent = "Solicitud denegada con prejuicio.";
            break;
    }

    if (currentDamage > 3) {
        feedbackMsg.textContent = "¡TICKET DESTRUIDO! La paz interior ha sido restaurada.";

        // Update Catharsis
        addCatharsis(20);

        // Destruir visualmente
        setTimeout(() => {
            ticketCard.classList.add('destroyed');

            // Auto respawn
            setTimeout(() => {
                resetTicket();
                generateRandomIssue();
            }, 1000);
        }, 800);
    }
}

// State
let catharsis = 0;
const catharsisBar = document.getElementById('catharsis-bar');
const catharsisVal = document.getElementById('catharsis-val');

function addCatharsis(amount) {
    catharsis = Math.min(100, catharsis + amount);
    catharsisBar.style.width = catharsis + '%';
    catharsisVal.textContent = catharsis + '%';

    if (catharsis >= 100) {
        setTimeout(() => {
            alert("✨ ¡NIRVANA ALCANZADO! ✨\nYa no te importan los plazos de entrega.");
            catharsis = 0;
            updateCatharsisUI(); // Reset visual
            location.reload();
        }, 500);
    }
}

function updateCatharsisUI() {
    catharsisBar.style.width = catharsis + '%';
    catharsisVal.textContent = catharsis + '%';
}

const COMMON_ISSUES = [
    { title: "El PDF no abre", desc: "¿Tengo Adobe instalado? No sé qué es Adobe." },
    { title: "Reunión de Alineación", desc: "Necesitamos 2 horas para discutir el color del botón." },
    { title: "Wifi lento en el baño", desc: "No puedo ver TikTok cómodamente." },
    { title: "Excel se cerró solo", desc: "No guardé nada desde 2015. Recupéralo." },
    { title: "Mi mouse no tiene luz", desc: "¿Está enchufado? No sé, soy de Marketing." },
    { title: "Cambio de contraseña", desc: "Olvidé la anterior y la nueva y mi nombre." }
];

function generateRandomIssue() {
    const issue = COMMON_ISSUES[Math.floor(Math.random() * COMMON_ISSUES.length)];
    document.getElementById('ticket-title').value = issue.title;
    document.getElementById('ticket-desc').value = issue.desc;
    document.getElementById('ticket-assignee').value = "Usuario Genérico";
}

function createParticles(emoji) {
    for (let i = 0; i < 10; i++) {
        const p = document.createElement('div');
        p.textContent = emoji;
        p.style.position = 'absolute';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.fontSize = (Math.random() * 20 + 20) + 'px';
        p.style.pointerEvents = 'none';
        p.style.transition = 'all 1s';

        fxOverlay.appendChild(p);

        // Animate out
        setTimeout(() => {
            p.style.transform = `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`;
            p.style.opacity = 0;
        }, 10);

        setTimeout(() => p.remove(), 1000);
    }
}

function resetTicket() {
    ticketCard.className = 'ticket-card';
    fxOverlay.innerHTML = '';
    currentDamage = 0;
    feedbackMsg.textContent = "Nuevo ticket generado. Listo para sufrir.";
    document.getElementById('ticket-title').value = "";
    document.getElementById('ticket-desc').value = "";
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
