document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let currentModule = 1;
    let currentTicketIdx = 0;
    let score = 0;
    let completedTickets = 0;
    let isBossMode = false;
    let tickets = []; // Will load from window.TICKETS

    // --- DOM ---
    const ticketListEl = document.getElementById('ticket-list');
    const ticketTitleEl = document.getElementById('ticket-title');
    const codeDisplayEl = document.getElementById('code-display');
    const optionsContainer = document.getElementById('options-container');
    const feedbackArea = document.getElementById('feedback-area');
    const nextBtn = document.getElementById('next-btn');
    const progressEl = document.getElementById('progress');
    const scoreEl = document.getElementById('score');
    const moduleNameEl = document.getElementById('module-name');
    const bossOverlay = document.getElementById('boss-overlay');

    // --- Init ---
    if (window.TICKETS) {
        tickets = window.TICKETS;
        initGame();
    } else {
        console.error("Tickets data not loaded!");
    }

    function initGame() {
        renderTicketList();
        loadTicket(0);
    }

    // --- Logic ---
    function renderTicketList() {
        ticketListEl.innerHTML = "";
        tickets.forEach((ticket, idx) => {
            const el = document.createElement('div');
            el.className = `ticket-item ${idx === currentTicketIdx ? 'active' : ''} ${ticket.completed ? 'completed' : ''}`;
            el.innerHTML = `<span>#${100 + idx}</span> <span>${ticket.title}</span>`;
            el.onclick = () => {
                if (!ticket.completed) loadTicket(idx);
            };
            ticketListEl.appendChild(el);
        });
        updateStats();
    }

    function loadTicket(idx) {
        currentTicketIdx = idx;
        const ticket = tickets[idx];

        // Update UI info
        ticketTitleEl.textContent = ticket.title;
        moduleNameEl.textContent = ticket.module;

        // Render Code Hole
        // Replace the placeholder `_____` with a span for styling
        const codeHTML = ticket.code.replace('_____', '<span id="target-hole">_____</span>');
        codeDisplayEl.innerHTML = codeHTML;

        // Apply syntax highlight
        hljs.highlightElement(codeDisplayEl);

        // Find the hole again after highlight (highlight.js might strip spans, so we re-inject if needed, 
        // but usually we insert the token into the raw text first. 
        // A safer way for highlight.js is to highlight raw first, then replace placeholder)
        // Let's re-do:
        const rawCode = ticket.code;
        const highlighted = hljs.highlight(rawCode, { language: 'java' }).value;
        const holeCode = highlighted.replace('_____', '<span class="code-hole">?????</span>');
        codeDisplayEl.innerHTML = holeCode;

        // Render Options
        optionsContainer.innerHTML = "";
        feedbackArea.classList.add('hidden');
        nextBtn.classList.add('hidden');

        ticket.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => handleAnswer(i, btn);
            optionsContainer.appendChild(btn);
        });

        renderTicketList(); // Update active state
    }

    function handleAnswer(selectedIndex, btnElement) {
        const ticket = tickets[currentTicketIdx];
        const isCorrect = selectedIndex === ticket.correct;

        if (isCorrect) {
            btnElement.classList.add('correct');
            showFeedback(true, "¡Correcto! " + ticket.explanation);

            // Mark complete
            if (!ticket.completed) {
                ticket.completed = true;
                score += 100;
                completedTickets++;
                updateStats();

                // Save Progress (Launcher 2.0)
                // Check if this was the last ticket of the module
                const nextTicket = tickets[currentTicketIdx + 1];
                if (!nextTicket || nextTicket.module !== ticket.module) {
                    // We just finished a module (or the game)
                    try {
                        let modNum = parseInt(ticket.module.match(/\d+/)[0]);
                        localStorage.setItem('vico_level_java', modNum + 1);
                        alert(`¡MÓDULO ${modNum} COMPLETADO!`);
                    } catch (e) { console.error(e); }
                }
            }

            // Fill the hole in visual code
            const visualHole = document.querySelector('.code-hole');
            if (visualHole) {
                visualHole.textContent = ticket.options[selectedIndex];
                visualHole.style.background = "transparent";
                visualHole.style.border = "none";
                visualHole.style.color = "#238636";
            }

            nextBtn.classList.remove('hidden');
            renderTicketList(); // Updates strikethrough

        } else {
            btnElement.classList.add('wrong');
            showFeedback(false, ticket.explanation);
            score -= 10;
            updateStats();
        }
    }

    function showFeedback(isSuccess, text) {
        feedbackArea.classList.remove('hidden');
        feedbackArea.innerHTML = `
            <span class="feedback-header ${isSuccess ? 'feedback-success' : 'feedback-error'}">
                ${isSuccess ? '✔ Code Review Passed' : '✘ Changes Requested'}
            </span>
            <p>${text}</p>
        `;
    }

    function updateStats() {
        scoreEl.textContent = score;
        progressEl.textContent = `${completedTickets}/${tickets.length}`;
    }

    nextBtn.onclick = () => {
        // Find next incomplete
        const nextIdx = tickets.findIndex((t, i) => i > currentTicketIdx && !t.completed);
        if (nextIdx !== -1) {
            loadTicket(nextIdx);
        } else {
            // Check loop
            const firstIncomplete = tickets.findIndex(t => !t.completed);
            if (firstIncomplete !== -1) loadTicket(firstIncomplete);
            else alert("¡Felicidades! Has completado todos los tickets del Sprint.");
        }
    };

    // --- Boss Key ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleBossMode();
        }
    });

    function toggleBossMode() {
        isBossMode = !isBossMode;
        if (isBossMode) {
            bossOverlay.classList.remove('hidden');
            document.title = "Compiling... - Maven";
        } else {
            bossOverlay.classList.add('hidden');
            document.title = "Pull Request #1024 - Java Corp";
        }
    }
});
