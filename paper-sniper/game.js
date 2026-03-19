document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const gameArea = document.getElementById('game-area');
    const bossChar = document.getElementById('boss-character');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('time');
    
    // Screens & Buttons
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const gameOverModal = document.getElementById('game-over-modal');
    const restartBtn = document.getElementById('restart-btn');
    const endTitle = document.getElementById('end-title');
    const endMessage = document.getElementById('end-message');
    const finalScore = document.getElementById('final-score');
    const highScoreMsg = document.getElementById('high-score-msg');

    const bossContainer = document.getElementById('boss-container');
    const snitchChar = document.getElementById('snitch-character');
    const comboDisplay = document.getElementById('combo-display');

    // States and Assets
    const stateEmojis = {
        writing: '📝',
        turning: '🤨',
        looking: '😠'
    };
    
    // Game variables
    let score = 0;
    let maxTime = 60;
    let timeUp = false;
    let timerInterval;
    let bossStateTimeout;
    
    // Mechanics variables
    let bossState = 0; 
    let isCaught = false;
    let activeThrows = 0;
    let comboMultiplier = 1;
    let comboHits = 0;
    let difficultyFactor = 1;

    // Boss Movement
    let bossX = window.innerWidth > 800 ? 300 : window.innerWidth / 2; 
    let bossSpeed = 2; // px per frame
    let bossDirection = 1;
    let animationFrameId;

    // Snitch Logic
    let snitchTimeout;
    let snitchAlertTimeout;
    let snitchActive = false;

    // High Score logic
    const storageKey = 'vico_score_papersniper';
    let highScore = parseInt(localStorage.getItem(storageKey)) || 0;

    // --- Core Boss Behavior Loop ---
    function setBossState(stateLevel) {
        bossState = stateLevel;
        
        switch(stateLevel) {
            case 0:
                bossChar.className = 'boss writing';
                bossChar.textContent = stateEmojis.writing;
                // Faster pacing based on difficulty
                bossStateTimeout = setTimeout(() => setBossState(1), randomTime(1000, 3000) / difficultyFactor);
                break;
            case 1:
                bossChar.className = 'boss turning';
                bossChar.textContent = stateEmojis.turning;
                // Danger warning shrinks!
                bossStateTimeout = setTimeout(() => setBossState(2), randomTime(500, 900) / difficultyFactor);
                break;
            case 2:
                bossChar.className = 'boss looking';
                bossChar.textContent = stateEmojis.looking;
                if (activeThrows > 0) {
                    triggerCaught(false);
                    return;
                }
                bossStateTimeout = setTimeout(() => setBossState(0), randomTime(1000, 2500) / difficultyFactor);
                break;
        }
    }

    function randomTime(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    function triggerCaught(bySnitch) {
        if (isCaught || timeUp) return;
        isCaught = true;
        endGame(true, bySnitch); // true = caught
    }

    function gameLoop() {
        if (!isCaught && !timeUp) {
            // Move Boss horizontally
            bossX += (bossSpeed * bossDirection * difficultyFactor);
            const maxRight = gameArea.clientWidth - 150; // bounds
            if (bossX >= maxRight) { bossX = maxRight; bossDirection = -1; }
            if (bossX <= 10) { bossX = 10; bossDirection = 1; }
            
            bossContainer.style.left = `${bossX}px`;

            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

    function scheduleSnitch() {
        if (timeUp || isCaught) return;
        // The snitch spawns every 5-15 seconds
        snitchTimeout = setTimeout(() => {
            if (timeUp || isCaught) return;
            spawnSnitch();
        }, randomTime(5000, 15000));
    }

    function spawnSnitch() {
        snitchActive = true;
        snitchChar.classList.add('up');
        snitchChar.textContent = '🤓';

        // You have 4 seconds to hit him
        const windowTime = Math.max(2000, 4000 / difficultyFactor);
        
        snitchAlertTimeout = setTimeout(() => {
            if (snitchActive && !isCaught && !timeUp) {
                // He told on you!
                snitchChar.textContent = '🗣️';
                triggerCaught(true); // by snitch
            }
        }, windowTime);
    }

    // --- Player Actions ---
    gameArea.addEventListener('mousedown', throwAirplane);

    function throwAirplane(e) {
        if (timeUp || isCaught || !startScreen.classList.contains('hidden')) return;
        if(e.target.id === 'start-btn' || e.target.closest('.modal') || e.target.closest('.overlay-screen')) return;

        // Check if we aimed properly at targets BEFORE animating
        // We calculate target coordinates, even if moving
        const isBossHit = e.target.closest('#boss-container') || e.target.closest('#boss-character');
        const isSnitchHit = e.target.id === 'snitch-character';
        const isMiss = !isBossHit && !isSnitchHit;

        if (isMiss) {
            // Broke combo!
            resetCombo();
        }

        activeThrows++;
        
        const airplane = document.createElement('div');
        airplane.className = 'airplane';
        airplane.textContent = '✈️';
        airplane.style.top = '100%';
        airplane.style.left = '50%';
        airplane.style.transform = `translate(-50%, 0) rotate(0deg) scale(1)`;

        gameArea.appendChild(airplane);
        void airplane.offsetWidth;

        // Target coordinates from click
        const areaRect = gameArea.getBoundingClientRect();
        const targetX = e.clientX - areaRect.left;
        const targetY = e.clientY - areaRect.top;

        airplane.style.top = `${targetY}px`;
        airplane.style.left = `${targetX}px`;
        airplane.style.transform = `translate(-50%, -50%) rotate(15deg) scale(0.5)`;

        setTimeout(() => {
            airplane.remove();
            activeThrows--;

            if (isCaught || timeUp) return;

            if (isBossHit) {
                if (bossState === 2) {
                    // Boss is looking! Caught!
                    triggerCaught(false);
                } else {
                    // Safe Hit!
                    applyCombo();
                    let pts = 10 * comboMultiplier;
                    score += pts;
                    scoreDisplay.textContent = score;
                    showImpact(targetX, targetY);
                    showFloatingText(`+${pts}`, targetX, targetY, '#fff');
                }
            } else if (isSnitchHit && snitchActive) {
                // Snitch silenced
                snitchActive = false;
                snitchChar.textContent = '😵';
                clearTimeout(snitchAlertTimeout);
                
                let pts = 20 * comboMultiplier;
                score += pts;
                scoreDisplay.textContent = score;
                showImpact(targetX, targetY);
                showFloatingText(`+${pts} SOPLÓN!`, targetX, targetY, '#ffeb3b');
                
                setTimeout(() => {
                    snitchChar.classList.remove('up');
                    scheduleSnitch();
                }, 800);
            }
        }, 350);
    }

    function showImpact(x, y) {
        const impact = document.createElement('div');
        impact.className = 'hit-effect';
        impact.textContent = '💥';
        impact.style.top = `${y}px`;
        impact.style.left = `${x}px`;
        gameArea.appendChild(impact);
        setTimeout(() => impact.remove(), 500);
    }

    function showFloatingText(text, x, y, color = '#fff') {
        const floatText = document.createElement('div');
        floatText.className = 'floating-text';
        floatText.textContent = text;
        floatText.style.top = `${y}px`;
        floatText.style.left = `${x}px`;
        floatText.style.color = color;
        gameArea.appendChild(floatText);
        setTimeout(() => floatText.remove(), 800);
    }

    function applyCombo() {
        comboHits++;
        if (comboHits >= 3) {
            comboMultiplier = Math.floor(comboHits / 3) + 1; // x2 at 3, x3 at 6...
            comboDisplay.textContent = `x${comboMultiplier} COMBO!`;
            comboDisplay.classList.remove('hidden');
            
            // Re-trigger CSS animation
            comboDisplay.style.animation = 'none';
            void comboDisplay.offsetWidth; // force reflow
            comboDisplay.style.animation = null;

            // Jitter screen on combo
            gameArea.style.transform = 'translateY(5px)';
            setTimeout(() => gameArea.style.transform = 'translateY(0)', 50);
        }
    }

    function resetCombo() {
        comboHits = 0;
        comboMultiplier = 1;
        comboDisplay.classList.add('hidden');
    }

    // --- Game Lifecycle ---
    function startGame() {
        score = 0;
        maxTime = 60;
        timeUp = false;
        isCaught = false;
        activeThrows = 0;
        difficultyFactor = 1;
        bossSpeed = 2; // Always positive
        bossDirection = Math.random() < 0.5 ? 1 : -1;
        snitchActive = false;
        snitchChar.classList.remove('up');
        clearTimeout(snitchAlertTimeout);
        clearTimeout(snitchTimeout);
        resetCombo();

        scoreDisplay.textContent = score;
        timeDisplay.textContent = maxTime;

        startScreen.classList.add('hidden');
        gameOverModal.classList.add('hidden');

        document.querySelectorAll('.airplane, .hit-effect').forEach(el => el.remove());

        // Start behaviors
        setBossState(0);
        gameLoop();
        scheduleSnitch();

        timerInterval = setInterval(() => {
            if (isCaught) return;

            maxTime--;
            timeDisplay.textContent = maxTime;

            // Increase difficulty
            difficultyFactor = 1 + ((60 - maxTime) / 30); // reaches 3.0 at 0s

            if (maxTime <= 0) {
                endGame(false, false);
            }
        }, 1000);
    }

    function endGame(caught, bySnitch = false) {
        clearInterval(timerInterval);
        clearTimeout(bossStateTimeout);
        clearTimeout(snitchTimeout);
        clearTimeout(snitchAlertTimeout);
        cancelAnimationFrame(animationFrameId);
        timeUp = true;
        
        if (caught) {
            endTitle.textContent = "¡ESTÁS DESPEDIDO!";
            endTitle.style.color = "#d32f2f";
            if (bySnitch) {
                endMessage.textContent = "El soplón de la oficina le avisó al presentador que estabas tirando aviones.";
                bossChar.textContent = '🤦‍♂️';
            } else {
                endMessage.textContent = "El presentador te descubrió lanzando el avión de papel. F.";
                bossChar.textContent = '😡';
            }
        } else {
            endTitle.textContent = "¡Sobreviviste!";
            endTitle.style.color = "#2e7d32";
            endMessage.textContent = "Terminó la capacitación exitosamente.";
        }

        finalScore.textContent = score;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem(storageKey, highScore);
            highScoreMsg.textContent = "¡NUEVO RÉCORD DE FRANCOTIRADOR!";
        } else {
            highScoreMsg.textContent = `Récord Histórico: ${highScore} pts`;
        }

        setTimeout(() => {
            gameOverModal.classList.remove('hidden');
        }, 800);
    }

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);

    // --- BOSS SCREEN (Panic Button) ---
    const bossScreen = document.getElementById('boss-screen');
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (bossScreen) {
                bossScreen.classList.toggle('hidden');
            }
        }
    });
});
