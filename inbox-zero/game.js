const deckEl = document.getElementById('card-deck');
const scoreEl = document.getElementById('score-val');
const gameOverPanel = document.getElementById('game-over');
const endTitle = document.getElementById('end-title');
const finalCount = document.getElementById('final-count');
const restartBtn = document.getElementById('restart-btn');
const reputationBar = document.querySelector('.reputation-bar');

let globalScore = parseInt(localStorage.getItem('vico_score_inbox')) || 0;
let reputation = 100;
let cardsHandled = 0;
let activeCards = [];
let isDragging = false;
let startX = 0;
let currentX = 0;
let topCard = null;

function addCoins(amount) {
    let coins = parseInt(localStorage.getItem('office_coins')) || 0;
    coins += amount;
    localStorage.setItem('office_coins', coins);
    if (window.parent && window.parent.document.getElementById('global-coins')) {
        window.parent.document.getElementById('global-coins').textContent = coins;
    }
}

const emailTemplates = [
    { sender: 'Jefe', email: 'boss@corp.com', subject: 'URGENTE: Reportes', body: 'Necesito los reportes de ventas en mi escritorio en 5 minutos o estás despedido.', isSpam: false, avatar: '👨‍💼', color: '#ff9800' },
    { sender: 'RRHH', email: 'hr@corp.com', subject: 'Fiesta de Fin de Año', body: 'Por favor, confirmar asistencia a la fiesta de fin de año y traer su propia comida.', isSpam: false, avatar: '👩‍💼', color: '#9c27b0' },
    { sender: 'Soporte IT', email: 'it@corp.com', subject: 'Actualización del Sistema', body: 'Por favor, no apague su equipo esta noche. Instalación de parches de seguridad.', isSpam: false, avatar: '👨‍💻', color: '#2196f3' },
    { sender: 'Príncipe Nigeriano', email: 'royalty@scam.ng', subject: 'MILLONES ESPERANDO', body: 'Usted es el único heredero de 40 millones de dólares. Solo necesito su número de tarjeta.', isSpam: true, avatar: '👑', color: '#e91e63' },
    { sender: 'Farmacia Online', email: 'pills@cheap.ru', subject: 'Pastillas Milagrosas', body: 'Aumente su productividad en un 400% con nuestras pastillas no aprobadas por la FDA.', isSpam: true, avatar: '💊', color: '#f44336' },
    { sender: 'Casino Loco', email: 'win@casino.com', subject: '¡BONUS DE BIENVENIDA!', body: 'Gira la ruleta y gana hasta $5000 hoy mismo haciendo clic aquí.', isSpam: true, avatar: '🎰', color: '#ffeb3b' },
    { sender: 'Compañero Pesado', email: 'pedro@corp.com', subject: 'Re: Re: Re: Re: Hola', body: '¿Viste el partido de anoche? Qué locura cómo patearon la pelota jajaja.', isSpam: false, avatar: '🧔', color: '#4caf50' },
    { sender: 'Alerta de Seguridad', email: 'noreply@bank.com', subject: 'Su cuenta fue bloqueada', body: 'Su cuenta fue suspendida. Haga clic en este link sospechoso para desbloquearla.', isSpam: true, avatar: '🏦', color: '#607d8b' }
];

function initGame() {
    reputation = 100;
    cardsHandled = 0;
    scoreEl.textContent = reputation;
    reputationBar.style.background = 'rgba(0,0,0,0.2)';
    gameOverPanel.classList.add('hidden');
    deckEl.innerHTML = '';
    activeCards = [];
    
    // Generate 15 cards
    for(let i=0; i<15; i++) {
        appendNewCard();
    }
    setupTopCard();
}

function appendNewCard() {
    const data = emailTemplates[Math.floor(Math.random() * emailTemplates.length)];
    const card = document.createElement('div');
    card.className = 'email-card';
    card.dataset.isSpam = data.isSpam;
    
    // Z-index stacking
    card.style.zIndex = Math.floor(Math.random() * 100);
    card.style.borderTopColor = data.color;
    
    card.innerHTML = `
        <div class="stamp like">ENVIADO</div>
        <div class="stamp nope">SPAM</div>
        <div class="sender-info">
            <div class="avatar">${data.avatar}</div>
            <div class="sender-details">
                <p class="sender-name">${data.sender}</p>
                <p class="sender-email">${data.email}</p>
            </div>
        </div>
        <div class="email-subject">${data.subject}</div>
        <div class="email-body">${data.body}</div>
    `;
    
    deckEl.insertBefore(card, deckEl.firstChild);
    activeCards.unshift(card);
    updateDeckVisuals();
}

