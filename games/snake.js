// ============================================
// SNAKE GAME - Complete Game Logic
// Smooth controls, progressive difficulty, sound effects
// ============================================

// Game Configuration
const CONFIG = {
  gridSize: 20,
  initialSpeed: 150,
  speedIncrease: 5,
  baseScore: 10,
  difficulties: {
    easy: { speed: 200, speedIncrease: 3 },
    normal: { speed: 150, speedIncrease: 5 },
    hard: { speed: 100, speedIncrease: 8 }
  }
};

// Game State
let gameState = {
  snake: [],
  food: null,
  direction: 'right',
  nextDirection: 'right',
  score: 0,
  highScore: 0,
  level: 1,
  speed: CONFIG.initialSpeed,
  gameLoop: null,
  isPaused: false,
  isGameOver: false,
  difficulty: 'normal',
  soundEnabled: true,
  gridEnabled: true
};

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const cellSize = canvas.width / CONFIG.gridSize;

// DOM Elements
const startScreen = document.getElementById('startScreen');
const pauseScreen = document.getElementById('pauseScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const levelElement = document.getElementById('level');
const finalScoreElement = document.getElementById('finalScore');
const encouragementElement = document.getElementById('encouragement');
const settingsModal = document.getElementById('settingsModal');

// ============================================
// Initialization
// ============================================

function init() {
  // Load saved settings
  loadSettings();
  loadHighScore();
  
  // Set up event listeners
  setupEventListeners();
  
  // Show start screen
  startScreen.classList.remove('hidden');
  
  console.log('🐍 Snake Game Loaded!');
}

function loadSettings() {
  gameState.difficulty = localStorage.getItem('snakeDifficulty') || 'normal';
  gameState.soundEnabled = localStorage.getItem('snakeSound') !== 'false';
  gameState.gridEnabled = localStorage.getItem('snakeGrid') !== 'false';
  
  // Update settings UI
  document.getElementById('difficultySelect').value = gameState.difficulty;
  document.getElementById('soundToggle').checked = gameState.soundEnabled;
  document.getElementById('gridToggle').checked = gameState.gridEnabled;
}

function loadHighScore() {
  gameState.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
  highScoreElement.textContent = gameState.highScore;
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
  // Start button
  document.getElementById('startButton').addEventListener('click', startGame);
  
  // Resume button
  document.getElementById('resumeButton').addEventListener('click', resumeGame);
  
  // Restart buttons
  document.getElementById('restartFromPause').addEventListener('click', restartGame);
  document.getElementById('playAgainButton').addEventListener('click', restartGame);
  
  // Quit buttons
  document.getElementById('quitButton').addEventListener('click', () => {
    window.location.href = '../index.html';
  });
  document.getElementById('homeButton').addEventListener('click', () => {
    window.location.href = '../index.html';
  });
  
  // Keyboard controls
  document.addEventListener('keydown', handleKeyPress);
  
  // Mobile controls
  document.querySelectorAll('.d-pad-btn[data-direction]').forEach(btn => {
    btn.addEventListener('click', () => {
      const direction = btn.dataset.direction;
      changeDirection(direction);
    });
  });
  
  document.getElementById('mobilePause').addEventListener('click', togglePause);
  
  // Settings
  document.getElementById('settingsBtn').addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
  });
  
  document.getElementById('closeSettings').addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });
  
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  
  // Click outside modal to close
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.add('hidden');
    }
  });
}

function handleKeyPress(e) {
  // Prevent default for arrow keys
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault();
  }
  
  // Pause/Resume with Space
  if (e.key === ' ' && !gameState.isGameOver && !startScreen.classList.contains('hidden') === false) {
    togglePause();
    return;
  }
  
  // Direction controls
  const directionMap = {
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'w': 'up',
    'W': 'up',
    's': 'down',
    'S': 'down',
    'a': 'left',
    'A': 'left',
    'd': 'right',
    'D': 'right'
  };
  
  const direction = directionMap[e.key];
  if (direction) {
    changeDirection(direction);
  }
}

function changeDirection(newDirection) {
  // Prevent opposite direction (can't go back on itself)
  const opposites = {
    'up': 'down',
    'down': 'up',
    'left': 'right',
    'right': 'left'
  };
  
  if (gameState.direction !== opposites[newDirection]) {
    gameState.nextDirection = newDirection;
  }
}

// ============================================
// Game Logic
// ============================================

