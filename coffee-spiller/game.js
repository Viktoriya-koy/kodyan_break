document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const gameArea = document.getElementById('game-area');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('time');
    const levelDisplay = document.getElementById('level');
    const targetDisplay = document.getElementById('target');
    
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const gameOverModal = document.getElementById('game-over-modal');
    const restartBtn = document.getElementById('restart-btn');
    const finalScore = document.getElementById('final-score');
    const highScoreMsg = document.getElementById('high-score-msg');

    // Game variables
    let score = 0;
    let maxTime = 30;
    let timeUp = false;
    let timerInterval;
    let animationFrameId;
    
    // Level progression
    let currentLevel = 1;
    let targetScore = 50;
    let difficultySpeed = 1;
    let difficultySpawn = 1;
    
    // Entities
    let characters = []; // array of { el, x, speed, isBoss, active }
    let coffees = [];    // array of { el, x, y, speedY, active }
    
    let timeSinceLastSpawn = 0;

    const bossEmojis = ['🤵‍♂️', '🕴️'];
    const coworkerEmojis = ['👨‍💻', '👩‍💼', '🚶‍♂️', '🏃‍♀️'];

    // High Score logic
    const storageKey = 'vico_score_coffeespiller';
    let highScore = parseInt(localStorage.getItem(storageKey)) || 0;

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // --- Main Game Loop ---
    let lastTime = performance.now();
    function gameLoop(timestamp) {
        if (timeUp) return;
        
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        // Spawn Characters
        timeSinceLastSpawn += deltaTime;
        if (timeSinceLastSpawn > random(1500, 3000) * difficultySpawn) {
            spawnCharacter();
            timeSinceLastSpawn = 0;
        }

        updateCharacters(deltaTime);
        updateCoffees(deltaTime);
        checkCollisions();

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // --- Entities Logic ---
    function spawnCharacter() {
        const isBoss = Math.random() < 0.4; // 40% chance boss
        const facingLeft = Math.random() < 0.5;
        
        const el = document.createElement('div');
        el.className = `character ${isBoss ? 'boss-char' : 'colleague-char'}`;
        
        // Pick emoji
        let emojiArr = isBoss ? bossEmojis : coworkerEmojis;
        let selectedEmoji = emojiArr[Math.floor(Math.random() * emojiArr.length)];
        
        el.innerHTML = `
            <div class="char-label">${isBoss ? '🔥 JEFE' : '🛡️ COLEGA'}</div>
            <div class="char-emoji">${selectedEmoji}</div>
        `;
        
        const speed = (isBoss ? random(0.1, 0.25) : random(0.08, 0.35)) * difficultySpeed; 
        
        const startX = facingLeft ? gameArea.clientWidth + 50 : -100;
        const dir = facingLeft ? -1 : 1;

        if (facingLeft) el.classList.add('walking-left');

        el.style.left = `${startX}px`;
        gameArea.appendChild(el);

        characters.push({
            el: el,
            x: startX,
            speed: speed * dir,
            isBoss: isBoss,
            active: true
        });
    }

    function updateCharacters(dt) {
        characters.forEach(char => {
            if (!char.active) return;
            char.x += char.speed * dt;
            char.el.style.left = `${char.x}px`;

            // Remove if out of bounds
            if ((char.speed > 0 && char.x > gameArea.clientWidth + 150) || 
                (char.speed < 0 && char.x < -150)) {
                char.active = false;
                char.el.remove();
            }
        });
        characters = characters.filter(c => c.active);
    }

    // --- Coffee Throwing ---
    gameArea.addEventListener('mousedown', (e) => {
        if (timeUp || !startScreen.classList.contains('hidden')) return;
        if (e.target.closest('.modal') || e.target.closest('.overlay-screen')) return;

        const rect = gameArea.getBoundingClientRect();
        const dropX = e.clientX - rect.left;

        spawnCoffee(dropX);
    });

    function spawnCoffee(x) {
        const el = document.createElement('div');
        el.className = 'coffee-cup';
        el.textContent = '☕';
        
        el.style.left = `${x}px`;
        el.style.top = `-50px`;
        gameArea.appendChild(el);

        coffees.push({
            el: el,
            x: x,
            y: -50,
            speedY: 0.6, // fall speed
            active: true
        });
    }

    function updateCoffees(dt) {
        coffees.forEach(coffee => {
            if (!coffee.active) return;
            coffee.y += coffee.speedY * dt;
            // Accelerate slightly (gravity)
            coffee.speedY += 0.002 * dt; 

            coffee.el.style.top = `${coffee.y}px`;

            // Missed the floor
            if (coffee.y > gameArea.clientHeight - 80) { // Height of floor area
                coffee.active = false;
                coffee.el.remove();
                createSplash(coffee.x, gameArea.clientHeight - 20, false);
            }
        });
        coffees = coffees.filter(c => c.active);
    }

    // --- Collision Detection ---
    function checkCollisions() {
        // AABB check (Axis-Aligned Bounding Box)
        // Character hitboxes: font-size 80px => ~w: 60px, h: 80px
        // But characters change horizontally
        
        coffees.forEach(coffee => {
            if (!coffee.active) return;

            // Approximate coffee box (center is coffee.x, top is coffee.y, size ~ 40px)
            const cw = 40; const ch = 40;
            const cx = coffee.x; // left
            const cy = coffee.y; // top
            const cBottom = cy + ch;
            const cRight = cx + cw;

            characters.forEach(char => {
                if (!char.active || !coffee.active) return;

                const charW = 60; // visual width
                const charH = 80;
                // Since char.x is left, but it's an emoji with letter spacing potentially
                // We'll allow a generous horizontally centered hit box.
                const charCenterX = char.x + 40; 
                const charLeft = charCenterX - 35;
                const charRight = charCenterX + 35;
                const charTop = gameArea.clientHeight - 20 - charH; // bottom is 20px
                
                if (cBottom > charTop && cx < charRight && cRight > charLeft) {
                    // HIT!
                    coffee.active = false;
                    coffee.el.remove();
                    
                    handleHit(char, coffee.x, cBottom);
                }
            });
        });
    }

    function handleHit(char, hitX, hitY) {
        // Stop the character briefly or mark them
        char.el.style.filter = 'sepia(1) hue-rotate(-50deg) saturate(3) drop-shadow(0 0 5px brown)'; 
        char.el.querySelector('.char-emoji').textContent = '🤬';
        char.speed *= 1.5; // Runs away faster!

        createSplash(hitX, hitY, true);

        if (char.isBoss) {
            score += 10;
            showFloatingText('+10 JEFE!', hitX, hitY - 40, '#4caf50');
        } else {
            score -= 10;
            showFloatingText('-10 COLEGA', hitX, hitY - 40, '#f44336');
        }

        scoreDisplay.textContent = score;

        if (score >= targetScore) {
            levelUp();
        }

        // Ensure we don't hit the same guy multiple times easily
        char.active = false; 
        setTimeout(() => { if (char.el.parentNode) char.el.remove(); }, 1500);
    }

    function createSplash(x, y, isDirectHit) {
        const splash = document.createElement('div');
        splash.className = 'splash-effect';
        splash.style.left = `${x}px`;
        splash.style.top = `${y}px`;
        // Darker for miss, slightly visible for hit
        if(isDirectHit) splash.style.opacity = '0.5';

        gameArea.appendChild(splash);
        setTimeout(() => splash.remove(), 1000);
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

    function levelUp() {
        currentLevel++;
        targetScore += currentLevel * 50; 
        
        difficultySpeed += 0.25; // Characters run 25% faster
        difficultySpawn *= 0.8;  // Spawns 20% more frequently

        maxTime = 30; // Refill clock
        
        levelDisplay.textContent = currentLevel;
        targetDisplay.textContent = targetScore;
        timeDisplay.textContent = maxTime;

        // Clear existing characters to give room
        characters.forEach(c => {
            c.active = false;
            c.el.remove();
        });

        // Show banner
        const banner = document.createElement('div');
        banner.className = 'level-banner';
        banner.textContent = `¡NIVEL ${currentLevel}!`;
        gameArea.appendChild(banner);
        setTimeout(() => banner.remove(), 2000);
    }

    // --- Game Lifecycle ---
    function startGame() {
        score = 0;
        maxTime = 30;
        timeUp = false;
        
        currentLevel = 1;
        targetScore = 50;
        difficultySpeed = 1;
        difficultySpawn = 1;

        levelDisplay.textContent = currentLevel;
        targetDisplay.textContent = targetScore;
        scoreDisplay.textContent = score;
        timeDisplay.textContent = maxTime;

        characters.forEach(c => c.el.remove());
        coffees.forEach(c => c.el.remove());
        characters = [];
        coffees = [];
        timeSinceLastSpawn = 0;

        startScreen.classList.add('hidden');
        gameOverModal.classList.add('hidden');

        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(gameLoop);

        timerInterval = setInterval(() => {
            maxTime--;
            timeDisplay.textContent = maxTime;

            if (maxTime <= 0) {
                if (score < targetScore) {
                    endGame(); // Fin del Juego
                } else {
                    // Edge case safety (usually handled in handleHit immediately)
                    levelUp();
                }
            }
        }, 1000);
    }

    function endGame() {
        timeUp = true;
        clearInterval(timerInterval);
        cancelAnimationFrame(animationFrameId);
        
        finalScore.textContent = score;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem(storageKey, highScore);
            highScoreMsg.textContent = "¡NUEVO RÉCORD DE CAFÉ!";
        } else {
            highScoreMsg.textContent = `Récord Histórico: ${highScore} pts`;
        }

        setTimeout(() => {
            gameOverModal.classList.remove('hidden');
        }, 500);
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