function updateDeckVisuals() {
    // Top card is at end of array technically because of z-index, actually array index 0 is bottom if using prepend.
    // Let's rely on activeCards array.
    activeCards.forEach((card, index) => {
        // index 0 is top
        const depth = index;
        if (depth > 3) card.style.opacity = 0;
        else {
            card.style.opacity = 1 - (depth * 0.2);
            card.style.transform = `scale(${1 - depth * 0.05}) translateY(${depth * 15}px)`;
            card.style.zIndex = 100 - depth;
        }
    });
}

function setupTopCard() {
    if (activeCards.length === 0) { appendNewCard(); appendNewCard(); }
    topCard = activeCards[0];
    
    // Reset state
    isDragging = false;
    currentX = 0;
    
    // Mobile/Touch events support (omitted for brevity, using mouse)
    topCard.addEventListener('mousedown', handleDragStart);
}

function handleDragStart(e) {
    if (e.target.closest('#boss-overlay:not(.hidden)')) return;
    isDragging = true;
    startX = e.clientX;
    topCard.classList.add('dragging');
}

window.addEventListener('mousemove', (e) => {
    if (!isDragging || !topCard) return;
    currentX = e.clientX - startX;
    
    const rotate = currentX * 0.05;
    topCard.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;
    
    const nopeStamp = topCard.querySelector('.stamp.nope');
    const likeStamp = topCard.querySelector('.stamp.like');
    
    if (currentX < 0) {
        nopeStamp.style.opacity = Math.min(1, Math.abs(currentX) / 100);
        likeStamp.style.opacity = 0;
    } else {
        likeStamp.style.opacity = Math.min(1, currentX / 100);
        nopeStamp.style.opacity = 0;
    }
});

window.addEventListener('mouseup', () => {
    if (!isDragging || !topCard) return;
    isDragging = false;
    topCard.classList.remove('dragging');
    
    if (currentX < -120) {
        evaluateCard(topCard, true); // Swiped Spam
        animateCardOut(topCard, -window.innerWidth);
    } else if (currentX > 120) {
        evaluateCard(topCard, false); // Swiped Reply
        animateCardOut(topCard, window.innerWidth);
    } else {
        // Snap back
        topCard.style.transform = `scale(1) translateY(0px)`;
        topCard.querySelector('.stamp.nope').style.opacity = 0;
        topCard.querySelector('.stamp.like').style.opacity = 0;
    }
});

function animateCardOut(card, targetX) {
    card.style.transition = 'transform 0.4s ease-out';
    card.style.transform = `translateX(${targetX}px) rotate(${targetX * 0.1}deg)`;
    
    activeCards.shift();
    topCard = null;
    
    setTimeout(() => {
        card.remove();
        appendNewCard();
        setupTopCard();
    }, 400);
}

function evaluateCard(card, swipedSpam) {
    cardsHandled++;
    const isActuallySpam = card.dataset.isSpam === 'true';
    
    if (swipedSpam === isActuallySpam) {
        // Correct!
        reputation = Math.min(100, reputation + 5);
        globalScore += 10;
        addCoins(1);
        localStorage.setItem('vico_score_inbox', globalScore);
    } else {
        // Wrong!
        reputation -= 20; // Heavy penalty
        reputationBar.style.background = '#f44336';
        setTimeout(() => reputationBar.style.background = 'rgba(0,0,0,0.2)', 300);
    }
    
    scoreEl.textContent = reputation;
    
    if (reputation <= 0) {
        reputation = 0;
        endGame();
    }
}

function endGame() {
    gameOverPanel.classList.remove('hidden');
    finalCount.textContent = cardsHandled;
}

restartBtn.addEventListener('click', initGame);

// Boss Key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('boss-overlay').classList.toggle('hidden');
    }
});

initGame();
