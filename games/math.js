// ============================================
// MATH PLAYGROUND - Complete Game Logic
// Problem generation, scoring, feedback system
// ============================================

// Game Configuration
const CONFIG = {
  difficulties: {
    easy: {
      range: { min: 1, max: 10 },
      operations: ['+', '-'],
      timePerProblem: 30
    },
    medium: {
      range: { min: 1, max: 50 },
      operations: ['+', '-', '×'],
      timePerProblem: 45
    },
    hard: {
      range: { min: 1, max: 100 },
      operations: ['+', '-', '×', '÷'],
      timePerProblem: 60
    }
  }
};

// Game State
let gameState = {
  difficulty: 'easy',
  totalProblems: 10,
  currentProblem: 0,
  correctAnswers: 0,
  streak: 0,
  bestStreak: 0,
  problems: [],
  currentAnswer: null,
  startTime: null,
  problemStartTime: null,
  totalTime: 0,
  soundEnabled: true,
  timerEnabled: true,
  timerInterval: null
};

// DOM Elements
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const resultsScreen = document.getElementById('resultsScreen');
const settingsModal = document.getElementById('settingsModal');

const operand1 = document.getElementById('operand1');
const operator = document.getElementById('operator');
const operand2 = document.getElementById('operand2');
const answerInput = document.getElementById('answerInput');
const submitButton = document.getElementById('submitAnswer');
const feedback = document.getElementById('feedback');
const feedbackIcon = document.getElementById('feedbackIcon');
const feedbackMessage = document.getElementById('feedbackMessage');
const timerFill = document.getElementById('timerFill');

const correctElement = document.getElementById('correct');
const streakElement = document.getElementById('streak');
const levelElement = document.getElementById('level');
const currentProblemElement = document.getElementById('currentProblem');
const totalProblemsElement = document.getElementById('totalProblems');

// ============================================
// Initialization
// ============================================

function init() {
  loadSettings();
  setupEventListeners();
  console.log('⚡ Math Playground Loaded!');
}

function loadSettings() {
  gameState.difficulty = localStorage.getItem('mathDifficulty') || 'easy';
  gameState.totalProblems = parseInt(localStorage.getItem('mathProblemCount')) || 10;
  gameState.soundEnabled = localStorage.getItem('mathSound') !== 'false';
  gameState.timerEnabled = localStorage.getItem('mathTimer') !== 'false';
  
  // Update UI
  document.getElementById('problemCount').value = gameState.totalProblems;
  document.getElementById('soundToggle').checked = gameState.soundEnabled;
  document.getElementById('timerToggle').checked = gameState.timerEnabled;
  
  // Set active difficulty button
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    if (btn.dataset.difficulty === gameState.difficulty) {
      btn.classList.add('active');
    }
  });
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
  // Difficulty buttons
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gameState.difficulty = btn.dataset.difficulty;
      localStorage.setItem('mathDifficulty', gameState.difficulty);
    });
  });
  
  // Start button
  document.getElementById('startButton').addEventListener('click', startGame);
  
  // Submit answer
  submitButton.addEventListener('click', submitAnswer);
  answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      submitAnswer();
    }
  });
  
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
  gameState.currentProblem = 0;
  gameState.correctAnswers = 0;
  gameState.streak = 0;
  gameState.bestStreak = 0;
  gameState.problems = [];
  gameState.totalTime = 0;
  gameState.startTime = Date.now();
  
  // Update UI
  correctElement.textContent = 0;
  streakElement.textContent = 0;
  levelElement.textContent = 1;
  totalProblemsElement.textContent = gameState.totalProblems;
  
  // Generate all problems
  generateProblems();
  
  // Show game screen
  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  
  // Show first problem
  showNextProblem();
}

function generateProblems() {
  const config = CONFIG.difficulties[gameState.difficulty];
  
  for (let i = 0; i < gameState.totalProblems; i++) {
    const problem = generateProblem(config);
    gameState.problems.push(problem);
  }
}

