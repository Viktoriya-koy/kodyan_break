document.addEventListener('DOMContentLoaded', () => {

    // --- Dynamic Portal Customization ---
    const defaultSettings = {
        titleMain: "Gobierno de la Provincia de San Luis",
        titleSub: "Secretaría de Ambiente",
        escudo: "🏛️",
        agentName: "Vico",
        agentRole: "Logística y Movilidad",
        avatar: "V",
        welcomeTitle: "Bienvenido al Portal de Autogestión",
        welcomeText: 'Novedades: Se abren las inscripciones para la capacitación obligatoria en "Gestión de Residuos Electrónicos".',
        themePrimary: "#354393",
        themeAccent: "#4AACC4",
        vacationName: "VACACIONES",
        vacationDate: new Date(new Date().getFullYear(), 0, 23).toISOString().split('T')[0], // Default Jan 23
        exitTime: "14:00"
    };

    // Helper to generate a darker shade for the gradient
    function shadeColor(color, percent) {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
        const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
        const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

        return "#" + RR + GG + BB;
    }

    function loadSettings() {
        const stored = localStorage.getItem('vicoPortalSettings');
        const settings = stored ? JSON.parse(stored) : defaultSettings;

        // Update DOM Displays
        document.getElementById('display-title-main').textContent = settings.titleMain;
        document.getElementById('display-title-sub').textContent = settings.titleSub;
        document.getElementById('display-escudo').textContent = settings.escudo;
        document.getElementById('display-agent-name').textContent = `Agente: ${settings.agentName}`;
        document.getElementById('display-agent-role').textContent = settings.agentRole;
        document.getElementById('display-avatar').textContent = settings.avatar;
        document.getElementById('display-widget-name').textContent = settings.agentName;

        const welcomeTitle = document.getElementById('display-welcome-title');
        if (welcomeTitle) welcomeTitle.textContent = settings.welcomeTitle || "Bienvenido al Portal de Autogestión";

        const welcomeText = document.getElementById('display-welcome-text');
        if (welcomeText) welcomeText.textContent = settings.welcomeText || defaultSettings.welcomeText;

        // Update Modal Inputs
        document.getElementById('input-title-main').value = settings.titleMain;
        document.getElementById('input-title-sub').value = settings.titleSub;
        document.getElementById('input-escudo').value = settings.escudo;
        document.getElementById('input-agent-name').value = settings.agentName;
        document.getElementById('input-agent-role').value = settings.agentRole;
        document.getElementById('input-avatar').value = settings.avatar;
        document.getElementById('input-welcome-text').value = settings.welcomeText || defaultSettings.welcomeText;

        const primaryColor = settings.themePrimary || defaultSettings.themePrimary;
        const accentColor = settings.themeAccent || defaultSettings.themeAccent;
        const vacationName = settings.vacationName || defaultSettings.vacationName;
        const vacationDate = settings.vacationDate || defaultSettings.vacationDate;
        const exitTime = settings.exitTime || defaultSettings.exitTime;

        document.getElementById('input-theme-primary').value = primaryColor;
        document.getElementById('input-theme-accent').value = accentColor;
        document.getElementById('input-vacation-name').value = vacationName;
        document.getElementById('input-vacation-date').value = vacationDate;
        document.getElementById('input-exit-time').value = exitTime;

        // Save to global for the widgets
        window.VACATION_NAME = vacationName.toUpperCase() || "EVENTO";
        window.VACATION_DATE = new Date(vacationDate + "T00:00:00");
        window.EXIT_TIME = exitTime;

        // Apply CSS Variables
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--primary-color-dark', shadeColor(primaryColor, -20)); // 20% darker
        document.documentElement.style.setProperty('--accent-color', accentColor);
        // Use a very light version of the primary color for backgrounds
        document.documentElement.style.setProperty('--primary-bg-light', primaryColor + '1A'); // add 10% opacity in hex
    }

    loadSettings();

    // EXPORT METHOD TO GLOBAL SCOPE SO onclick="" CAN ACCESS IT
    window.saveSettings = function () {
        const newSettings = {
            titleMain: document.getElementById('input-title-main').value || defaultSettings.titleMain,
            titleSub: document.getElementById('input-title-sub').value || defaultSettings.titleSub,
            escudo: document.getElementById('input-escudo').value || defaultSettings.escudo,
            agentName: document.getElementById('input-agent-name').value || defaultSettings.agentName,
            agentRole: document.getElementById('input-agent-role').value || defaultSettings.agentRole,
            avatar: document.getElementById('input-avatar').value || defaultSettings.avatar,
            welcomeTitle: "Bienvenido al Portal de Autogestión",
            welcomeText: document.getElementById('input-welcome-text').value || defaultSettings.welcomeText,
            themePrimary: document.getElementById('input-theme-primary').value || defaultSettings.themePrimary,
            themeAccent: document.getElementById('input-theme-accent').value || defaultSettings.themeAccent,
            vacationName: document.getElementById('input-vacation-name').value || defaultSettings.vacationName,
            vacationDate: document.getElementById('input-vacation-date').value || defaultSettings.vacationDate,
            exitTime: document.getElementById('input-exit-time').value || defaultSettings.exitTime
        };

        // Enforce length limits just in case
        if (newSettings.avatar.length > 2) newSettings.avatar = newSettings.avatar.substring(0, 2);
        if (newSettings.escudo.length > 4) newSettings.escudo = newSettings.escudo.substring(0, 4);

        localStorage.setItem('vicoPortalSettings', JSON.stringify(newSettings));

        // Apply instantly
        loadSettings();

        // Close modal
        document.getElementById('settings-modal').style.display = 'none';

        // Optional: brief flash/animation to indicate success
        const avatar = document.getElementById('display-avatar');
        avatar.style.background = "#2bac76"; // Green success
        setTimeout(() => {
            avatar.style.background = "#4AACC4"; // Back to normal cyan
        }, 500);
    };

    // --- Clock & Countdown Logic ---
    const clockContainer = document.getElementById('clock-container');
    const clockTime = document.getElementById('clock-time');
    const clockLabel = document.getElementById('clock-label');

    let isCountdownMode = false;

    // --- Calendar & Vacation Countdown Logic ---
    const calWidget = document.getElementById('calendar-widget');
    const calMonth = document.getElementById('cal-month');
    const calDay = document.getElementById('cal-day');
    const calLabel = document.getElementById('cal-label');

    let isVacationMode = false;

    function updateCalendar() {
        const now = new Date();

        if (!isVacationMode) {
            // Mode: Standard Calendar
            const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
            calMonth.textContent = months[now.getMonth()];
            calMonth.style.background = "#e01e5a"; // Standard Red header
            calDay.textContent = now.getDate();
            calLabel.textContent = "HOY";
        } else {
            // Mode: Vacation Countdown
            // Reset hours to start of day for accurate day diff
            const targetDate = window.VACATION_DATE || new Date(now.getFullYear(), 0, 23);
            const targetName = window.VACATION_NAME || "VACACIONES";
            const todayReset = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            // Si la fecha de vacaciones ya pasó este año, asumir que es para el año que viene (opcional, pero útil)
            if (targetDate < todayReset && targetDate.getFullYear() <= now.getFullYear()) {
                // targetDate.setFullYear(now.getFullYear() + 1);
            }

            const diffTime = targetDate - todayReset;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
                calMonth.textContent = "FALTAN";
                calMonth.style.background = "#2bac76"; // Green for hope
                calDay.textContent = diffDays;
                calLabel.textContent = `DÍAS PARA ${targetName}`;
            } else if (diffDays === 0) {
                calMonth.textContent = "¡HOY!";
                calMonth.style.background = "#ff9800"; // Orange celebration
                calDay.textContent = "🎉";
                calLabel.textContent = `¡FELIZ ${targetName}!`;
            } else {
                calMonth.textContent = "PASÓ";
                calMonth.style.background = "#9e9e9e"; // Grey out
                calDay.textContent = Math.abs(diffDays);
                calLabel.textContent = `DÍAS DESDE ${targetName}`;
            }
        }
    }

    calWidget.addEventListener('click', () => {
        isVacationMode = !isVacationMode;
        updateCalendar();
    });

    // Initial call
    updateCalendar();

    function updateClock() {
        const now = new Date();

        if (!isCountdownMode) {
            // Mode: Standard Clock
            clockTime.textContent = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            clockLabel.textContent = "Hora Actual";
            clockTime.style.color = "white";
        } else {
            // Mode: Countdown to custom Exit Time
            const exitTimeStr = window.EXIT_TIME || "14:00";
            const exitParts = exitTimeStr.split(":");
            const exitHour = parseInt(exitParts[0]) || 14;
            const exitMinute = parseInt(exitParts[1]) || 0;

            const exitTime = new Date();
            exitTime.setHours(exitHour, exitMinute, 0, 0);

            // If it's already past exit time, set target to tomorrow
            if (now > exitTime) {
                exitTime.setDate(exitTime.getDate() + 1);
            }

            const diff = exitTime - now;

            // Format H:MM:SS
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            clockTime.textContent = `-${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            // Show target time in label for clarity
            const formattedTarget = `${exitHour.toString().padStart(2, '0')}:${exitMinute.toString().padStart(2, '0')}`;
            clockLabel.textContent = `Salida a las ${formattedTarget}`;
            clockTime.style.color = "#ffeb3b"; // Warning/Excitement color
        }
    }

    let clickTimeout = null;

    // Toggle Mode on Click (Debounced)
    clockContainer.addEventListener('click', () => {
        if (clickTimeout) clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
            isCountdownMode = !isCountdownMode;
            updateClock();
            clickTimeout = null;
        }, 250); // Wait for potential double click
    });

    // Configure Time on Double Click
    clockContainer.addEventListener('dblclick', (e) => {
        // Cancel single click toggle
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
        }
        e.stopPropagation();

        // Open settings modal instead of showing a prompt
        document.getElementById('settings-modal').style.display = 'flex';
    });

    // Tick every second
    setInterval(updateClock, 1000);
    updateClock();

    // --- Dynamic Weather (Configurable Inline) ---
    const weatherTitle = document.getElementById('inline-weather-title');
    const weatherDesc = document.getElementById('inline-weather-desc');
    const weatherTemp = document.getElementById('inline-weather-temp');

    // Load saved weather or default
    const savedTitle = localStorage.getItem('vicoWeatherTitle');
    const savedTemp = localStorage.getItem('vicoWeatherTemp');
    const savedDesc = localStorage.getItem('vicoWeatherDesc');

    if (savedTitle && weatherTitle) weatherTitle.textContent = savedTitle;
    if (savedTemp && weatherTemp) weatherTemp.textContent = savedTemp;
    if (savedDesc && weatherDesc) weatherDesc.textContent = savedDesc;

    window.saveInlineWeather = function() {
        if (weatherTitle && weatherTemp && weatherDesc) {
            localStorage.setItem('vicoWeatherTitle', weatherTitle.textContent);
            localStorage.setItem('vicoWeatherTemp', weatherTemp.textContent);
            localStorage.setItem('vicoWeatherDesc', weatherDesc.textContent);
        }
    };

    // --- META-GAME: Carrera Administrativa ---
    const userRankEl = document.getElementById('user-rank');
    const xpBarEl = document.getElementById('xp-bar');
    const xpValEl = document.getElementById('xp-val');
    const xpNextEl = document.getElementById('xp-next');

    const RANKS = [
        { name: "Pasante", cap: 500 },
        { name: "Monotributista", cap: 1500 },
        { name: "Contratado", cap: 3500 },
        { name: "Planta Permanente", cap: 7000 },
        { name: "Jefe de Área", cap: 12000 },
        { name: "Director", cap: 20000 },
        { name: "Ministro", cap: 999999 }
    ];

    function updateProfile() {
        // Get global XP (shared across games)
        let totalXP = parseInt(localStorage.getItem('vicoTotalXP')) || 0;

        // Determine Rank and Level
        // Level logic: level 1 is 0-100, level 2 100-300, etc?
        // Let's mimic a simple linear-ish scaling for Levels: 100 * level
        // But Ranks are milestone based.

        let currentRank = RANKS[0];
        let nextRankXP = RANKS[0].cap;

        for (let r of RANKS) {
            if (totalXP >= r.cap) {
                // Continue searching for highest qualified rank
                // Actually need logic: if XP < r.cap, then THIS is the *next* rank, so previous was current.
            } else {
                // We found the ceiling. So current rank is the previous one.
                // Wait simpler:
            }
        }
        // Easy way: Filter ranks where cap <= XP is false.
        // Actually, let's keep it simple: 
        // Rank based purely on thresholds logic

        let rankIndex = 0;
        while (rankIndex < RANKS.length - 1 && totalXP >= RANKS[rankIndex].cap) {
            rankIndex++;
        }
        // Now RANKS[rankIndex] is the target/current rank?? No.
        // If XP is 600. Pasante cap 500. 
        // Loop 0: 600 >= 500? Yes. rankIndex -> 1 (Monotributista).
        // Loop 1: 600 >= 1500? No. Stop.
        // So User is "Monotributista". Correct.

        const rankObj = RANKS[rankIndex];

        // Calculate Level (just infinite scaling)
        // Level = floor(DOOM_XP_CURVE) ... simpler: Level = 1 + floor(XP / 200)
        const level = 1 + Math.floor(totalXP / 250);

        userRankEl.textContent = `${rankObj.name} - Nvl ${level}`;

        // Update XP Bar (Progress to next Rank or just next Level?)
        // Let's do Progress to Next Level for the bar, easier to visualize short term rewards
        const xpPerLevel = 250;
        const currentLevelXP = totalXP % xpPerLevel;
        const percentage = (currentLevelXP / xpPerLevel) * 100;

        xpBarEl.style.width = `${percentage}%`;
        xpValEl.textContent = currentLevelXP;
        xpNextEl.textContent = xpPerLevel;

        // Initial setup check
        if (!localStorage.getItem('vicoTotalXP')) localStorage.setItem('vicoTotalXP', 0);
    }

    // --- LAUNCHER 2.0 LOGIC ---
    function updateGameStats() {
        // CAMPAIGN GAMES (Progress Bars)
        const campaigns = [
            { id: 'spreadsheet', max: 5 },
            { id: 'systemcrash', max: 5 },
            { id: 'angryinterns', max: 3 }, // Currently 3 levels implemented
            { id: 'rrhh', max: 3 }, // Currently 3 rounds
            { id: 'doom', max: 5 },
            { id: 'tetris', max: 5 }, // Days
            { id: 'salary', max: 5 }, // Rivals
            { id: 'terminal', max: 5 },
            { id: 'java', max: 5 }, // Modules
            { id: 'math', max: 10 }, // Math Exams
            { id: 'english', max: 5 }, // QA Batches
            { id: 'git', max: 5 }, // Merges
            { id: 'sql', max: 5 }, // Reports
            { id: 'web', max: 5 }, // DOM Fixes
            { id: 'sudoku', max: 30 }, // 3 Dificultades x 10 Lotes
            { id: 'inbox', max: 30 } // 3 Dificultades x 10 Lotes
        ];

        campaigns.forEach(game => {
            const card = document.querySelector(`.system-card[data-game="${game.id}"]`);
            if (card) {
                // Read from LocalStorage (key: vico_level_[id])
                // Default to 1 (Level 1) if not found
                const currentLevel = parseInt(localStorage.getItem(`vico_level_${game.id}`)) || 1;

                // Calculate percentage (Level 1 should be 0% or start at 0? 
                // Let's say: (Current - 1) / (Max) * 100. 
                // If Level is 1, 0%. If Level 2, 25% (of 5).
                // If Completed (Level > Max), 100%.
                const progressVal = Math.min(Math.max(currentLevel - 1, 0), game.max); // 0 to Max
                const pct = Math.round((progressVal / game.max) * 100);

                const bar = card.querySelector('.card-progress-bar');
                const textLeft = card.querySelector('.card-progress-text span:first-child');
                const textRight = card.querySelector('.card-progress-text span:last-child');

                if (bar) bar.style.width = `${pct}%`;
                if (textRight) textRight.textContent = `${pct}%`;
                if (textLeft) {
                    if (currentLevel > game.max) textLeft.textContent = "COMPLETADO";
                    else textLeft.textContent = `Fase ${currentLevel}`;
                }
            }
        });

        // ARCADE GAMES (High Scores)
        const arcades = [
            'inbox', 'slack', 'shredder', 'printer', 'update',
            'expediente', 'tabs', 'mute', 'voodoo', 'vpn', 'whackboss',
            'papersniper', 'coffeespiller', 'micromanager', 'kickboss'
        ];

        arcades.forEach(id => {
            const card = document.querySelector(`.system-card[data-arcade="${id}"]`);
            if (card) {
                const scoreVal = parseInt(localStorage.getItem(`vico_score_${id}`)) || 0;
                const scoreEl = card.querySelector('.score-val');
                if (scoreEl) scoreEl.textContent = scoreVal.toLocaleString();
            }
        });
    }

    // Call update on load
    updateGameStats();
    // And listen for storage changes (in case they play in another tab)
    window.addEventListener('storage', updateGameStats);
    // --- DIRECTORIES / FOLDERS LOGIC ---
    window.openFolder = function(folderId, title) {
        const modal = document.getElementById('folder-modal');
        const titleSpan = document.getElementById('folder-title-text');
        const grid = document.getElementById('folder-games-grid');
        const hiddenBin = document.getElementById('all-games-hidden');
        
        if(titleSpan) titleSpan.textContent = title;
        
        // Move ALL cards back to hidden bin first
        const allCards = document.querySelectorAll('.system-card');
        allCards.forEach(card => hiddenBin.appendChild(card));
        
        // Move only the relevant cards to the grid
        const activeCards = hiddenBin.querySelectorAll(`.system-card[data-folder="${folderId}"]`);
        activeCards.forEach(card => grid.appendChild(card));
        
        // Dynamic formatting for RRHH to be 3x2
        if (folderId === 'rrhh') {
            grid.classList.add('grid-3x2');
        } else {
            grid.classList.remove('grid-3x2');
        }
        
        modal.style.display = 'flex';
    };

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
