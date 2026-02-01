// ============================================
// MEMORY MATCH - Complete Game Logic
// Card matching, timer, animations
// ============================================

// Theme Collections
const THEMES = {
  emojis: ['😀', '🎮', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎹', '🎺', '🎻', '🎬', '🎤', '🎧', '🎼', '🎵', 
           '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🥋', '⛳', '🏌️', '🏹', '🎣'],
  numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16',
            '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32'],
  letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
            'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ']
};

// Game State
let gameState = {
  gridSize: 4,
  theme: 'emojis',
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  moves: 0,
  startTime: null,
  timerInterval: null,
  isProcessing: false,
  soundEnabled: true,
  timerEnabled: true,
  animationSpeed: 'normal'
};

// Animation Speed Settings
const ANIMATION_SPEEDS = {
  fast: 300,
  normal: 500,
  slow: 800
};

// DOM Elements
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const resultsScreen = document.getElementById('resultsScreen');
const settingsModal = document.getElementById('settingsModal');
const gameBoard = document.getElementById('gameBoard');

const movesElement = document.getElementById('moves');
const matchesElement = document.getElementById('matches');
const timerElement = document.getElementById('timer');

// ============================================
// Initialization
// ============================================

function init() {
  loadSettings();
  setupEventListeners();
  console.log('🧠 Memory Match Loaded!');
}

function loadSettings() {
  gameState.gridSize = parseInt(localStorage.getItem('memoryGridSize')) || 4;
  gameState.theme = localStorage.getItem('memoryTheme') || 'emojis';
  gameState.soundEnabled = localStorage.getItem('memorySound') !== 'false';
  gameState.timerEnabled = localStorage.getItem('memoryTimer') !== 'false';
  gameState.animationSpeed = localStorage.getItem('memoryAnimSpeed') || 'normal';
  
  // Update UI
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    if (parseInt(btn.dataset.grid) === gameState.gridSize) {
      btn.classList.add('active');
    }
  });
  
  document.querySelectorAll('.theme-btn').forEach(btn => {
    if (btn.dataset.theme === gameState.theme) {
      btn.classList.add('active');
    }
  });
  
  document.getElementById('soundToggle').checked = gameState.soundEnabled;
  document.getElementById('timerToggle').checked = gameState.timerEnabled;
  document.getElementById('animationSpeed').value = gameState.animationSpeed;
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
  // Grid size buttons
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gameState.gridSize = parseInt(btn.dataset.grid);
      localStorage.setItem('memoryGridSize', gameState.gridSize);
    });
  });
  
  // Theme buttons
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gameState.theme = btn.dataset.theme;
      localStorage.setItem('memoryTheme', gameState.theme);
    });
  });
  
  // Start button
  document.getElementById('startButton').addEventListener('click', startGame);
  
  // Results buttons
  document.getElementById('playAgainButton').addEventListener('click', () => {
    resultsScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
  });
  
  document.getElementById('homeButton').addEventListener('click', () => {
    window.location.href = '../index.html';
  });
  
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

// ============================================
// Game Logic
// ============================================

function startGame() {
  // Reset game state
  gameState.cards = [];
  gameState.flippedCards = [];
  gameState.matchedPairs = 0;
  gameState.moves = 0;
  gameState.startTime = Date.now();
  gameState.isProcessing = false;
  
  // Update UI
  movesElement.textContent = 0;
  matchesElement.textContent = 0;
  timerElement.textContent = '0:00';
  
  // Hide start screen, show game
  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  
  // Generate and display cards
  generateCards();
  renderCards();
  
  // Start timer
  if (gameState.timerEnabled) {
    startTimer();
  }
}

