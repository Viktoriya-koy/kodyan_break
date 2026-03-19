const questions = [];
const TOTAL_QUESTIONS = 15; // 5 per module
let currentQuestionIndex = 0;
let answeredCount = 0;
let userAnswers = {}; // map index -> selected option index
let timer = 45 * 60; // 45 minutes

// --- GENERATORS ---

function generateExam() {
    // Module 1: Logic (5)
    for (let i = 0; i < 5; i++) {
        questions.push(generateLogicQuestion());
    }
    // Module 2: Sets (5)
    for (let i = 0; i < 5; i++) {
        questions.push(generateSetsQuestion());
    }
    // Module 3: Functions (5)
    for (let i = 0; i < 5; i++) {
        questions.push(generateFunctionQuestion());
    }

    renderNav();
    loadQuestion(0);
    startTimer();
}

// -- LOGIC MODULE --
function generateLogicQuestion() {
    // Simple propositional logic
    const types = [
        {
            q: "Evalúe la validez del circuito:",
            visual: "(p ∧ q) → r",
            opts: ["Verdadera si p=V, q=V, r=F", "Falsa si p=V, q=V, r=F", "Siempre Verdadera", "Indeterminada"],
            correct: 1
        },
        {
            q: "Si la proposición 'Si llueve, entonces uso paraguas' es FALSA, entonces:",
            visual: "p → q = F",
            opts: ["Llueve y uso paraguas", "No llueve y uso paraguas", "Llueve y NO uso paraguas", "No llueve y no uso paraguas"],
            correct: 2
        },
        {
            q: "Simplifique la expresión lógica:",
            visual: "¬(p ∨ q)",
            opts: ["¬p ∨ ¬q", "¬p ∧ ¬q", "p ∧ q", "¬p ∨ q"],
            correct: 1
        }
    ];
    let t = types[Math.floor(Math.random() * types.length)];
    return {
        module: 'logic',
        category: 'Lógica Proposicional',
        text: t.q,
        visual: `<div class='circuit-text'>${t.visual}</div>`,
        options: t.opts,
        correct: t.correct
    };
}

// -- SETS MODULE --
function generateSetsQuestion() {
    // Sets operations
    // Random sets A and B
    let A = [1, 2, 3, 4];
    let B = [3, 4, 5, 6];
    // Op: Intersection or Union or Difference
    let opType = Math.random();
    let qText, visual, opts, correct;

    if (opType < 0.33) {
        qText = "Determine la Intersección (A ∩ B):";
        visual = `A={1,2,3,4}, B={3,4,5,6}`;
        opts = ["{1, 2}", "{3, 4}", "{1, 2, 3, 4, 5, 6}", "∅"];
        correct = 1;
    } else if (opType < 0.66) {
        qText = "Determine la Diferencia (A - B):";
        visual = `A={1,2,3,4}, B={3,4,5,6}`;
        opts = ["{1, 2}", "{3, 4}", "{5, 6}", "{1, 2, 3, 4}"];
        correct = 0;
    } else {
        qText = "Determine la Cardinalidad de A U B:";
        visual = `A={a,b,c}, B={c,d,e}`;
        opts = ["3", "6", "5", "4"]; // Union is {a,b,c,d,e} = 5
        correct = 2;
    }

    return {
        module: 'sets',
        category: 'Teoría de Conjuntos',
        text: qText,
        visual: `<div class='set-text'>${visual}</div>`,
        options: opts,
        correct: correct
    };
}

