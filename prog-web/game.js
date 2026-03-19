const ticketDesc = document.getElementById('ticket-desc');
const cssPropsDiv = document.getElementById('css-properties');
const renderFrame = document.getElementById('render-frame');
const renderTarget = document.getElementById('render-target');
const btnPublish = document.querySelector('.btn-publish');

let currentLevel = 0;

// Levels
const levels = [
    {
        id: 404, // Overflow
        desc: "Banner is causing horizontal scroll (Too wide).",
        brokenClass: "broken-state-1",
        options: [
            { prop: "width", val: "200%", correct: false },
            { prop: "width", val: "100%", correct: true },
            { prop: "width", val: "200px", correct: false }
        ]
    },
    {
        id: 405, // Visibility
        desc: "Banner is missing from the page.",
        brokenClass: "broken-state-2",
        options: [
            { prop: "display", val: "none", correct: false },
            { prop: "display", val: "block", correct: true },
            { prop: "opacity", val: "0", correct: false }
        ]
    },
    {
        id: 406, // Contrast
        desc: "Title text is invisible (White on White? Blue on Blue?)",
        brokenClass: "broken-state-3",
        options: [
            { prop: "color", val: "#3498db", correct: false }, // same as bg
            { prop: "color", val: "#ffffff", correct: true },
            { prop: "color", val: "transparent", correct: false }
        ]
    },
    {
        id: 407, // Z-index or Position
        desc: "Navigation bar is floating in the middle of the content.",
        brokenClass: "broken-state-4",
        options: [
            { prop: "position", val: "absolute", correct: false },
            { prop: "position", val: "relative", correct: true },
            { prop: "top", val: "200px", correct: false }
        ]
    }
];

function loadLevel(idx) {
    if (idx >= levels.length) {
        alert("ALL TICKETS RESOLVED. Deployment Successful.");
        idx = 0;
    }

    currentLevel = idx;
    const lvl = levels[idx];

    ticketDesc.textContent = lvl.desc;

    // Reset classes
    renderFrame.className = 'preview-frame';
    renderFrame.classList.add(lvl.brokenClass);

    // Load options
    cssPropsDiv.innerHTML = '';
    lvl.options.forEach(opt => {
        const div = document.createElement('div');
        div.className = 'prop-option';
        div.innerHTML = `<span class="prop-name">${opt.prop}:</span> <span class="prop-val">${opt.val};</span>`;
        div.onclick = () => {
            // Visualize change immediately?
            // Or select and publish? Let's select.
            document.querySelectorAll('.prop-option').forEach(d => d.classList.remove('selected'));
            div.classList.add('selected');

            // Temporary Apply visual fix logic (Simplified for game)
            if (opt.correct) {
                renderFrame.classList.remove(lvl.brokenClass); // Fix it visually
            } else {
                renderFrame.className = 'preview-frame ' + lvl.brokenClass; // Revert
            }

            div.dataset.correct = opt.correct;
        };
        cssPropsDiv.appendChild(div);
    });
}

btnPublish.onclick = () => {
    const selected = document.querySelector('.prop-option.selected');
    if (!selected) return;

    if (selected.dataset.correct === "true") {
        alert("FIX DEPLOYED. Verified on Staging.");
        let savedLvl = parseInt(localStorage.getItem('vico_level_web')) || 1;
        localStorage.setItem('vico_level_web', savedLvl + 1);
        loadLevel(currentLevel + 1);
    } else {
        alert("DEPLOY FAILED. Visual regression detected.");
        // Revert visual
        const lvl = levels[currentLevel];
        renderFrame.classList.add(lvl.brokenClass);
    }
};

// Boss Key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('boss-overlay').classList.toggle('hidden');
    }
});

loadLevel(0);