function generateProblem(config) {
  const operation = config.operations[Math.floor(Math.random() * config.operations.length)];
  let num1, num2, answer;
  
  switch (operation) {
    case '+':
      num1 = randomInt(config.range.min, config.range.max);
      num2 = randomInt(config.range.min, config.range.max);
      answer = num1 + num2;
      break;
      
    case '-':
      num1 = randomInt(config.range.min, config.range.max);
      num2 = randomInt(config.range.min, num1); // Ensure positive result
      answer = num1 - num2;
      break;
      
    case '×':
      num1 = randomInt(config.range.min, Math.min(config.range.max, 20));
      num2 = randomInt(config.range.min, Math.min(config.range.max, 20));
      answer = num1 * num2;
      break;
      
    case '÷':
      // Generate division that results in whole number
      num2 = randomInt(2, 12);
      answer = randomInt(config.range.min, Math.floor(config.range.max / num2));
      num1 = num2 * answer;
      break;
  }
  
  return {
    num1,
    num2,
    operation,
    answer,
    userAnswer: null,
    correct: null,
    time: 0
  };
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function showNextProblem() {
  if (gameState.currentProblem >= gameState.totalProblems) {
    endGame();
    return;
  }
  
  const problem = gameState.problems[gameState.currentProblem];
  
  // Update display
  operand1.textContent = problem.num1;
  operator.textContent = problem.operation;
  operand2.textContent = problem.num2;
  currentProblemElement.textContent = gameState.currentProblem + 1;
  
  // Clear input and feedback
  answerInput.value = '';
  answerInput.focus();
  feedback.classList.add('hidden');
  feedback.classList.remove('correct', 'incorrect');
  
  // Store current answer
  gameState.currentAnswer = problem.answer;
  
  // Start timer
  gameState.problemStartTime = Date.now();
  if (gameState.timerEnabled) {
    startTimer();
  } else {
    timerFill.style.width = '100%';
  }
}

function startTimer() {
  const config = CONFIG.difficulties[gameState.difficulty];
  const duration = config.timePerProblem * 1000; // Convert to ms
  const startTime = Date.now();
  
  timerFill.style.width = '100%';
  timerFill.style.transition = `width ${duration}ms linear`;
  
  // Trigger reflow to restart animation
  void timerFill.offsetWidth;
  timerFill.style.width = '0%';
  
  // Clear existing timer
  if (gameState.timerInterval) {
    clearTimeout(gameState.timerInterval);
  }
  
  // Auto-submit if time runs out
  gameState.timerInterval = setTimeout(() => {
    if (answerInput.value.trim() === '') {
      showFeedback(false, `Time's up! Answer was ${gameState.currentAnswer}`);
      setTimeout(() => {
        gameState.currentProblem++;
        showNextProblem();
      }, 2000);
    }
  }, duration);
}

function submitAnswer() {
  const userAnswer = parseInt(answerInput.value);
  
  if (isNaN(userAnswer)) {
    return; // Ignore empty or invalid inputs
  }
  
  // Clear timer
  if (gameState.timerInterval) {
    clearTimeout(gameState.timerInterval);
  }
  
  // Calculate time taken
  const timeTaken = (Date.now() - gameState.problemStartTime) / 1000;
  
  // Store result
  const problem = gameState.problems[gameState.currentProblem];
  problem.userAnswer = userAnswer;
  problem.time = timeTaken;
  problem.correct = userAnswer === gameState.currentAnswer;
  
  // Update stats
  if (problem.correct) {
    gameState.correctAnswers++;
    gameState.streak++;
    gameState.bestStreak = Math.max(gameState.bestStreak, gameState.streak);
    correctElement.textContent = gameState.correctAnswers;
    streakElement.textContent = gameState.streak;
    
    // Level up every 3 correct answers
    const level = Math.floor(gameState.correctAnswers / 3) + 1;
    levelElement.textContent = level;
    
    showFeedback(true, getCorrectMessage());
    playSound('correct');
  } else {
    gameState.streak = 0;
    streakElement.textContent = 0;
    showFeedback(false, `Not quite! Answer was ${gameState.currentAnswer}`);
    playSound('incorrect');
  }
  
  // Move to next problem after delay
  setTimeout(() => {
    gameState.currentProblem++;
    showNextProblem();
  }, 1500);
}

function showFeedback(correct, message) {
  feedback.classList.remove('hidden');
  feedback.classList.add(correct ? 'correct' : 'incorrect');
  feedbackIcon.textContent = correct ? '✓' : '✗';
  feedbackMessage.textContent = message;
}

function getCorrectMessage() {
  const messages = [
    'Perfect! 🎯',
    'Excellent! ⭐',
    'Great job! 👏',
    'Well done! 💪',
    'Fantastic! 🌟',
    'Brilliant! 🎉',
    'Amazing! ✨',
    'Super! 🚀'
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function endGame() {
  gameScreen.classList.add('hidden');
  resultsScreen.classList.remove('hidden');
  
  // Calculate stats
  const accuracy = Math.round((gameState.correctAnswers / gameState.totalProblems) * 100);
  const totalTime = (Date.now() - gameState.startTime) / 1000;
  const avgTime = (totalTime / gameState.totalProblems).toFixed(1);
  
  // Update results display
  document.getElementById('finalCorrect').textContent = `${gameState.correctAnswers}/${gameState.totalProblems}`;
  document.getElementById('finalAccuracy').textContent = `${accuracy}%`;
  document.getElementById('finalStreak').textContent = gameState.bestStreak;
  document.getElementById('avgTime').textContent = `${avgTime}s`;
  
  // Set results icon and message based on performance
  const resultsIcon = document.getElementById('resultsIcon');
  const resultsTitle = document.getElementById('resultsTitle');
  const encouragementMessage = document.getElementById('encouragementMessage');
  
  if (accuracy >= 90) {
    resultsIcon.textContent = '🏆';
    resultsTitle.textContent = 'Outstanding!';
    encouragementMessage.textContent = 'You\'re a math superstar! Your accuracy is incredible!';
  } else if (accuracy >= 70) {
    resultsIcon.textContent = '🎉';
    resultsTitle.textContent = 'Great Job!';
    encouragementMessage.textContent = 'Excellent work! Keep practicing and you\'ll master this!';
  } else if (accuracy >= 50) {
    resultsIcon.textContent = '💪';
    resultsTitle.textContent = 'Good Effort!';
    encouragementMessage.textContent = 'You\'re making progress! Practice makes perfect!';
  } else {
    resultsIcon.textContent = '🌱';
    resultsTitle.textContent = 'Keep Going!';
    encouragementMessage.textContent = 'Every expert was once a beginner. You\'re doing great!';
  }
  
  // Update parent page stats
  if (window.parent && window.parent.updateGameStats) {
    window.parent.updateGameStats('math', gameState.correctAnswers * 10);
  }
  
  // Save high score
  const currentHighScore = parseInt(localStorage.getItem('mathHighScore')) || 0;
  if (gameState.bestStreak > currentHighScore) {
    localStorage.setItem('mathHighScore', gameState.bestStreak);
  }
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
  
  if (type === 'correct') {
    // Happy ascending tone
    oscillator.frequency.value = 523.25; // C5
    gainNode.gain.value = 0.1;
    oscillator.start();
    
    setTimeout(() => {
      oscillator.frequency.value = 659.25; // E5
    }, 100);
    
    oscillator.stop(audioContext.currentTime + 0.2);
  } else if (type === 'incorrect') {
    // Gentle descending tone
    oscillator.frequency.value = 392; // G4
    gainNode.gain.value = 0.08;
    oscillator.start();
    
    setTimeout(() => {
      oscillator.frequency.value = 329.63; // E4
    }, 150);
    
    oscillator.stop(audioContext.currentTime + 0.3);
  }
}

// ============================================
// Settings
// ============================================

function saveSettings() {
  const problemCount = parseInt(document.getElementById('problemCount').value);
  const soundEnabled = document.getElementById('soundToggle').checked;
  const timerEnabled = document.getElementById('timerToggle').checked;
  
  gameState.totalProblems = problemCount;
  gameState.soundEnabled = soundEnabled;
  gameState.timerEnabled = timerEnabled;
  
  localStorage.setItem('mathProblemCount', problemCount);
  localStorage.setItem('mathSound', soundEnabled);
  localStorage.setItem('mathTimer', timerEnabled);
  
  settingsModal.classList.add('hidden');
}

// ============================================
// Initialize Game
// ============================================

init();