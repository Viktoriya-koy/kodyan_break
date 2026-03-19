document.addEventListener('DOMContentLoaded', () => {
    // --- Configuración Modernizada ---
    const SNIPPETS_BASE = [
        { type: 'code', text: "const optimizeKernel = () => { return Infinity; };" },
        { type: 'comment', text: "// Installing node_modules (heavy stuff)..." },
        { type: 'cmd', text: "git push origin master --force" },
        { type: 'code', text: "import { React, useState } from 'react';" },
        { type: 'code', text: "class User extends Model { constructor(id) { super(id); } }" },
        { type: 'code', text: "await new Promise(resolve => setTimeout(resolve, 1000));" },
        { type: 'code', text: "console.log('Deploying to production...');" },
        { type: 'code', text: "if (err) throw new Error('Critical Failure');" },
        { type: 'comment', text: "// TODO: Refactor this mess later" },
        { type: 'code', text: "export default function App() { return <View />; }" },
        { type: 'cmd', text: "npm run build:prod" },
        { type: 'code', text: "const data = await fetch('/api/v1/secrets').then(r => r.json());" },
        { type: 'code', text: "function mitigateAttack(ip) { firewall.block(ip); }" },
    ];

    const LEVELS = [
        { name: "FEATURE_LOGIN", target: 500, time: 60 },
        { name: "REFACTOR_CORE", target: 1000, time: 50 },
        { name: "HOTFIX_PROD", target: 2000, time: 45 },
        { name: "MIGRATION_DB", target: 5000, time: 40 },
        { name: "IPO_LAUNCH", target: 10000, time: 35 } // The final sprint
    ];

    // --- Estado ---
    let currentLevelIdx = 0;
    let progress = 0;
    let timeLeft = LEVELS[0].time;
    let timerInterval = null;
    let isBossMode = false;
    let isGameOver = false;

    // --- DOM ---
    const outputDiv = document.getElementById('output');
    const inputSpan = document.getElementById('current-input');
    const progressBar = document.getElementById('progress-bar');
    const statusText = document.getElementById('status-text');
    const timerSpan = document.getElementById('timer');
    const terminalContainer = document.getElementById('terminal-container');
    const bossOverlay = document.getElementById('boss-overlay');

    // --- Highlighting Simple ---
    function highlightSyntax(code) {
        // Simple regex replacements for fake highlighting
        // Keywords
        code = code.replace(/\b(const|let|var|function|class|return|if|else|await|async|import|from|export|default|new|this|super|throw|try|catch)\b/g, '<span class="token-keyword">$1</span>');
        // Functions
        code = code.replace(/(\w+)(?=\()/g, '<span class="token-function">$1</span>');
        // Strings
        code = code.replace(/(['"`].*?['"`])/g, '<span class="token-string">$1</span>');
        // Comments
        code = code.replace(/(\/\/.*)/g, '<span class="token-comment">$1</span>');

        return code;
    }

    // --- Lógica del Juego ---
    function startLevel() {
        const level = LEVELS[currentLevelIdx];
        statusText.textContent = `${level.name}`;
        progress = 0;
        timeLeft = level.time;
        updateUI();

        const startMsg = document.createElement('div');
        startMsg.style.color = '#888';
        startMsg.style.marginBottom = '10px';
        startMsg.innerHTML = `// --- STARTING WORKSPACE: ${level.name} ---`;
        outputDiv.appendChild(startMsg);

        scrollToBottom();

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (!isBossMode && !isGameOver) {
                timeLeft--;
                updateUI();
                if (timeLeft <= 0) {
                    gameOver("DEADLINE MISSED - Ticket Closed as 'Won't Fix'");
                }
            }
        }, 1000);
    }

    function updateUI() {
        const level = LEVELS[currentLevelIdx];
        const pct = Math.floor((progress / level.target) * 100);

        // Update Status Bar
        progressBar.textContent = `${pct}% Complete`;
        timerSpan.textContent = `${timeLeft}s`;
    }

    function typeKey() {
        if (isGameOver || isBossMode) return;

        progress += 5 + Math.floor(Math.random() * 5);

        if (Math.random() < 0.4) {
            // Insertar línea de código completa
            const snippetObj = SNIPPETS_BASE[Math.floor(Math.random() * SNIPPETS_BASE.length)];
            const line = document.createElement('div');
            line.className = 'line';

            // Indentación random
            const indent = "&nbsp;".repeat(Math.floor(Math.random() * 3) * 4);

            if (snippetObj.type === 'comment') {
                line.innerHTML = `<span class="token-comment">${indent}${snippetObj.text}</span>`;
            } else {
                line.innerHTML = `${indent}${highlightSyntax(snippetObj.text)}`;
            }
            outputDiv.appendChild(line);

        } else {
            // Escribir caracteres en el input ficticio
            let current = inputSpan.textContent;
            if (current.length > 40) {
                // Flush line
                const line = document.createElement('div');
                line.className = 'line';
                line.innerHTML = highlightSyntax(current);
                outputDiv.appendChild(line);
                inputSpan.textContent = "";
            } else {
                const chars = "abcdefghijklmnopqrstuvwxyz .();={}";
                inputSpan.textContent += chars[Math.floor(Math.random() * chars.length)];
            }
        }

        scrollToBottom();
        checkWin();
        updateUI();
    }

    function checkWin() {
        const level = LEVELS[currentLevelIdx];
        if (progress >= level.target) {
            const victory = document.createElement('div');
            victory.innerHTML = `<br><span class="token-comment">// --- ${level.name} COMPLETED ---</span><br><br>`;
            outputDiv.appendChild(victory);

            setTimeout(() => {
                outputDiv.innerHTML = "";
                nextLevel();
            }, 1000);
        }
    }

    function nextLevel() {
        currentLevelIdx++;
        if (currentLevelIdx >= LEVELS.length) {
            winGame();
        } else {
            startLevel();
        }
    }

    function gameOver(msg) {
        isGameOver = true;
        clearInterval(timerInterval);
        alert(msg);
    }

    function winGame() {
        gameOver("🦄 UNICORN STATUS! IPO SUCCESSFUL ($10B Valuation)");
    }

    function scrollToBottom() {
        terminalContainer.scrollTop = terminalContainer.scrollHeight;
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleBossMode();
            return;
        }
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            typeKey();
        }
    });

    function toggleBossMode() {
        isBossMode = !isBossMode;
        if (isBossMode) {
            bossOverlay.classList.remove('hidden');
            document.title = "Administrator: Windows PowerShell";
        } else {
            bossOverlay.classList.add('hidden');
            document.title = "Visual Studio Code - Project";
        }
    }

    startLevel();
});