function generateCards() {
  const totalPairs = (gameState.gridSize * gameState.gridSize) / 2;
  const themeIcons = THEMES[gameState.theme];
  
  // Select random icons
  const selectedIcons = [];
  const usedIndices = new Set();
  
  while (selectedIcons.length < totalPairs) {
    const randomIndex = Math.floor(Math.random() * themeIcons.length);
    if (!usedIndices.has(randomIndex)) {
      selectedIcons.push(themeIcons[randomIndex]);
      usedIndices.add(randomIndex);
    }
  }
  
  // Create pairs
  const cardPairs = [...selectedIcons, ...selectedIcons];
  
  // Shuffle cards
  gameState.cards = shuffleArray(cardPairs).map((icon, index) => ({
    id: index,
    icon: icon,
    isFlipped: false,
    isMatched: false
  }));
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function renderCards() {
  gameBoard.innerHTML = '';
  gameBoard.className = `game-board grid-${gameState.gridSize}`;
  
  gameState.cards.forEach(card => {
    const cardElement = createCardElement(card);
    gameBoard.appendChild(cardElement);
  });
}

function createCardElement(card) {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'memory-card';
  cardDiv.dataset.id = card.id;
  
  cardDiv.innerHTML = `
    <div class="card-face card-front"></div>
    <div class="card-face card-back">${card.icon}</div>
  `;
  
  cardDiv.addEventListener('click', () => handleCardClick(card.id));
  
  return cardDiv;
}

function handleCardClick(cardId) {
  if (gameState.isProcessing) return;
  
  const card = gameState.cards[cardId];
  
  // Ignore if already flipped or matched
  if (card.isFlipped || card.isMatched) return;
  
  // Flip the card
  flipCard(cardId, true);
  gameState.flippedCards.push(cardId);
  
  // Check for match when two cards are flipped
  if (gameState.flippedCards.length === 2) {
    gameState.moves++;
    movesElement.textContent = gameState.moves;
    gameState.isProcessing = true;
    
    setTimeout(() => {
      checkMatch();
    }, ANIMATION_SPEEDS[gameState.animationSpeed]);
  }
}

function flipCard(cardId, flip) {
  const card = gameState.cards[cardId];
  card.isFlipped = flip;
  
  const cardElement = document.querySelector(`[data-id="${cardId}"]`);
  if (flip) {
    cardElement.classList.add('flipped');
  } else {
    cardElement.classList.remove('flipped');
  }
}

function checkMatch() {
  const [card1Id, card2Id] = gameState.flippedCards;
  const card1 = gameState.cards[card1Id];
  const card2 = gameState.cards[card2Id];
  
  if (card1.icon === card2.icon) {
    // Match found!
    card1.isMatched = true;
    card2.isMatched = true;
    
    const card1Element = document.querySelector(`[data-id="${card1Id}"]`);
    const card2Element = document.querySelector(`[data-id="${card2Id}"]`);
    card1Element.classList.add('matched');
    card2Element.classList.add('matched');
    
    gameState.matchedPairs++;
    matchesElement.textContent = gameState.matchedPairs;
    
    playSound('match');
    
    // Check win condition
    if (gameState.matchedPairs === gameState.cards.length / 2) {
      setTimeout(endGame, 500);
    }
  } else {
    // No match - flip cards back
    setTimeout(() => {
      flipCard(card1Id, false);
      flipCard(card2Id, false);
      playSound('miss');
    }, 800);
  }
  
  gameState.flippedCards = [];
  gameState.isProcessing = false;
}

function startTimer() {
  gameState.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

function endGame() {
  clearInterval(gameState.timerInterval);
  
  // Calculate stats
  const totalTime = Math.floor((Date.now() - gameState.startTime) / 1000);
  const minutes = Math.floor(totalTime / 60);
  const seconds = totalTime % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  const totalPairs = gameState.cards.length / 2;
  const perfectMoves = totalPairs;
  const efficiency = Math.round((perfectMoves / gameState.moves) * 100);
  
  // Update results
  document.getElementById('finalMoves').textContent = gameState.moves;
  document.getElementById('finalTime').textContent = timeString;
  document.getElementById('efficiency').textContent = `${efficiency}%`;
  
  // Save and display best time
  const bestTimeKey = `memoryBestTime_${gameState.gridSize}x${gameState.gridSize}`;
  const currentBestTime = parseInt(localStorage.getItem(bestTimeKey)) || Infinity;
  
  if (totalTime < currentBestTime) {
    localStorage.setItem(bestTimeKey, totalTime);
    document.getElementById('bestTime').textContent = timeString + ' 🆕';
  } else {
    const bestMinutes = Math.floor(currentBestTime / 60);
    const bestSeconds = currentBestTime % 60;
    document.getElementById('bestTime').textContent = `${bestMinutes}:${bestSeconds.toString().padStart(2, '0')}`;
  }
  
  // Set encouragement message
  const resultsIcon = document.getElementById('resultsIcon');
  const resultsTitle = document.getElementById('resultsTitle');
  const encouragementMessage = document.getElementById('encouragementMessage');
  
  if (efficiency >= 90) {
    resultsIcon.textContent = '🏆';
    resultsTitle.textContent = 'Perfect Memory!';
    encouragementMessage.textContent = 'Outstanding! You have an incredible memory!';
  } else if (efficiency >= 75) {
    resultsIcon.textContent = '🎉';
    resultsTitle.textContent = 'Great Job!';
    encouragementMessage.textContent = 'Excellent memory skills! Keep it up!';
  } else if (efficiency >= 60) {
    resultsIcon.textContent = '💪';
    resultsTitle.textContent = 'Well Done!';
    encouragementMessage.textContent = 'Good concentration! You\'re improving!';
  } else {
    resultsIcon.textContent = '🌱';
    resultsTitle.textContent = 'Nice Try!';
    encouragementMessage.textContent = 'Every game makes your memory stronger!';
  }
  
  // Update parent page stats
  if (window.parent && window.parent.updateGameStats) {
    window.parent.updateGameStats('memory', efficiency);
  }
  
  // Save high score
  const currentHighScore = parseInt(localStorage.getItem('memoryHighScore')) || 0;
  if (efficiency > currentHighScore) {
    localStorage.setItem('memoryHighScore', efficiency);
  }
  
  // Show results
  gameScreen.classList.add('hidden');
  resultsScreen.classList.remove('hidden');
}

// ============================================
// Sound Effects
// ============================================

function playSound(type) {
  if (!gameState.soundEnabled) return;
  
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  if (type === 'match') {
    // Happy ascending chime
    oscillator.frequency.value = 523.25; // C5
    gainNode.gain.value = 0.15;
    oscillator.start();
    
    setTimeout(() => {
      oscillator.frequency.value = 659.25; // E5
    }, 100);
    
    setTimeout(() => {
      oscillator.frequency.value = 783.99; // G5
    }, 200);
    
    oscillator.stop(audioContext.currentTime + 0.4);
  } else if (type === 'miss') {
    // Gentle tone
    oscillator.frequency.value = 329.63; // E4
    gainNode.gain.value = 0.08;
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  }
}

// ============================================
// Settings
// ============================================

function saveSettings() {
  const soundEnabled = document.getElementById('soundToggle').checked;
  const timerEnabled = document.getElementById('timerToggle').checked;
  const animationSpeed = document.getElementById('animationSpeed').value;
  
  gameState.soundEnabled = soundEnabled;
  gameState.timerEnabled = timerEnabled;
  gameState.animationSpeed = animationSpeed;
  
  localStorage.setItem('memorySound', soundEnabled);
  localStorage.setItem('memoryTimer', timerEnabled);
  localStorage.setItem('memoryAnimSpeed', animationSpeed);
  
  settingsModal.classList.add('hidden');
}

// ============================================
// Initialize Game
// ============================================

init();