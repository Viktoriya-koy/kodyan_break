const playerBar = document.getElementById('player-bar');
const bossBar = document.getElementById('boss-bar');
const playerHpText = document.getElementById('player-hp');
const bossHpText = document.getElementById('boss-hp');
const battleLog = document.getElementById('battle-log');
const btnSpecial = document.getElementById('btn-special');
const bossOverlay = document.getElementById('boss-overlay');
const titleEl = document.querySelector('.window-frame .title-bar span');

// Stats
const MAX_HP = 100;
let playerHp = 100;
let bossHp = 100;
let specialMeter = 0;
let isPlayerTurn = true;
let isPlaying = true;
let isBossMode = false;
let currentRound = 0;

// Config
const PLAYER_MOVES = {
    logic: { name: "Datos de Mercado", dmg: 15, heal: 0, text: "Presentas tablas comparativas irrefutables." },
    emotional: { name: "Llantito Táctico", dmg: 25, heal: 0, text: "Apelas a la compasión (y a la hipoteca)." },
    work: { name: "Promesa Vana", dmg: 5, heal: 20, text: "Prometes ponerte la camiseta. Recuperas confianza." },
    special: { name: "OFERTA DE NETFLIX", dmg: 60, heal: 0, text: "Sacas una carta de oferta de la competencia sobre la mesa." }
};

const OPPONENTS = [
    {
        name: "Reclutador Jr.",
        hp: 60,
        moves: [
            { name: "Pregunta Trampa", dmg: 10, text: "¿Cuál es tu mayor defecto?" },
            { name: "Sonrisa Falsa", dmg: 5, text: "Te promete un gran ambiente laboral." }
        ]
    },
    {
        name: "Team Lead",
        hp: 80,
        moves: [
            { name: "Deuda Técnica", dmg: 15, text: "Menciona el código spaghetti que dejaste." },
            { name: "Urgencia", dmg: 10, text: "Necesitamos esto para ayer." }
        ]
    },
    {
        name: "HR Manager",
        hp: 100,
        moves: [
            { name: "Política de Empresa", dmg: 15, text: "Cita la página 45 del manual." },
            { name: "Gaslighting", dmg: 20, text: "¿Seguro que mereces tanto?" },
            { name: "Pizza Party", dmg: 8, text: "Ofrece beneficios no monetarios." }
        ]
    },
    {
        name: "VP of Engineering",
        hp: 120,
        moves: [
            { name: "Visión Macro", dmg: 25, text: "Tu rol no escala con la visión." },
            { name: "Congelamiento", dmg: 15, text: "Hay hiring freeze global." }
        ]
    },
    {
        name: "EL CEO",
        hp: 150,
        moves: [
            { name: "Somos Familia", dmg: 30, text: "Manipulación emocional nivel experto." },
            { name: "Visionario", dmg: 20, text: "Habla del futuro (sin pagarte hoy)." },
            { name: "Despido", dmg: 40, text: "Amenaza con reemplazarte por IA." }
        ]
    }
];

function init() {
    setupRound(0);

    document.querySelectorAll('.atk-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!isPlayerTurn || !isPlaying) return;
            const type = e.target.dataset.type;
            if (type === 'special' && specialMeter < 100) return;

            playerTurn(type);
        });
    });
}

function setupRound(roundIdx) {
    currentRound = roundIdx;
    const opponent = OPPONENTS[currentRound];

    bossHp = opponent.hp;
    playerHp = Math.min(MAX_HP, playerHp + 30); // Heal 30% between rounds
    specialMeter = Math.max(0, specialMeter - 50); // Decay special

    isPlayerTurn = true;
    isPlaying = true;

    updateUI();
    updateSpecialBtn();

    // UI Updates
    if (titleEl) titleEl.textContent = `Negociación Salarial - vs ${opponent.name}`;
    battleLog.innerHTML = "";
    log(`RIVAL: ${opponent.name} (HP: ${opponent.hp})`);
    log("¡COMIENZA LA NEGOCIACIÓN!");
}