function startGame() {
  // Initialize game state
  gameState.snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  
  gameState.direction = 'right';
  gameState.nextDirection = 'right';
  gameState.score = 0;
  gameState.level = 1;
  gameState.isPaused = false;
  gameState.isGameOver = false;
  
  // Set speed based on difficulty
  const diff = CONFIG.difficulties[gameState.difficulty];
  gameState.speed = diff.speed;
  
  // Place first food
  placeFood();
  
  // Update UI
  scoreElement.textContent = gameState.score;
  levelElement.textContent = gameState.level;
  
  // Hide start screen
  startScreen.classList.add('hidden');
  
  // Start game loop
  gameState.gameLoop = setInterval(gameUpdate, gameState.speed);
  
  // Draw initial state
  draw();
}

function gameUpdate() {
  if (gameState.isPaused || gameState.isGameOver) return;
  
  // Update direction
  gameState.direction = gameState.nextDirection;
  
  // Calculate new head position
  const head = { ...gameState.snake[0] };
  
  switch (gameState.direction) {
    case 'up':
      head.y -= 1;
      break;
    case 'down':
      head.y += 1;
      break;
    case 'left':
      head.x -= 1;
      break;
    case 'right':
      head.x += 1;
      break;
  }
  
  // Check wall collision
  if (head.x < 0 || head.x >= CONFIG.gridSize || head.y < 0 || head.y >= CONFIG.gridSize) {
    endGame();
    return;
  }
  
  // Check self collision
  if (gameState.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    endGame();
    return;
  }
  
  // Add new head
  gameState.snake.unshift(head);
  
  // Check food collision
  if (head.x === gameState.food.x && head.y === gameState.food.y) {
    // Eat food
    eatFood();
  } else {
    // Remove tail
    gameState.snake.pop();
  }
  
  // Draw
  draw();
}

function eatFood() {
  // Increase score
  const diff = CONFIG.difficulties[gameState.difficulty];
  gameState.score += CONFIG.baseScore * gameState.level;
  scoreElement.textContent = gameState.score;
  
  // Update high score
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    highScoreElement.textContent = gameState.highScore;
    localStorage.setItem('snakeHighScore', gameState.highScore);
  }
  
  // Level up every 5 foods
  if (gameState.snake.length % 5 === 0) {
    gameState.level++;
    levelElement.textContent = gameState.level;
    
    // Increase speed
    clearInterval(gameState.gameLoop);
    gameState.speed = Math.max(50, gameState.speed - diff.speedIncrease);
    gameState.gameLoop = setInterval(gameUpdate, gameState.speed);
  }
  
  // Play sound
  playSound('eat');
  
  // Place new food
  placeFood();
}

function placeFood() {
  let newFood;
  let isValid = false;
  
  while (!isValid) {
    newFood = {
      x: Math.floor(Math.random() * CONFIG.gridSize),
      y: Math.floor(Math.random() * CONFIG.gridSize)
    };
    
    // Check if food is not on snake
    isValid = !gameState.snake.some(segment => 
      segment.x === newFood.x && segment.y === newFood.y
    );
  }
  
  gameState.food = newFood;
}

function endGame() {
  gameState.isGameOver = true;
  clearInterval(gameState.gameLoop);
  
  // Update parent page stats
  if (window.parent && window.parent.updateGameStats) {
    window.parent.updateGameStats('snake', gameState.score);
  }
  
  // Play game over sound
  playSound('gameOver');
  
  // Show game over screen
  finalScoreElement.textContent = gameState.score;
  encouragementElement.textContent = getEncouragement();
  gameOverScreen.classList.remove('hidden');
}

