document.addEventListener('DOMContentLoaded', () => {
    // Game Elements
    const board = document.getElementById('board');
    const startBtn = document.getElementById('start-btn');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('time');
    const bosses = document.querySelectorAll('.boss');
    
    // Modal Elements
    const gameOverModal = document.getElementById('game-over-modal');
    const startScreen = document.getElementById('start-screen');
    const finalScoreDisplay = document.getElementById('final-score');
    const highScoreMsg = document.getElementById('high-score-msg');
    const restartBtn = document.getElementById('restart-btn');

    // Game variables
    let score = 0;
    let timeUp = false;
    let timer;
    let maxTime = 30; // 30 seconds game
    let lastCubicle;
    let popInterval;

    const bossFaces = ['🧛‍♂️', '🧟‍♂️', '🧔🏻‍♂️', '😡'];
    const colleagues = ['👨‍💻', '👩‍💻', '🍕', '☕', '🪴'];

    // Local Storage Data
    const storageKey = 'vico_score_whackboss';
    let highScore = parseInt(localStorage.getItem(storageKey)) || 0;

    const gameContainer = document.querySelector('.game-container');

    // --- Game Logic ---
    function randomTime(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }

    function randomCubicle() {
        const idx = Math.floor(Math.random() * bosses.length);
        const cb = bosses[idx];
        if (cb === lastCubicle) {
            return randomCubicle();
        }
        lastCubicle = cb;
        return cb;
    }

    function popUp() {
        const time = randomTime(600, 1300); // Slightly slower so they can see who it is
        const boss = randomCubicle();
        
        // Randomize face: 40% chance it's a Boss, 60% chance it's a colleague/snack
        const isBoss = Math.random() < 0.4;
        boss.dataset.type = isBoss ? 'boss' : 'colleague';
        
        if (isBoss) {
            boss.textContent = bossFaces[Math.floor(Math.random() * bossFaces.length)];
        } else {
            boss.textContent = colleagues[Math.floor(Math.random() * colleagues.length)];
        }
        
        // Ensure no hit classes remain
        boss.classList.remove('hit', 'hit-wrong', 'up');
        // Force reflow to reset transition if needed
        void boss.offsetWidth;
        boss.classList.add('up');
        
        // Save the timeout ID to the element so we can clear it if whacked
        boss.popTimeout = setTimeout(() => {
            boss.classList.remove('up');
            if (!timeUp) popUp();
        }, time);
    }

    function startGame() {
        score = 0;
        maxTime = 30;
        timeUp = false;
        scoreDisplay.textContent = score;
        timeDisplay.textContent = maxTime;
        startBtn.disabled = true;
        
        gameOverModal.classList.add('hidden');
        startScreen.classList.add('hidden');
        gameContainer.classList.add('playing');
        
        // Distribute faces initially
        bosses.forEach(b => {
            b.classList.remove('hit', 'hit-wrong', 'up');
            b.textContent = '';
        });

        // Start Pop up loop
        popUp();
        
        // Start Timer
        timer = setInterval(() => {
            maxTime--;
            timeDisplay.textContent = maxTime;
            
            if (maxTime <= 0) {
                endGame();
            }
        }, 1000);
    }

    function whack(e) {
        if (!e.isTrusted) return; // cheat prevention
        if (timeUp) return; // avoid hitting after game over
        
        // Only count if it's currently up AND not already hit
        if (this.classList.contains('up') && !this.classList.contains('hit') && !this.classList.contains('hit-wrong')) {
            // Stop it from going down naturally
            clearTimeout(this.popTimeout);
            
            this.classList.remove('up');

            if (this.dataset.type === 'boss') {
                score += 10;
                this.classList.add('hit');
                // Use a single hit emoji for bosses to keep it clear
                this.textContent = '💥';
            } else {
                score -= 10;
                this.classList.add('hit-wrong');
                this.textContent = '❌';
            }
            
            scoreDisplay.textContent = score;

            // Remove explosion/cross after a moment
            setTimeout(() => {
                this.classList.remove('hit', 'hit-wrong');
                this.textContent = '';
            }, 500);
            
            // Pop the next target
            if (!timeUp) {
                setTimeout(popUp, 200);
            }
        }
    }

    function endGame() {
        clearInterval(timer);
        timeUp = true;
        startBtn.disabled = false;
        gameContainer.classList.remove('playing');
        
        // Clean board
        bosses.forEach(b => {
            clearTimeout(b.popTimeout);
            b.classList.remove('up', 'hit', 'hit-wrong');
        });

        // High Score Logic
        if (score > highScore) {
            highScore = score;
            localStorage.setItem(storageKey, highScore);
            highScoreMsg.textContent = "¡NUEVO RÉCORD de Control de Estrés!";
        } else {
            highScoreMsg.textContent = `Puntuación máxima histórica: ${highScore}`;
        }

        finalScoreDisplay.textContent = score;
        gameOverModal.classList.remove('hidden');
    }

    // Assign hit event to bosses
    bosses.forEach(boss => {
        // use both mousedown to be responsive
        boss.addEventListener('mousedown', whack);
    });

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
