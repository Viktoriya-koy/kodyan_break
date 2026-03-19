const boardElement = document.getElementById('sudoku-board');
const statusMsg = document.getElementById('status-msg');
const timerElement = document.getElementById('timer');
const cellsLeftElement = document.getElementById('cells-left');
const difficultyDisplay = document.getElementById('difficulty-display');
const batchDisplay = document.getElementById('batch-display');
const bossOverlay = document.getElementById('boss-overlay');

let grid = [];
let solution = [];
let selectedCellIndex = -1;
let currentBatch = 1;
let timer = 0;
let timerInterval;

// Sound Effects (Silent for stealth, but logic is here)
const playSound = (type) => {
    // Keeping it silent as requested for office environment
};

// --- SUDOKU GENERATION LOGIC ---

function generateSudoku() {
    // 1. Create empty 9x9 grid
    let newGrid = Array(81).fill(0);

    // 2. Fill diagonal 3x3 boxes (independent)
    fillDiagonal(newGrid);

    // 3. Solve the rest to create a valid complete board
    solveSudoku(newGrid);
    solution = [...newGrid]; // Store the solved state

    // 4. Remove digits to create the puzzle depending on "Batch" (Level)
    let diffObj = getDifficultySettings(currentBatch);
    removeDigits(newGrid, diffObj.holes);

    return newGrid;
}

function getDifficultySettings(batch) {
    if (batch <= 10) {
        // Nivel Junior (Fácil)
        return { name: "Junior", color: "#217346", holes: Math.min(30 + Math.floor(batch / 2), 35) };
    } else if (batch <= 20) {
        // Nivel Semi-Senior (Medio)
        return { name: "Semi-Senior", color: "#d97b00", holes: Math.min(40 + Math.floor((batch - 10) / 2), 45) };
    } else {
        // Nivel Senior (Difícil)
        return { name: "Senior", color: "#d93025", holes: Math.min(50 + Math.floor((batch - 20) / 2), 55) };
    }
}

function fillDiagonal(g) {
    for (let i = 0; i < 9; i = i + 3) {
        fillBox(g, i, i);
    }
}

function fillBox(g, row, col) {
    let num;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            do {
                num = Math.floor(Math.random() * 9) + 1;
            } while (!isSafeInBox(g, row, col, num));

            let idx = (row + i) * 9 + (col + j);
            g[idx] = num;
        }
    }
}

function isSafeInBox(g, rowStart, colStart, num) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let idx = (rowStart + i) * 9 + (colStart + j);
            if (g[idx] === num) return false;
        }
    }
    return true;
}

function isSafe(g, row, col, num) {
    // Check Row
    for (let x = 0; x < 9; x++) if (g[row * 9 + x] === num) return false;
    // Check Column
    for (let x = 0; x < 9; x++) if (g[x * 9 + col] === num) return false;
    // Check Box
    let startRow = row - row % 3;
    let startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (g[(startRow + i) * 9 + (startCol + j)] === num) return false;
        }
    }
    return true;
}

function solveSudoku(g) {
    let emptySpot = findUnassigned(g);
    if (!emptySpot) return true; // Solved

    let row = emptySpot[0];
    let col = emptySpot[1];
    let idx = row * 9 + col;

    for (let num = 1; num <= 9; num++) {
        if (isSafe(g, row, col, num)) {
            g[idx] = num;
            if (solveSudoku(g)) return true;
            g[idx] = 0; // Backtrack
        }
    }
    return false;
}

function findUnassigned(g) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (g[i * 9 + j] === 0) return [i, j];
        }
    }
    return null;
}

function removeDigits(g, count) {
    while (count > 0) {
        let cellId = Math.floor(Math.random() * 81);
        if (g[cellId] !== 0) {
            g[cellId] = 0;
            count--;
        }
    }
}

// --- GAME LOGIC ---

