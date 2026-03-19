document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const creationPanel = document.getElementById('creation-panel');
    const weaponPanel = document.getElementById('weapon-panel');
    const faceGrid = document.getElementById('face-grid');
    const dummyFace = document.getElementById('dummy-face');
    const dummyContainer = document.getElementById('dummy');
    const physicsWrapper = document.getElementById('physics-wrapper');
    const marksContainer = document.getElementById('marks-container');
    const gameArea = document.getElementById('game-area');
    const stressContainer = document.getElementById('stress-container');
    const stressBar = document.getElementById('stress-bar');
    const stressText = document.getElementById('stress-text');
    
    const startBtn = document.getElementById('start-btn');
    const clearBtn = document.getElementById('clear-btn');
    const editBtn = document.getElementById('edit-btn');
    const weaponBtns = document.querySelectorAll('.weapon-btn');

    // --- State ---
    let currentWeapon = 'punch'; // punch, tomato, coffee, pin, postit, keyboard
    let hits = 0;
    let stress = 0;
    let isExploding = false;

    // Physics State
    let posX = 0;
    let posY = 0;
    let vx = 0;
    let vy = 0;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let currentGlobalMouseX = -1000;
    let currentGlobalMouseY = -1000;

    const weaponsData = {
        punch: { damage: 5, action: 'golpea' },
        keyboard: { damage: 25, action: 'golpea' },
        tomato: { damage: 8, action: 'lanza' },
        coffee: { damage: 6, action: 'lanza' },
        pin: { damage: 2, action: 'clava' },
        stapler: { damage: 3, action: 'clava' },
        postit: { damage: 1, action: 'pega' },
        airplane: { damage: 5, action: 'lanza' },
        cactus: { damage: 15, action: 'lanza' },
        extinguisher: { damage: 4, action: 'lanza' }
    };

    // No points tracked here anymore.

    // On Load: Unlock purchased weapons
    document.querySelectorAll('.weapon-btn').forEach(btn => {
        const weapon = btn.dataset.weapon;
        if (btn.classList.contains('locked')) {
            if (localStorage.getItem('vico_unlocked_' + weapon) === 'true') {
                btn.classList.remove('locked');
                const priceBadge = btn.querySelector('.price');
                if(priceBadge) priceBadge.remove();
            }
        }
    });

    // --- Customization Logic ---
    faceGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('emoji-choice')) {
            document.querySelectorAll('#face-grid .emoji-choice').forEach(el => el.classList.remove('selected'));
            e.target.classList.add('selected');
            dummyFace.textContent = e.target.textContent;
        }
    });

    // --- Weapon Selection ---
    weaponPanel.addEventListener('click', (e) => {
        const btn = e.target.closest('.weapon-btn');
        if (btn) {
            document.querySelectorAll('.weapon-btn').forEach(el => el.classList.remove('selected'));
            btn.classList.add('selected');
            currentWeapon = btn.dataset.weapon;
        }
    });

    // --- Navigation ---
    startBtn.addEventListener('click', () => {
        creationPanel.classList.add('hidden');
        weaponPanel.classList.remove('hidden');
        stressContainer.classList.remove('hidden');
        stress = 0;
        updateStress();
        resetPhysics();
    });

    editBtn.addEventListener('click', () => {
        weaponPanel.classList.add('hidden');
        creationPanel.classList.remove('hidden');
        stressContainer.classList.add('hidden');
        clearMarks();
        resetPhysics();
    });

    // --- Weapon Selection ---
    weaponBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            weaponBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            currentWeapon = btn.dataset.weapon;
        });
    });

    clearBtn.addEventListener('click', clearMarks);

    function clearMarks() {
        marksContainer.innerHTML = '';
        dummyFace.textContent = document.querySelector('#face-grid .selected').textContent; // restore face
    }

    // --- Físicas & Loop ---
    function resetPhysics() {
        posX = 0; posY = 0; vx = 0; vy = 0;
        physicsWrapper.style.transform = `translate(-50%, -50%)`;
    }

    function updatePhysics() {
        if (!creationPanel.classList.contains('hidden') || isExploding) {
            return requestAnimationFrame(updatePhysics);
        }

        if (!isDragging) {
            // --- Evasion Logic (Dodge Mouse) ---
            const rect = gameArea.getBoundingClientRect();
            
            // Only dodge if mouse is roughly inside the game area
            if (currentGlobalMouseX > rect.left && currentGlobalMouseX < rect.right && 
                currentGlobalMouseY > rect.top && currentGlobalMouseY < rect.bottom) {
                
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dummyAbsX = centerX + posX;
                const dummyAbsY = centerY + posY;
                
                const dx = dummyAbsX - currentGlobalMouseX;
                const dy = dummyAbsY - currentGlobalMouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 180 && dist > 0) {
                    // Panic! Add repulsion force
                    const panicForce = (180 - dist) * 0.05;
                    vx += (dx / dist) * panicForce;
                    vy += (dy / dist) * panicForce - 0.5; // slight upward jump impulse
                    
                    if (dummyFace.textContent !== '🤕' && dummyFace.textContent !== '😵') {
                        dummyFace.textContent = '😰'; // scared face
                    }
                } else if (dummyFace.textContent === '😰') {
                    dummyFace.textContent = document.querySelector('#face-grid .selected').textContent; // revert
                }
            }

            // Apply Gravity and Friction
            vy += 0.8;
            vx *= 0.96;
            vy *= 0.96;

            posX += vx;
            posY += vy;

            // Boundaries
            const maxX = (gameArea.clientWidth / 2) - 100;
            const maxY = (gameArea.clientHeight / 2) - 175;

            let bounced = false;

            if (posX > maxX) { posX = maxX; vx *= -0.7; bounced = true; }
            if (posX < -maxX) { posX = -maxX; vx *= -0.7; bounced = true; }
            if (posY > maxY) { posY = maxY; vy *= -0.7; vx *= 0.9; bounced = true; } // Floor friction
            if (posY < -maxY) { posY = -maxY; vy *= -0.7; bounced = true; }

            if (bounced && (Math.abs(vx) > 3 || Math.abs(vy) > 3)) {
                triggerLimb();
                updateStress(0.5); // Wall hits hurt a bit
            }

            physicsWrapper.style.transform = `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px))`;
        }

        requestAnimationFrame(updatePhysics);
    }
    requestAnimationFrame(updatePhysics);

    window.addEventListener('mousemove', (e) => {
        currentGlobalMouseX = e.clientX;
        currentGlobalMouseY = e.clientY;

        if (!isDragging) return;
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        
        posX += dx;
        posY += dy;
        
        vx = dx * 0.6; // Throw velocity
        vy = dy * 0.6;
        
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        
        physicsWrapper.style.transform = `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px))`;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // --- Game Logic ---
    gameArea.addEventListener('mousedown', (e) => {
        if (!creationPanel.classList.contains('hidden')) return;
        if (e.target.closest('.sidebar') || isExploding) return;

        const rect = marksContainer.getBoundingClientRect();
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;

        const dummyRect = dummyContainer.getBoundingClientRect();
        const isHit = (e.clientX >= dummyRect.left && e.clientX <= dummyRect.right &&
                       e.clientY >= dummyRect.top && e.clientY <= dummyRect.bottom);

        if (isHit && currentWeapon === 'punch') {
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            vx = 0; vy = 0;
            e.preventDefault();
        }

        if (isHit) {
            registerHit(localX, localY, e.clientX, e.clientY);
            if (Math.random() < 0.5) triggerLimb();
        } else if (weaponsData[currentWeapon].action === 'lanza') {
            fakeThrow(currentWeapon, e.clientX, e.clientY, false);
        }
    });

    function updateStress(damage = 0) {
        stress += damage;
        if (stress >= 100) {
            stress = 100;
            triggerExplosion();
        }
        stressBar.style.width = `${stress}%`;
        stressText.textContent = `${stress}%`;
    }

    function triggerLimb() {
        const isLeft = Math.random() < 0.5;
        const armId = isLeft ? 'dummy-arm-l' : 'dummy-arm-r';
        const arm = document.getElementById(armId);
        const spinClass = isLeft ? 'hit-spin-left' : 'hit-spin-right';
        
        arm.classList.remove(spinClass);
        void arm.offsetWidth; // reset animation
        arm.classList.add(spinClass);
    }

    function triggerExplosion() {
        isExploding = true;
        showFloatingText('¡RENUNCIO!', window.innerWidth/2, window.innerHeight/2);
        
        dummyContainer.classList.add('explode');
        setTimeout(() => {
            clearMarks();
            stress = 0;
            updateStress(0);
            resetPhysics();
            dummyContainer.classList.remove('explode');
            dummyContainer.classList.add('drop-in');
            setTimeout(() => {
                dummyContainer.classList.remove('drop-in');
                isExploding = false;
            }, 800);
        }, 1500);
    }

    function registerHit(localX, localY, globalX, globalY) {
        // Hit logic
        
        const dmg = weaponsData[currentWeapon].damage || 1;
        updateStress(dmg);

        // 1. Mark creation
        const mark = document.createElement('div');
        mark.className = `mark ${currentWeapon}`;
        mark.style.left = `${localX}px`;
        mark.style.top = `${localY}px`;

        if (currentWeapon === 'tomato') {
            mark.classList.add('splat');
            fakeThrow('🍅', globalX, globalY, true);
        } else if (currentWeapon === 'coffee') {
            fakeThrow('☕', globalX, globalY, true);
        } else if (currentWeapon === 'keyboard') {
            fakeThrow('⌨️', globalX, globalY, true);
        } else if (currentWeapon === 'pin') {
            mark.textContent = '📌';
            mark.style.transform = `translate(-50%, -50%) rotate(${Math.random()*40 - 20}deg)`;
        } else if (currentWeapon === 'stapler') {
            mark.classList.add('stapler');
            mark.textContent = '📎'; // Fallback to staple clip
            mark.style.transform = `translate(-50%, -50%) rotate(${Math.random()*360}deg)`;
        } else if (currentWeapon === 'airplane') {
            mark.textContent = '✈️';
            mark.style.transform = `translate(-50%, -50%) rotate(${Math.random()*60 - 30}deg)`;
            fakeThrow('✈️', globalX, globalY, true);
        } else if (currentWeapon === 'cactus') {
            mark.textContent = '🌵';
            mark.style.transform = `translate(-50%, -50%) rotate(${Math.random()*40 - 20}deg)`;
            fakeThrow('🌵', globalX, globalY, true);
        } else if (currentWeapon === 'extinguisher') {
            mark.classList.add('foam');
            fakeThrow('🧯', globalX, globalY, true);
        } else if (currentWeapon === 'postit') {
            const postits = ['📝', '📄', '🟨'];
            mark.textContent = postits[Math.floor(Math.random() * postits.length)];
            mark.style.transform = `translate(-50%, -50%) rotate(${Math.random()*60 - 30}deg)`;
        }

        if (weaponsData[currentWeapon].action === 'lanza') {
            // Delay mark appearing if it's a thrown weapon
            setTimeout(() => marksContainer.appendChild(mark), 150);
        } else if (currentWeapon !== 'punch' && currentWeapon !== 'keyboard') {
            // Pins, postits and staples stick instantly
            marksContainer.appendChild(mark);
        }

        // 2. Dummy Reaction
        dummyContainer.classList.remove('shake', 'punched');
        void dummyContainer.offsetWidth; // trigger reflow

        if (currentWeapon === 'punch' || currentWeapon === 'keyboard') {
            dummyContainer.classList.add('punched');
            dummyFace.textContent = '🤕';
            showFloatingText('¡BAM! 💥', globalX, globalY);
        } else {
            dummyContainer.classList.add('shake');
            dummyFace.textContent = '😵';
            showFloatingText(`+${dmg} estrès`, globalX, globalY);
        }

        // Restore face after a moment
        setTimeout(() => {
            if (!dummyContainer.classList.contains('punched') && !dummyContainer.classList.contains('shake')) {
                dummyFace.textContent = document.querySelector('#face-grid .selected').textContent;
            }
        }, 800);
    }

    function fakeThrow(emoji, targetX, targetY, isHit) {
        const weapon = document.createElement('div');
        weapon.className = 'flying-weapon';
        weapon.textContent = emoji;
        
        // Start from bottom center of screen
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight + 50;

        weapon.style.left = `${startX}px`;
        weapon.style.top = `${startY}px`;
        
        document.body.appendChild(weapon);

        // Force reflow
        void weapon.offsetWidth;

        // Move to target
        weapon.style.left = `${targetX}px`;
        weapon.style.top = `${targetY}px`;
        weapon.style.transform = `translate(-50%, -50%) scale(0.5) rotate(720deg)`;

        setTimeout(() => {
            weapon.remove();
            if (!isHit) {
                // play a miss splash?
                const miss = document.createElement('div');
                miss.textContent = '💨';
                miss.className = 'flying-weapon';
                miss.style.left = `${targetX}px`;
                miss.style.top = `${targetY}px`;
                miss.style.transform = 'translate(-50%, -50%) scale(1.5)';
                miss.style.opacity = '0';
                miss.style.transition = 'all 0.5s';
                document.body.appendChild(miss);
                setTimeout(() => miss.remove(), 500);
            }
        }, 150); // fast throw
    }

    function showFloatingText(text, x, y) {
        const floatText = document.createElement('div');
        floatText.className = 'floating-text';
        floatText.textContent = text;
        floatText.style.top = `${y}px`;
        floatText.style.left = `${x}px`;
        document.body.appendChild(floatText);
        setTimeout(() => floatText.remove(), 800);
    }

    // Boss Key
    const bossScreen = document.getElementById('boss-screen');
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') bossScreen.classList.toggle('hidden');
    });
});