function playerTurn(type) {
    if (!isPlaying) return;

    // Choose Move
    let move = PLAYER_MOVES[type];
    if (type === 'special') {
        move = PLAYER_MOVES.special;
        specialMeter = 0;
        updateSpecialBtn();
    } else {
        // Build special
        specialMeter = Math.min(100, specialMeter + 34);
        updateSpecialBtn();
    }

    // Apply Effects
    bossHp = Math.max(0, bossHp - move.dmg);
    playerHp = Math.min(MAX_HP, playerHp + move.heal);

    // Visuals
    log(`> Tú usas ${move.name}: ${move.text}`);
    updateUI();

    isPlayerTurn = false;

    if (checkEndGame()) return;

    // Boss Turn Delay
    setTimeout(bossTurn, 1500);
}

function bossTurn() {
    if (!isPlaying) return;

    const opponent = OPPONENTS[currentRound];
    const move = opponent.moves[Math.floor(Math.random() * opponent.moves.length)];

    // Apply
    playerHp = Math.max(0, playerHp - move.dmg);

    log(`< ${opponent.name} usa ${move.name}: ${move.text}`);
    updateUI();

    isPlayerTurn = true;
    checkEndGame();
}

function checkEndGame() {
    if (bossHp <= 0) {
        if (currentRound < OPPONENTS.length - 1) {
            isPlaying = false;
            log("¡ARGUMENTO GANADOR!");

            // Save Progress
            localStorage.setItem('vico_level_salary', currentRound + 2); // 0-indexed round -> Level 2

            setTimeout(() => {
                alert(`¡HAS VENCIDO A ${OPPONENTS[currentRound].name}! Prepárate para el siguiente nivel...`);
                setupRound(currentRound + 1);
            }, 1000);
        } else {
            isPlaying = false;
            log("¡VICTORIA TOTAL! El jefe firma el aumento.");

            // Completed
            localStorage.setItem('vico_level_salary', 6);

            setTimeout(() => {
                alert("¡DIRECTIVO APROBADO! 📈💰\nHas derrotado a toda la cadena de mando.");
                addXP(500);
                location.reload();
            }, 1000);
        }
        return true;
    }

    if (playerHp <= 0) {
        isPlaying = false;
        log("DERROTA. Te vas con las manos vacías.");
        setTimeout(() => {
            alert("NEGOCIACIÓN FALLIDA 📉\nTe convencieron de que eres afortunado por tener trabajo.");
            location.reload();
        }, 1000);
        return true;
    }
    return false;
}

function updateUI() {
    const opponent = OPPONENTS[currentRound];
    const maxBossHp = opponent.hp + (opponent.hp === 150 ? 0 : 0); // Hacky max ref
    // For visual bar, use relative percentage based on current max
    // Or just simplify: assume bar is 100% and visual drops? 
    // Let's stick to percentage of CURRENT max HP for that boss
    const hpPercent = Math.floor((bossHp / opponent.hp) * 100);

    playerBar.style.height = playerHp + '%';
    bossBar.style.height = Math.min(100, (bossHp / opponent.hp) * 100) + '%';

    playerHpText.textContent = playerHp + '%';
    bossHpText.textContent = bossHp + '/' + opponent.hp;
}

function updateSpecialBtn() {
    if (specialMeter >= 100) {
        btnSpecial.classList.add('ready');
        btnSpecial.removeAttribute('disabled');
        btnSpecial.textContent = "🔥 ¡OFERTA EXTERNA! (LISTO)";
    } else {
        btnSpecial.classList.remove('ready');
        btnSpecial.setAttribute('disabled', 'true');
        btnSpecial.textContent = `Cargando Oferta... ${specialMeter}%`;
    }
}

function log(msg) {
    battleLog.innerHTML += `<div>${msg}</div>`;
    battleLog.scrollTop = battleLog.scrollHeight;
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

init();