function getEncouragement() {
  const messages = [
    "Excellent effort! 🌟",
    "You're getting better! 🎯",
    "Great job! Keep it up! 💪",
    "Impressive focus! 🧠",
    "Well played! 👏",
    "You're a natural! 🐍",
    "Amazing run! ⭐",
    "Keep practicing! 🎮"
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

function restartGame() {
  // Hide all overlays
  pauseScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  
  // Clear existing game loop
  if (gameState.gameLoop) {
    clearInterval(gameState.gameLoop);
  }
  
  // Start new game
  startGame();
}

function togglePause() {
  if (gameState.isGameOver) return;
  
  gameState.isPaused = !gameState.isPaused;
  
  if (gameState.isPaused) {
    pauseScreen.classList.remove('hidden');
  } else {
    pauseScreen.classList.add('hidden');
  }
}

function resumeGame() {
  gameState.isPaused = false;
  pauseScreen.classList.add('hidden');
}

// ============================================
// Drawing Functions
// ============================================

function draw() {
  // Clear canvas
  ctx.fillStyle = '#0f1629';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid (if enabled)
  if (gameState.gridEnabled) {
    drawGrid();
  }
  
  // Draw food with glow
  drawFood();
  
  // Draw snake
  drawSnake();
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  
  for (let i = 0; i <= CONFIG.gridSize; i++) {
    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, canvas.height);
    ctx.stroke();
    
    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(canvas.width, i * cellSize);
    ctx.stroke();
  }
}

function drawSnake() {
  gameState.snake.forEach((segment, index) => {
    const x = segment.x * cellSize;
    const y = segment.y * cellSize;
    
    if (index === 0) {
      // Draw head with gradient
      const gradient = ctx.createRadialGradient(
        x + cellSize / 2, y + cellSize / 2, 0,
        x + cellSize / 2, y + cellSize / 2, cellSize / 2
      );
      gradient.addColorStop(0, '#22c55e');
      gradient.addColorStop(1, '#16a34a');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
      
      // Draw eyes
      const eyeSize = cellSize / 6;
      ctx.fillStyle = '#0f1629';
      
      if (gameState.direction === 'right') {
        ctx.fillRect(x + cellSize * 0.6, y + cellSize * 0.25, eyeSize, eyeSize);
        ctx.fillRect(x + cellSize * 0.6, y + cellSize * 0.6, eyeSize, eyeSize);
      } else if (gameState.direction === 'left') {
        ctx.fillRect(x + cellSize * 0.2, y + cellSize * 0.25, eyeSize, eyeSize);
        ctx.fillRect(x + cellSize * 0.2, y + cellSize * 0.6, eyeSize, eyeSize);
      } else if (gameState.direction === 'up') {
        ctx.fillRect(x + cellSize * 0.25, y + cellSize * 0.2, eyeSize, eyeSize);
        ctx.fillRect(x + cellSize * 0.6, y + cellSize * 0.2, eyeSize, eyeSize);
      } else {
        ctx.fillRect(x + cellSize * 0.25, y + cellSize * 0.6, eyeSize, eyeSize);
        ctx.fillRect(x + cellSize * 0.6, y + cellSize * 0.6, eyeSize, eyeSize);
      }
    } else {
      // Draw body with gradient
      const opacity = 1 - (index / gameState.snake.length) * 0.3;
      ctx.fillStyle = `rgba(74, 222, 128, ${opacity})`;
      ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
    }
  });
}

function drawFood() {
  const x = gameState.food.x * cellSize;
  const y = gameState.food.y * cellSize;
  
  // Draw glow
  const glow = ctx.createRadialGradient(
    x + cellSize / 2, y + cellSize / 2, 0,
    x + cellSize / 2, y + cellSize / 2, cellSize
  );
  glow.addColorStop(0, 'rgba(248, 113, 113, 0.4)');
  glow.addColorStop(1, 'rgba(248, 113, 113, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - cellSize / 2, y - cellSize / 2, cellSize * 2, cellSize * 2);
  
  // Draw food
  const gradient = ctx.createRadialGradient(
    x + cellSize / 2, y + cellSize / 2, 0,
    x + cellSize / 2, y + cellSize / 2, cellSize / 2
  );
  gradient.addColorStop(0, '#fca5a5');
  gradient.addColorStop(1, '#f87171');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================
// Sound Effects
// ============================================

function playSound(type) {
  if (!gameState.soundEnabled) return;
  
  // Create simple beep sounds using Web Audio API
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  if (type === 'eat') {
    oscillator.frequency.value = 440;
    gainNode.gain.value = 0.1;
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  } else if (type === 'gameOver') {
    oscillator.frequency.value = 220;
    gainNode.gain.value = 0.15;
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  }
}

// ============================================
// Settings
// ============================================

function saveSettings() {
  const difficulty = document.getElementById('difficultySelect').value;
  const soundEnabled = document.getElementById('soundToggle').checked;
  const gridEnabled = document.getElementById('gridToggle').checked;
  
  gameState.difficulty = difficulty;
  gameState.soundEnabled = soundEnabled;
  gameState.gridEnabled = gridEnabled;
  
  localStorage.setItem('snakeDifficulty', difficulty);
  localStorage.setItem('snakeSound', soundEnabled);
  localStorage.setItem('snakeGrid', gridEnabled);
  
  settingsModal.classList.add('hidden');
  
  // Redraw if in game
  if (!startScreen.classList.contains('hidden') && !gameState.isGameOver) {
    draw();
  }
}

// ============================================
// Initialize Game
// ============================================

init();