function initGame() {
    // Load progress
    let savedBatch = localStorage.getItem('vico_level_sudoku');
    if (savedBatch) currentBatch = parseInt(savedBatch);
    else localStorage.setItem('vico_level_sudoku', 1);

    if (currentBatch > 30) {
        // Ganaste el meta-juego
        document.querySelector('.grid-container').innerHTML = `<div style="text-align:center; padding: 50px; background: white; border-radius: 8px;"><h2>¡ASCENSO A SOCIO DIRECTOR! 🎉</h2><p>Has completado todas las conciliaciones.</p><a href="../index.html" style="display:inline-block; margin-top: 20px; padding: 10px 20px; background:#217346; color:white; text-decoration:none; font-weight:bold;">Regresar al Portal</a></div>`;
        return;
    }

    let diffObj = getDifficultySettings(currentBatch);

    // Sync dropdown
    const diffSelector = document.getElementById('diff-selector');
    if (currentBatch <= 10) diffSelector.value = "1";
    else if (currentBatch <= 20) diffSelector.value = "11";
    else diffSelector.value = "21";

    diffSelector.style.color = diffObj.color;
    batchDisplay.textContent = currentBatch;

    grid = generateSudoku();
    renderBoard();
    startTimer();
}

function renderBoard() {
    boardElement.innerHTML = '';
    let holes = 0;

    grid.forEach((num, index) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        let row = Math.floor(index / 9);
        let col = index % 9;

        // Add borders for 3x3 visualization (handled by CSS nth-child, but rows need class)
        if (row === 2 || row === 5) cell.style.borderBottom = '2px solid #000';
        if (row === 8) cell.style.borderBottom = 'none'; // bottom edge
        if (col === 2 || col === 5) cell.style.borderRight = '2px solid #000';

        if (num !== 0) {
            cell.textContent = num;
            cell.classList.add('fixed');
            cell.addEventListener('click', () => selectCell(index, cell)); // Añadido para que las celdas fijas también se resalten!
        } else {
            holes++;
            cell.addEventListener('click', () => selectCell(index, cell));
        }

        cell.dataset.index = index;
        boardElement.appendChild(cell);
    });

    cellsLeftElement.textContent = `Huecos: ${holes}`;
}

function selectCell(index, cellElement) {
    // Deselect previous
    if (selectedCellIndex !== -1) {
        const prev = document.querySelector(`.cell[data-index="${selectedCellIndex}"]`);
        if (prev) prev.classList.remove('selected');
    }

    // Remueve destacados previos
    document.querySelectorAll('.cell.highlight').forEach(c => c.classList.remove('highlight'));

    selectedCellIndex = index;
    cellElement.classList.add('selected');

    // Highlight related row, col, and 3x3 box
    let targetRow = Math.floor(index / 9);
    let targetCol = index % 9;

    let boxStartRow = targetRow - (targetRow % 3);
    let boxStartCol = targetCol - (targetCol % 3);

    document.querySelectorAll('.cell').forEach(c => {
        let idx = parseInt(c.dataset.index);
        let r = Math.floor(idx / 9);
        let col = idx % 9;

        let inRow = (r === targetRow);
        let inCol = (col === targetCol);
        let inBox = (r >= boxStartRow && r < boxStartRow + 3 && col >= boxStartCol && col < boxStartCol + 3);

        if ((inRow || inCol || inBox) && idx !== index) {
            c.classList.add('highlight');
        }
    });
}

function inputNum(num) {
    if (selectedCellIndex === -1) return;

    const cell = document.querySelector(`.cell[data-index="${selectedCellIndex}"]`);

    if (num === 0) {
        grid[selectedCellIndex] = 0;
        cell.textContent = '';
        cell.classList.remove('error');
    } else {
        grid[selectedCellIndex] = num;
        cell.textContent = num;

        // Instant Validation Feedback (Stealthy)
        if (solution[selectedCellIndex] !== num) {
            // Wrong number
            cell.classList.add('error');
            statusMsg.textContent = "ERROR DE VALIDACIÓN: DATO INCORRECTO";
            statusMsg.style.color = "red";
        } else {
            // Correct
            cell.classList.remove('error');
            statusMsg.textContent = "DATO VERIFICADO";
            statusMsg.style.color = "#217346";
            checkWin();
        }
    }
}

