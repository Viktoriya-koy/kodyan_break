const conflictUl = document.getElementById('conflict-ul');
const editorArea = document.getElementById('editor-area');
const fileNameEl = document.getElementById('file-name');
const reqTextEl = document.getElementById('req-text');
const remainingCountEl = document.getElementById('remaining-count');
const commitBtn = document.getElementById('commit-btn');

let conflicts = [];
let currentConflictId = null;
let resolvedCount = 0;
let level = 1;

// --- CONTENT DB ---
// Simple logic puzzles disguised as code conflicts
const definitions = [
    {
        file: "auth_service.js",
        req: "Allow access only if user is admin OR moderator.",
        head: "if (user.role == 'admin')",
        incoming: "if (user.role == 'admin' || user.role == 'mod')",
        correct: 'incoming'
    },
    {
        file: "database_config.json",
        req: "Connect to Production DB on port 5432.",
        head: '"port": 3000, "host": "localhost"',
        incoming: '"port": 5432, "host": "192.168.1.10"',
        correct: 'incoming'
    },
    {
        file: "ui_button.css",
        req: "Button background needs to be red for alerts.",
        head: "background-color: #ff0000; /* Red */",
        incoming: "background-color: #00ff00; /* Green */",
        correct: 'head'
    },
    {
        file: "loops.py",
        req: "Iterate 10 times, starting from 0.",
        head: "for i in range(1, 10):",
        incoming: "for i in range(0, 10):",
        correct: 'incoming'
    },
    {
        file: "Main.java",
        req: "Initialize array with fixed size of 50.",
        head: "int[] data = new int[50];",
        incoming: "int[] data = new int[100];",
        correct: 'head'
    },
    {
        file: "readme.md",
        req: "Update version to 2.0.1",
        head: "# Version 2.0.0",
        incoming: "# Version 2.0.1",
        correct: 'incoming'
    }
];

// --- GENERATOR ---

function startLevel() {
    conflicts = [];
    conflictUl.innerHTML = '';
    resolvedCount = 0;
    editorArea.innerHTML = '<div class="placeholder-msg">Select a conflicted file to resolve.</div>';
    fileNameEl.textContent = "Select a file...";
    reqTextEl.textContent = "---";
    commitBtn.disabled = true;

    // Pick 5 random conflicts
    const pool = [...definitions].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 5; i++) {
        conflicts.push({
            id: i,
            ...pool[i],
            status: 'pending' // pending, resolved
        });

        const li = document.createElement('li');
        li.textContent = conflicts[i].file;
        li.dataset.id = i;
        li.onclick = () => loadConflict(i);
        conflictUl.appendChild(li);
    }

    updateStatus();
    loadConflict(0);
}

function loadConflict(id) {
    currentConflictId = id;
    const c = conflicts[id];

    // UI Update
    document.querySelectorAll('#conflict-ul li').forEach(li => li.classList.remove('active'));
    document.querySelector(`#conflict-ul li[dataset-id="${id}"]`)?.classList.add('active'); // Bug in selector? Use loop
    // Correct loop selector
    Array.from(conflictUl.children).forEach(li => {
        if (li.dataset.id == id) li.classList.add('active');
    });

    fileNameEl.textContent = c.file;
    reqTextEl.textContent = c.req;

    // Render Diff Editor
    if (c.status === 'pending') {
        renderConflictEditor(c);
    } else {
        editorArea.innerHTML = `<div style="color: #6a9955; text-align:center; margin-top:50px;">
            <h3>CONFLICT RESOLVED</h3>
            <p>Selected Code:</p>
            <pre style="background:#222; padding:10px; display:inline-block;">${c.chosenCode}</pre>
        </div>`;
    }
}

function renderConflictEditor(c) {
    editorArea.innerHTML = `
        <div style="color:#888; margin-bottom:10px;">// Previous code...</div>
        
        <div class="conflict-block">
            <div class="conflict-marker marker-head">
                <<<<<<< HEAD (Current Change)
                <button class="btn-accept" onclick="resolve(${c.id}, 'head')">Accept Current</button>
            </div>
            <div class="code-chunk">
                ${escapeHtml(c.head)}
            </div>
            
            <div class="marker-divider">=======</div>
            
            <div class="code-chunk">
                ${escapeHtml(c.incoming)}
            </div>
            <div class="conflict-marker marker-incoming">
                >>>>>>> feature/login (Incoming Change)
                <button class="btn-accept" onclick="resolve(${c.id}, 'incoming')">Accept Incoming</button>
            </div>
        </div>
        
        <div style="color:#888; margin-top:10px;">// Rest of file...</div>
    `;
}

function resolve(id, choice) {
    const c = conflicts[id];

    // Check correctness
    if (choice === c.correct) {
        c.status = 'resolved';
        c.chosenCode = choice === 'head' ? c.head : c.incoming;
        resolvedCount++;

        // Update List UI
        const li = Array.from(conflictUl.children).find(l => l.dataset.id == id);
        if (li) li.classList.add('resolved');

        loadConflict(id); // Show success view
        updateStatus();

        // Auto Next
        const next = conflicts.find(x => x.status === 'pending');
        if (next) setTimeout(() => loadConflict(next.id), 500);

    } else {
        alert("BUILD FAILED: Logic requirement not met.\nReview the REQUIREMENT and try again.");
    }
}

function updateStatus() {
    let remaining = 5 - resolvedCount;
    remainingCountEl.textContent = remaining;
    if (remaining === 0) {
        document.getElementById('merge-status').textContent = "Ready to Commit";
        document.getElementById('merge-status').style.color = "#2ecc71";
        commitBtn.disabled = false;
        commitBtn.textContent = "COMMIT MERGE (Push to Master)";
    }
}

commitBtn.onclick = () => {
    alert("MERGE SUCCESSFUL.\nBranch merged without functional regressions.");
    let savedLvl = parseInt(localStorage.getItem('vico_level_git')) || 1;
    localStorage.setItem('vico_level_git', savedLvl + 1);
    startLevel();
};

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Boss Key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('boss-overlay').classList.toggle('hidden');
    }
});

// Init
startLevel();
