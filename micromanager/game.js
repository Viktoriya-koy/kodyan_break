document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const gameArea = document.getElementById('game-area');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const gameOverModal = document.getElementById('game-over-modal');
    const restartBtn = document.getElementById('restart-btn');
    const finalScore = document.getElementById('final-score');
    const highScoreMsg = document.getElementById('high-score-msg');

    const playerEl = document.getElementById('player');
    const managerEl = document.getElementById('micromanager');
    const speechBubble = document.getElementById('speech-bubble');
    const worldEl = document.getElementById('world');
    const floorTexture = document.querySelector('.floor-texture');
    const bgFar = document.getElementById('bg-far');
    const bgMid = document.getElementById('bg-mid');

    // Game Physics & State
    let isPlaying = false;
    let score = 0;
    let currentLevel = 1;
    let animationFrameId;
    
    // Player
    const GRAVITY = 0.8;
    const JUMP_FORCE = 15;
    let playerY = 0;
    let playerVY = 0;
    let isJumping = false;
    let isDucking = false;
    
    // World Speed
    let baseSpeed = 6;
    let currentSpeed = 6;
    let bgOffsetFar = 0;
    let bgOffsetMid = 0;
    let floorOffset = 0;

    // Obstacles
    let obstacles = [];
    const obstacleEmojis = [
        { emoji: '🖨️', width: 50, height: 50, bottomOffset: 0 },
        { emoji: '☕', width: 40, height: 40, bottomOffset: 0 },
        { emoji: '📚', width: 40, height: 60, bottomOffset: 0 },
        { emoji: '📧', width: 40, height: 40, bottomOffset: 45 }, // Flying email
        { emoji: '✈️', width: 40, height: 40, bottomOffset: 50 }  // Paper airplane
    ];
    let framesSinceLastObstacle = 0;
    let nextObstacleInterval = 80;

    // Manager AI
    const phrases = [
        "¿Ya mandaste el Excel?",
        "Ese reporte era para ayer.",
        "Quedémonos 5 minutitos más.",
        "¿Viste el mail que te mandé?",
        "Hagamos una call rapidita."
    ];
    let managerX = 10;
    let managerTargetX = 10;

    // High Score logic
    const storageKey = 'vico_score_micromanager';
    let highScore = parseInt(localStorage.getItem(storageKey)) || 0;

    // Input Handling
    function handleJump() {
        if (!isPlaying || isDucking) return;
        if (!isJumping) {
            playerVY = JUMP_FORCE;
            isJumping = true;
            playerEl.classList.add('jumping');
            playerEl.classList.remove('run-anim');
        }
    }

    function handleDuck(isDown) {
        if (!isPlaying || isJumping) return;
        isDucking = isDown;
        if (isDucking) {
            playerEl.classList.add('ducking');
            playerEl.classList.remove('run-anim');
        } else {
            playerEl.classList.remove('ducking');
            playerEl.classList.add('run-anim');
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            handleJump();
        }
        if (e.code === 'ArrowDown') {
            e.preventDefault();
            handleDuck(true);
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowDown') {
            e.preventDefault();
            handleDuck(false);
        }
    });

    gameArea.addEventListener('mousedown', (e) => {
        if (e.target.closest('.modal') || e.target.closest('.overlay-screen')) return;
        
        const rect = gameArea.getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) {
            handleJump(); // Clicked top half
        } else {
            handleDuck(true); // Clicked bottom half
        }
    });
    
    gameArea.addEventListener('mouseup', () => handleDuck(false));
    gameArea.addEventListener('mouseleave', () => handleDuck(false));

    // Main Update Loop
    function gameLoop() {
        if (!isPlaying) return;

        // 1. Difficulty Scaling
        currentSpeed = baseSpeed + (score / 500); // gets faster over time

        // 2. Player Physics
        playerVY -= GRAVITY;
        playerY += playerVY;

        if (playerY <= 0) {
            playerY = 0;
            if (isJumping) {
                isJumping = false;
                playerEl.classList.remove('jumping');
                playerEl.classList.add('run-anim');
            }
        }
        playerEl.style.bottom = `${40 + playerY}px`; // 40 is floor height

        // 3. World Scrolling
        floorOffset -= currentSpeed;
        floorTexture.style.transform = `translateX(${floorOffset % 100}px)`; // loop texture

        bgOffsetFar -= currentSpeed * 0.1;
        bgFar.style.transform = `translateX(${bgOffsetFar % 200}px)`;

        bgOffsetMid -= currentSpeed * 0.3;
        bgMid.style.transform = `translateX(${bgOffsetMid % 200}px)`;

        // Score & Leveling
        score += currentSpeed * 0.05;
        scoreDisplay.textContent = Math.floor(score);

        if (Math.floor(score) >= currentLevel * 500) {
            levelUp();
        }

        // 4. Obstacles
        framesSinceLastObstacle++;
        if (framesSinceLastObstacle >= nextObstacleInterval) {
            spawnObstacle();
            framesSinceLastObstacle = 0;
            // Spawn interval randomly between 60 to 120 frames minus speed factor
            nextObstacleInterval = Math.max(40, Math.floor(Math.random() * 60 + 60 - (currentSpeed * 2)));
        }

        updateObstacles();

        // 5. Manager AI logic
        updateManager();

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function spawnObstacle() {
        const type = obstacleEmojis[Math.floor(Math.random() * obstacleEmojis.length)];
        const el = document.createElement('div');
        el.className = 'obstacle';
        el.textContent = type.emoji;
        el.style.left = `${gameArea.clientWidth + 50}px`;
        el.style.bottom = `${40 + type.bottomOffset}px`; // dynamic height
        
        worldEl.appendChild(el);

        obstacles.push({
            el: el,
            x: gameArea.clientWidth + 50,
            width: type.width,
            height: type.height,
            bottomOffset: type.bottomOffset
        });
    }

    function updateObstacles() {
        // Player absolute X position is fixed via CSS at left: 150px;
        const playerX = 150;
        const playerW = 50; // visual width of runner

        obstacles.forEach((obs, index) => {
            obs.x -= currentSpeed;
            obs.el.style.left = `${obs.x}px`;

            // Collision Detection
            // Using a generous hitbox box (AABB)
            const pRight = playerX + playerW - 15;
            const pLeft = playerX + 15;
            const pBottom = playerY; // Ground is 0
            const pTop = playerY + (isDucking ? 30 : 60); // ducking halves height

            const oLeft = obs.x + 10;
            const oRight = obs.x + obs.width - 10;
            const oBottom = obs.bottomOffset; 
            const oTop = obs.bottomOffset + obs.height - 10; 

            // Check AABB Overlap (Must overlap on both axes)
            if (pRight > oLeft && pLeft < oRight && pTop > oBottom && pBottom < oTop) {
                // HIT!
                endGame();
            }

            // Remove if off screen
            if (obs.x < -100) {
                obs.el.remove();
                obstacles.splice(index, 1);
            }
        });
    }

    function updateManager() {
        // Manager bobs up and down and says things
        if (Math.random() < 0.005) {
            // Talk!
            speechBubble.textContent = phrases[Math.floor(Math.random() * phrases.length)];
            speechBubble.classList.remove('hidden');
            
            // Manager lurches forward
            managerTargetX = 60; 
            
            setTimeout(() => {
                speechBubble.classList.add('hidden');
                managerTargetX = 10; // drift back
            }, 3000);
        }

        managerX += (managerTargetX - managerX) * 0.05;
        managerEl.style.left = `${managerX}px`;
    }

    function levelUp() {
        currentLevel++;
        levelDisplay.textContent = currentLevel;

        const banner = document.createElement('div');
        banner.className = 'level-banner';
        banner.textContent = `¡NIVEL ${currentLevel}!`;
        gameArea.appendChild(banner);
        setTimeout(() => banner.remove(), 2000);
    }

    function startGame() {
        score = 0;
        currentLevel = 1;
        levelDisplay.textContent = currentLevel;
        playerY = 0;
        playerVY = 0;
        currentSpeed = baseSpeed;
        isJumping = false;
        framesSinceLastObstacle = 0;
        
        obstacles.forEach(o => o.el.remove());
        obstacles = [];

        startScreen.classList.add('hidden');
        gameOverModal.classList.add('hidden');
        speechBubble.classList.add('hidden');
        
        playerEl.classList.add('run-anim');
        managerEl.classList.add('run-anim');

        isPlaying = true;
        gameLoop();
    }

    function endGame() {
        isPlaying = false;
        cancelAnimationFrame(animationFrameId);
        
        playerEl.classList.remove('run-anim');
        managerEl.classList.remove('run-anim');
        playerEl.querySelector('.char-emoji').textContent = '😵';
        managerEl.style.left = `${150 - 40}px`; // Manager catches up exactly

        const finalVal = Math.floor(score);
        finalScore.textContent = finalVal;

        if (finalVal > highScore) {
            highScore = finalVal;
            localStorage.setItem(storageKey, highScore);
            highScoreMsg.textContent = "¡NUEVO RÉCORD DE HUÍDA!";
        } else {
            highScoreMsg.textContent = `Récord Histórico: ${highScore}m`;
        }

        setTimeout(() => {
            gameOverModal.classList.remove('hidden');
            // reset runner icon for next game
            playerEl.querySelector('.char-emoji').textContent = '🏃‍♂️';
        }, 1000);
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