function checkWin() {
    // If grid matches solution
    let isFull = true;
    for (let i = 0; i < 81; i++) {
        if (grid[i] !== solution[i]) {
            isFull = false;
            break;
        }
    }

    if (isFull) {
        winLevel();
    }
}

function winLevel() {
    statusMsg.textContent = "LOTE COMPLETADO. GENERANDO NUEVA ASIGNACIÓN...";
    currentBatch++;
    localStorage.setItem('vico_level_sudoku', currentBatch);

    setTimeout(() => {
        initGame(); // Reset with harder difficulty
    }, 2000);
}

function useHint() {
    console.log("Supervisor hint requested...");
    let emptyCells = [];
    for (let i = 0; i < 81; i++) {
        if (grid[i] === 0) {
            emptyCells.push(i);
        }
    }

    if (emptyCells.length === 0) return; // No hay huecos

    // Elegir uno al azar
    let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    let correctNum = solution[randomIndex];

    // Simular que el usuario seleccionó y tipeó el número
    selectedCellIndex = randomIndex;
    const cellElement = document.querySelector(`.cell[data-index="${randomIndex}"]`);

    // Aplicar sin activar eventos extraños
    grid[randomIndex] = correctNum;
    cellElement.textContent = correctNum;
    cellElement.classList.remove('error');
    cellElement.classList.remove('selected');
    cellElement.classList.add('hint'); // Bloquearla e iluminarla

    // Penalización
    timer += 60;

    statusMsg.textContent = "CONSULTA REALIZADA: TIEMPO AÑADIDO (+60s)";
    statusMsg.style.color = "#d93025";

    // Actualizar huecos visuales
    const currentHoles = parseInt(cellsLeftElement.textContent.replace(/\D/g, '')) - 1;
    cellsLeftElement.textContent = `Huecos: ${currentHoles}`;

    checkWin();
}

// --- UTILS ---

function changeDifficulty(val) {
    localStorage.setItem('vico_level_sudoku', parseInt(val));
    location.reload();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer++;
        let m = Math.floor(timer / 60).toString().padStart(2, '0');
        let s = (timer % 60).toString().padStart(2, '0');
        timerElement.textContent = `${m}:${s}`;
    }, 1000);
}

// Input listeners
document.addEventListener('keydown', (e) => {
    // Boss Key
    if (e.key === 'Escape') {
        bossOverlay.classList.toggle('hidden');
    }

    // Numpad input
    if (selectedCellIndex !== -1) {
        if (e.key >= '1' && e.key <= '9') {
            inputNum(parseInt(e.key));
        }
        if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
            inputNum(0);
        }
    }

    // Arrow Navigation
    if (selectedCellIndex !== -1) {
        let row = Math.floor(selectedCellIndex / 9);
        let col = selectedCellIndex % 9;

        if (e.key === 'ArrowUp' && row > 0) selectCell(selectedCellIndex - 9, document.querySelector(`.cell[data-index="${selectedCellIndex - 9}"]`));
        if (e.key === 'ArrowDown' && row < 8) selectCell(selectedCellIndex + 9, document.querySelector(`.cell[data-index="${selectedCellIndex + 9}"]`));
        if (e.key === 'ArrowLeft' && col > 0) selectCell(selectedCellIndex - 1, document.querySelector(`.cell[data-index="${selectedCellIndex - 1}"]`));
        if (e.key === 'ArrowRight' && col < 8) selectCell(selectedCellIndex + 1, document.querySelector(`.cell[data-index="${selectedCellIndex + 1}"]`));
    }
});

// Start
initGame();