// -- FUNCTIONS MODULE --
function generateFunctionQuestion() {
    // Identify graphs
    const types = [
        { name: "Lineal", svg: `<svg width=100 height=100><line x1=0 y1=100 x2=100 y2=0 stroke=black stroke-width=2 /></svg>`, desc: "y = mx + b" },
        { name: "Cuadrática", svg: `<svg width=100 height=100><path d="M0 0 Q50 200 100 0" stroke=black fill=none stroke-width=2 /></svg>`, desc: "y = x²" },
        { name: "Constante", svg: `<svg width=100 height=100><line x1=0 y1=50 x2=100 y2=50 stroke=black stroke-width=2 /></svg>`, desc: "y = k" },
        { name: "Exponencial", svg: `<svg width=100 height=100><path d="M0 100 Q80 90 100 0" stroke=black fill=none stroke-width=2 /></svg>`, desc: "y = e^x" }
    ];

    let t = types[Math.floor(Math.random() * types.length)];
    // Randomize options
    let correctName = t.name;
    let opts = ["Lineal", "Cuadrática", "Constante", "Exponencial"]; // fixed list for simplicity
    let correctIdx = opts.indexOf(correctName);

    return {
        module: 'funcs',
        category: 'Funciones',
        text: "Identifique el tipo de función representada en el gráfico:",
        visual: `<div style="border:1px solid #ccc; background:white;">${t.svg}</div>`,
        options: opts,
        correct: correctIdx
    };
}

// --- UI LOGIC ---

function renderNav() {
    const map = { 'logic': 'nav-logic', 'sets': 'nav-sets', 'funcs': 'nav-funcs' };

    questions.forEach((q, idx) => {
        const btn = document.createElement('div');
        btn.classList.add('nav-btn');
        btn.textContent = idx + 1;
        btn.dataset.idx = idx;
        btn.onclick = () => loadQuestion(idx);
        document.getElementById(map[q.module]).appendChild(btn);
    });
}

function loadQuestion(idx) {
    currentQuestionIndex = idx;
    const q = questions[idx];

    document.getElementById('q-title').textContent = `Pregunta ${idx + 1}`;
    document.getElementById('q-category').textContent = q.category;
    document.getElementById('q-text').textContent = q.text;
    document.getElementById('visual-container').innerHTML = q.visual;

    // Options
    const optsDiv = document.getElementById('options-area');
    optsDiv.innerHTML = '';

    q.options.forEach((optText, optIdx) => {
        const wrapper = document.createElement('label');
        wrapper.classList.add('option-wrapper');

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'option';
        radio.value = optIdx;
        radio.onchange = () => selectAnswer(idx, optIdx);

        if (userAnswers[idx] === optIdx) radio.checked = true;

        wrapper.appendChild(radio);
        wrapper.appendChild(document.createTextNode(optText));
        optsDiv.appendChild(wrapper);
    });

    // Update nav states
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-btn[data-idx="${idx}"]`).classList.add('active');

    // Buttons
    document.getElementById('prev-btn').disabled = (idx === 0);
    document.getElementById('next-btn').textContent = (idx === questions.length - 1) ? "Finalizar" : "Siguiente";
}

function selectAnswer(qIdx, optIdx) {
    userAnswers[qIdx] = optIdx;
    answeredCount++;
    document.querySelector(`.nav-btn[data-idx="${qIdx}"]`).classList.add('answered');
}

document.getElementById('next-btn').onclick = () => {
    if (currentQuestionIndex < questions.length - 1) {
        loadQuestion(currentQuestionIndex + 1);
    } else {
        finishExam();
    }
};

document.getElementById('prev-btn').onclick = () => {
    if (currentQuestionIndex > 0) {
        loadQuestion(currentQuestionIndex - 1);
    }
};

document.getElementById('submit-exam-btn').onclick = finishExam;

function finishExam() {
    // Calculate Score
    let correct = 0;
    questions.forEach((q, i) => {
        if (userAnswers[i] === q.correct) correct++;
    });

    let pct = Math.round((correct / questions.length) * 100);

    alert(`Evaluación Finalizada.\n\nPuntaje: ${pct}%\nResultado: ${pct >= 70 ? "APROBADO" : "RECHAZADO"}`);

    // Save
    let currentLvl = parseInt(localStorage.getItem('vico_level_math_exam')) || 0;
    if (pct >= 70) {
        localStorage.setItem('vico_level_math_exam', currentLvl + 1);
        location.reload(); // Regen exam for next level
    } else {
        location.reload();
    }
}

// Timer
function startTimer() {
    setInterval(() => {
        timer--;
        let m = Math.floor(timer / 60);
        let s = timer % 60;
        document.getElementById('exam-timer').textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }, 1000);
}

// Boss Key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('boss-overlay').classList.toggle('hidden');
    }
});

// Init
generateExam();
