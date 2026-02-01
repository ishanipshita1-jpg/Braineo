// ============================================
// BRAINEO - Main JavaScript
// Handles music, stats, and home page interactions
// ============================================

console.log("🎮 Braineo Loaded Successfully");

// ============================================
// Music Control
// ============================================

const ambient = document.getElementById('ambient');
const musicToggle = document.getElementById('musicToggle');

// Check if music was playing from previous session
let isMusicPlaying = localStorage.getItem('musicPlaying') === 'true';

// Initialize music state
if (isMusicPlaying) {
  ambient.volume = 0.3; // Set gentle volume for relaxation
  ambient.play().catch(err => {
    console.log('Autoplay prevented:', err);
    isMusicPlaying = false;
  });
} else {
  musicToggle.classList.add('muted');
}

// Toggle music on button click
musicToggle.addEventListener('click', () => {
  if (isMusicPlaying) {
    ambient.pause();
    musicToggle.classList.add('muted');
    musicToggle.querySelector('.icon').textContent = '🔇';
    isMusicPlaying = false;
  } else {
    ambient.volume = 0.3;
    ambient.play();
    musicToggle.classList.remove('muted');
    musicToggle.querySelector('.icon').textContent = '🔊';
    isMusicPlaying = true;
  }
  
  // Save state to localStorage
  localStorage.setItem('musicPlaying', isMusicPlaying);
});

// Smooth volume fade on page load
if (isMusicPlaying) {
  ambient.volume = 0;
  let fadeIn = setInterval(() => {
    if (ambient.volume < 0.3) {
      ambient.volume = Math.min(0.3, ambient.volume + 0.05);
    } else {
      clearInterval(fadeIn);
    }
  }, 100);
}

// ============================================
// Stats Tracking
// ============================================

function loadStats() {
  // Load total games played
  const gamesPlayed = localStorage.getItem('totalGamesPlayed') || 0;
  const gamesPlayedEl = document.getElementById('gamesPlayed');
  if (gamesPlayedEl) {
    gamesPlayedEl.textContent = gamesPlayed;
    // Animate numbers counting up
    animateNumber('gamesPlayed', 0, parseInt(gamesPlayed), 1000);
  }
  
  // Load total score
  const totalScore = localStorage.getItem('totalScore') || 0;
  const totalScoreEl = document.getElementById('totalScore');
  if (totalScoreEl) {
    totalScoreEl.textContent = totalScore;
    animateNumber('totalScore', 0, parseInt(totalScore), 1500);
  }
  
  // Load individual game high scores
  const snakeHighScore = localStorage.getItem('snakeHighScore') || 0;
  const snakeHighScoreEl = document.getElementById('snakeHighScore');
  if (snakeHighScoreEl) {
    snakeHighScoreEl.textContent = snakeHighScore;
  }
  
  const mathHighScore = localStorage.getItem('mathHighScore') || 0;
  const mathHighScoreEl = document.getElementById('mathHighScore');
  if (mathHighScoreEl) {
    mathHighScoreEl.textContent = mathHighScore;
  }
  
  const memoryHighScore = localStorage.getItem('memoryHighScore') || '0';
  const memoryHighScoreEl = document.getElementById('memoryHighScore');
  if (memoryHighScoreEl) {
    memoryHighScoreEl.textContent = memoryHighScore + '%';
  }
}

// Animate number counting
function animateNumber(elementId, start, end, duration) {
  const element = document.getElementById(elementId);
  const range = end - start;
  const increment = range / (duration / 16); // 60fps
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      element.textContent = end;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// ============================================
// Initialize Game
// ============================================

// Initialize when DOM is ready
function initializeApp() {
  // Load stats
  loadStats();
  
  // Setup card interactions
  setupCardInteractions();
  
  // Console welcome messages
  console.log('🧠 BRAINEO ');
  console.log('%cWelcome to Braineo! Train your mind peacefully. 🎮', 'color: #a5b4fc; font-size: 14px;');
  console.log('%cTip: Press 1, 2, or 3 to quickly navigate to games!', 'color: #7888b8; font-size: 12px;');
  console.log('%cPress M to toggle music 🎵', 'color: #7888b8; font-size: 12px;');
}

// Load stats only after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already ready
  initializeApp();
}

// ============================================
// Card Interactions & Effects
// ============================================

function setupCardInteractions() {
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
  // Add mouse move effect for glow
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const glow = card.querySelector('.card-glow');
    glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(99, 102, 241, 0.15), transparent 60%)`;
  });
  
  // Add click sound effect (optional)
  card.addEventListener('click', (e) => {
    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.4);
      transform: translate(-50%, -50%);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;
    
    card.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  });
});

// Add ripple animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      width: 300px;
      height: 300px;
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
}

// ============================================
// Keyboard Navigation
// ============================================

document.addEventListener('keydown', (e) => {
  // Navigate with number keys
  if (e.key === '1') {
    window.location.href = 'games/snake.html';
  } else if (e.key === '2') {
    window.location.href = 'games/math.html';
  } else if (e.key === '3') {
    window.location.href = 'games/memory.html';
  } else if (e.key === 'm' || e.key === 'M') {
    // Toggle music with 'M' key
    musicToggle.click();
  }
});

// ============================================
// Performance Monitoring
// ============================================

// Log page load time
window.addEventListener('load', () => {
  const loadTime = performance.now();
  console.log(`⚡ Page loaded in ${loadTime.toFixed(2)}ms`);
});

// ============================================
// Utility Functions
// ============================================

// Update game stats from game pages
window.updateGameStats = function(game, score) {
  // Update total games played
  let gamesPlayed = parseInt(localStorage.getItem('totalGamesPlayed') || 0);
  gamesPlayed++;
  localStorage.setItem('totalGamesPlayed', gamesPlayed);
  
  // Update total score
  let totalScore = parseInt(localStorage.getItem('totalScore') || 0);
  totalScore += score;
  localStorage.setItem('totalScore', totalScore);
  
  // Update game-specific high score
  const highScoreKey = `${game}HighScore`;
  let highScore = parseInt(localStorage.getItem(highScoreKey) || 0);
  if (score > highScore) {
    localStorage.setItem(highScoreKey, score);
  }
};

// Reset all stats (for testing)
window.resetStats = function() {
  if (confirm('Are you sure you want to reset all stats?')) {
    localStorage.clear();
    location.reload();
  }
};

// ============================================
// Easter Egg - Konami Code
// ============================================

let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
  konamiCode.push(e.key);
  konamiCode = konamiCode.slice(-10);
  
  if (konamiCode.join(',') === konamiSequence.join(',')) {
    console.log('🎉 Konami Code Activated!');
    document.body.style.animation = 'rainbow 2s infinite';
    
    const rainbowStyle = document.createElement('style');
    rainbowStyle.textContent = `
      @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
      }
    `;
    document.head.appendChild(rainbowStyle);
    
    setTimeout(() => {
      document.body.style.animation = '';
    }, 5000);
  }
});

// ============================================
// Smooth Scroll to Games Section (if needed)
// ============================================

// Add smooth scroll behavior for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ============================================
// Console Welcome Message
// ============================================

console.log('%c🧠 BRAINEO ', 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 24px; padding: 10px 20px; border-radius: 8px; font-weight: bold;');
console.log('%cWelcome to Braineo! Train your mind peacefully. 🎮', 'color: #a5b4fc; font-size: 14px;');
console.log('%cTip: Press 1, 2, or 3 to quickly navigate to games!', 'color: #7888b8; font-size: 12px;');
console.log('%cPress M to toggle music 🎵', 'color: #7888b8; font-size: 12px;');
