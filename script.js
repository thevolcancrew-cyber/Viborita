const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const targetScoreDisplay = document.getElementById('targetScore');
const modeNameDisplay = document.getElementById('modeName');
const menu = document.getElementById('menu');
const gameContainer = document.getElementById('game-container');

// Tablero exacto de 64 x 64 casillas
const totalCols = 64;
const totalRows = 64;

let snake = [];
let foods = [];
let dx = 1;
let dy = 0;
let score = 0;
let gameInterval = null;
let currentMode = 'classic';
let foodMultiplier = 1;

// Configurar los botones de movimiento al cargar el script
document.getElementById('upBtn').addEventListener('click', () => { if (dy === 0) { dx = 0; dy = -1; } });
document.getElementById('downBtn').addEventListener('click', () => { if (dy === 0) { dx = 0; dy = 1; } });
document.getElementById('leftBtn').addEventListener('click', () => { if (dx === 0) { dx = -1; dy = 0; } });
document.getElementById('rightBtn').addEventListener('click', () => { if (dx === 0) { dx = 1; dy = 0; } });

function startGame(mode) {
    currentMode = mode;
    menu.style.display = 'none';
    gameContainer.style.display = 'flex';
    
    if (mode === 'classic') {
        modeNameDisplay.innerText = 'Clásico';
        targetScoreDisplay.style.display = 'inline';
        targetScoreDisplay.previousSibling.textContent = '/';
    } else {
        modeNameDisplay.innerText = 'Infinito';
        targetScoreDisplay.style.display = 'none';
        targetScoreDisplay.previousSibling.textContent = '';
    }
    
    resetGame();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(main, 100);
}

function backToMenu() {
    if (gameInterval) clearInterval(gameInterval);
    gameContainer.style.display = 'none';
    menu.style.display = 'flex';
}

function main() {
    if (hasGameEnded()) {
        clearInterval(gameInterval);
        alert('¡Juego terminado! Puntuación final: ' + score);
        backToMenu();
        return;
    }

    if (currentMode === 'classic' && score >= 100) {
        clearInterval(gameInterval);
        alert('🎉 ¡FELICIDADES! ¡Ganaste el Modo Clásico con 100 puntos!');
        backToMenu();
        return;
    }

    clearCanvas();
    drawFood();
    moveSnake();
    drawSnake();
}

function clearCanvas() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    const cellWidth = canvas.width / totalCols;
    const cellHeight = canvas.height / totalRows;

    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? '#00ffcc' : '#00aa88';
        let pWidth = cellWidth * 0.8;
        let pHeight = cellHeight * 0.8;
        let offsetX = (cellWidth - pWidth) / 2;
        let offsetY = (cellHeight - pHeight) / 2;
        ctx.fillRect((part.x * cellWidth) + offsetX, (part.y * cellHeight) + offsetY, pWidth, pHeight);
    });
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (currentMode === 'infinite') {
        if (head.x < 0) head.x = totalCols - 1;
        if (head.x >= totalCols) head.x = 0;
        if (head.y < 0) head.y = totalRows - 1;
        if (head.y >= totalRows) head.y = 0;
    }

    snake.unshift(head);

    let eatenIndex = -1;
    foods.forEach((food, index) => {
        if (snake[0].x === food.x && snake[0].y === food.y) {
            eatenIndex = index;
        }
    });

    if (eatenIndex !== -1) {
        score += 10;
        scoreDisplay.innerText = score;
        foods.splice(eatenIndex, 1);

        if (foods.length === 0) {
            foodMultiplier = foodMultiplier * 2;
            if (foodMultiplier > 16) foodMultiplier = 16;
            spawnMultipleFoods(foodMultiplier);
        }
    } else {
        snake.pop();
    }
}

function spawnMultipleFoods(count) {
    foods = [];
    const maxCellsTotal = totalCols * totalRows;
    let availableSlots = maxCellsTotal - snake.length;
    if (count > availableSlots) count = Math.max(1, availableSlots);

    for (let i = 0; i < count; i++) {
        let newFood;
        let collision;
        let safetyCounter = 0;
        do {
            collision = false;
            newFood = {
                x: Math.floor(Math.random() * totalCols),
                y: Math.floor(Math.random() * totalRows)
            };
            snake.forEach(part => { if (part.x === newFood.x && part.y === newFood.y) collision = true; });
            foods.forEach(f => { if (f.x === newFood.x && f.y === newFood.y) collision = true; });
            
            safetyCounter++;
            if (safetyCounter > 100) break;
        } while (collision);

        foods.push(newFood);
    }
}

function drawFood() {
    const cellWidth = canvas.width / totalCols;
    const cellHeight = canvas.height / totalRows;

    ctx.fillStyle = '#ff3333';
    foods.forEach(food => {
        let fWidth = cellWidth * 0.75;
        let fHeight = cellHeight * 0.75;
        let offsetX = (cellWidth - fWidth) / 2;
        let offsetY = (cellHeight - fHeight) / 2;
        ctx.fillRect((food.x * cellWidth) + offsetX, (food.y * cellHeight) + offsetY, fWidth, fHeight);
    });
}

function hasGameEnded() {
    if (currentMode === 'classic') {
        if (snake[0].x < 0 || snake[0].x >= totalCols || snake[0].y < 0 || snake[0].y >= totalRows) {
            return true;
        }
    }

    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }

    return false;
}

function resetGame() {
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    dx = 1;
    dy = 0;
    score = 0;
    foodMultiplier = 1;
    scoreDisplay.innerText = score;
    spawnMultipleFoods(1);
}

// Registro del Service Worker para habilitar la instalación como app (PWA)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
