const targetCmdEl = document.getElementById('target-cmd');
const userInputEl = document.getElementById('user-input');
const logOutputEl = document.getElementById('log-output');
const timeDisplay = document.getElementById('time-display');
const scoreVal = document.getElementById('score-val');
const terminal = document.getElementById('terminal');
const statusText = document.getElementById('status-text');

let score = parseInt(localStorage.getItem('vico_score_vpn')) || 0;
let commandsList = [
    "ping -n 4 vault.corp.local",
    "ipconfig /flushdns",
    "ssh auth@10.58.12.199",
    "netstat -ano",
    "sudo systemctl restart vpn",
    "tracert 192.168.1.1",
    "ifconfig eth0 down",
    "ifconfig eth0 up",
    "route add default gw",
    "nmap -sV -p 443 proxy",
    "curl -X POST /api/token",
    "nslookup internal.db",
    "chmod 777 sys_keys.pem",
    "cat /var/log/auth.log"
];

let currentTargetCommand = "";
let currentTypedString = "";
let timer = 45;
let interval;
let isGameOver = false;

function addCoins(amount) {
    let coins = parseInt(localStorage.getItem('office_coins')) || 0;
    coins += amount;
    localStorage.setItem('office_coins', coins);
    if (window.parent && window.parent.document.getElementById('global-coins')) {
        window.parent.document.getElementById('global-coins').textContent = coins;
    }
}

function initGame() {
    scoreVal.textContent = score;
    pickNewCommand();
    startTimer();
}

function pickNewCommand() {
    const randomIndex = Math.floor(Math.random() * commandsList.length);
    currentTargetCommand = commandsList[randomIndex];
    currentTypedString = "";
    updateUI();
}

function updateUI() {
    userInputEl.textContent = currentTypedString;
    
    // Highlight matched letters in target command
    let html = "";
    for(let i=0; i<currentTargetCommand.length; i++) {
        if(i < currentTypedString.length) {
            html += `<span class="typed-correct">${currentTargetCommand[i]}</span>`;
        } else {
            html += currentTargetCommand[i];
        }
    }
    targetCmdEl.innerHTML = html;
}

function appendLog(text, color = "#00ff00") {
    const p = document.createElement('p');
    p.textContent = text;
    p.style.color = color;
    logOutputEl.appendChild(p);
    
    // Keep only last 8 logs
    while(logOutputEl.children.length > 8) {
        logOutputEl.removeChild(logOutputEl.firstChild);
    }
}

function triggerError() {
    terminal.classList.add('flash-error');
    setTimeout(() => terminal.classList.remove('flash-error'), 200);
    appendLog(`[!] ERROR DE SINTAXIS en car. ${currentTypedString.length}. Buffer limpiado.`, "red");
    currentTypedString = ""; // Reset current word
    timer = Math.max(0, timer - 2); // Penalty!
    timeDisplay.textContent = timer;
    updateUI();
}

// Typing listener
window.addEventListener('keydown', (e) => {
    // Boss key
    if (e.key === 'Escape') {
        document.getElementById('boss-overlay').classList.toggle('hidden');
        return;
    }

    if (isGameOver || document.getElementById('boss-overlay').classList.contains('hidden') === false) return;
    
    // Ignore meta keys
    if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) {
        if (e.key === 'Backspace') {
            // Allow backspace? 
            // Better to force perfection. If they want to backspace, just reset buffer or ignore it.
        }
        return; 
    }

    // Verify keystroke
    const expectedChar = currentTargetCommand[currentTypedString.length];
    
    if (e.key === expectedChar) {
        currentTypedString += e.key;
        updateUI();
        
        // Check if finished
        if (currentTypedString === currentTargetCommand) {
            appendLog(`> ${currentTargetCommand}`);
            appendLog(`[OK] COMANDO EJECUTADO CON ÉXITO.`);
            score += 15 + currentTargetCommand.length;
            addCoins(2);
            scoreVal.textContent = score;
            localStorage.setItem('vico_score_vpn', score);
            
            // Increment timer reward
            timer = Math.min(99, timer + 5);
            timeDisplay.textContent = timer;
            
            pickNewCommand();
        }
    } else {
        triggerError();
    }
});

function startTimer() {
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
        timer--;
        timeDisplay.textContent = timer;
        
        if (timer <= 0) {
            clearInterval(interval);
            isGameOver = true;
            statusText.textContent = "VPN TERMINADA - HAS SIDO DESCONECTADO";
            statusText.className = "sys-status status-error";
            appendLog("FALLO CRÍTICO. CONEXIÓN CERRADA.", "red");
            
            // Restart sequence after 3s
            setTimeout(() => {
                isGameOver = false;
                timer = 45;
                statusText.textContent = "[ ! ] VPN DESCONECTADA - LÍNEA SEGURA CAÍDA";
                statusText.className = "sys-status blink-slow";
                appendLog("Reiniciando secuencia de arranque...");
                initGame();
            }, 4000);
        }
    }, 1000);
}

// Start
initGame();
