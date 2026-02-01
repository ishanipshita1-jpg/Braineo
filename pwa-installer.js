// ============================================
// BRAINEO - PWA Installer
// Service worker registration, install prompt, update handling
// ============================================

let deferredPrompt;
let serviceWorkerRegistration;

// ============================================
// Service Worker Registration
// ============================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker();
  });
}

async function registerServiceWorker() {
  try {
    serviceWorkerRegistration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });
    
    console.log('✅ Service Worker registered:', serviceWorkerRegistration.scope);
    
    // Check for updates
    serviceWorkerRegistration.addEventListener('updatefound', () => {
      const newWorker = serviceWorkerRegistration.installing;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available
          showUpdateNotification();
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
  }
}

function showUpdateNotification() {
  const updateBanner = document.createElement('div');
  updateBanner.className = 'update-banner';
  updateBanner.innerHTML = `
    <div class="update-content">
      <span>🎉 New version available!</span>
      <button class="update-button" id="updateButton">Update Now</button>
      <button class="dismiss-button" id="dismissUpdate">Later</button>
    </div>
  `;
  
  document.body.appendChild(updateBanner);
  
  document.getElementById('updateButton').addEventListener('click', () => {
    if (serviceWorkerRegistration && serviceWorkerRegistration.waiting) {
      serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  });
  
  document.getElementById('dismissUpdate').addEventListener('click', () => {
    updateBanner.remove();
  });
}

// ============================================
// Install Prompt (Add to Home Screen)
// ============================================

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent default browser prompt
  e.preventDefault();
  
  // Store the event for later use
  deferredPrompt = e;
  
  // Show custom install button
  showInstallPrompt();
  
  console.log('💾 Install prompt available');
});

function showInstallPrompt() {
  const installButton = document.createElement('button');
  installButton.id = 'installButton';
  installButton.className = 'install-button';
  installButton.innerHTML = `
    <span class="install-icon">📱</span>
    <span class="install-text">Install App</span>
  `;
  
  document.body.appendChild(installButton);
  
  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    // Show install prompt
    deferredPrompt.prompt();
    
    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response: ${outcome}`);
    
    if (outcome === 'accepted') {
      console.log('✅ App installed');
      showInstallSuccessMessage();
    } else {
      console.log('❌ App install declined');
    }
    
    // Clear the prompt
    deferredPrompt = null;
    installButton.remove();
  });
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.className = 'install-close';
  closeButton.textContent = '×';
  closeButton.addEventListener('click', () => {
    installButton.remove();
    localStorage.setItem('installPromptDismissed', Date.now());
  });
  
  installButton.appendChild(closeButton);
}

function showInstallSuccessMessage() {
  const successMessage = document.createElement('div');
  successMessage.className = 'install-success';
  successMessage.innerHTML = `
    <div class="success-content">
      <span class="success-icon">✅</span>
      <span class="success-text">App installed! Check your home screen.</span>
    </div>
  `;
  
  document.body.appendChild(successMessage);
  
  setTimeout(() => {
    successMessage.remove();
  }, 5000);
}

// Track when app is installed
window.addEventListener('appinstalled', () => {
  console.log('✅ BRAINEO installed successfully');
  deferredPrompt = null;
  
  // Track installation (can send to analytics)
  trackEvent('pwa_installed');
});

// ============================================
// Offline/Online Detection
// ============================================

window.addEventListener('online', () => {
  console.log('🌐 Back online');
  showConnectionStatus('online');
  
  // Sync stats when back online
  if (serviceWorkerRegistration && serviceWorkerRegistration.sync) {
    serviceWorkerRegistration.sync.register('sync-stats');
  }
});

window.addEventListener('offline', () => {
  console.log('📵 Offline mode');
  showConnectionStatus('offline');
});

function showConnectionStatus(status) {
  const statusBanner = document.createElement('div');
  statusBanner.className = `connection-status ${status}`;
  statusBanner.textContent = status === 'online' 
    ? '🌐 Back online!' 
    : '📵 Playing offline';
  
  document.body.appendChild(statusBanner);
  
  setTimeout(() => {
    statusBanner.remove();
  }, 3000);
}

// ============================================
// Share API Integration
// ============================================

async function shareScore(game, score) {
  if (!navigator.share) {
    // Fallback for browsers without share API
    copyToClipboard(`I scored ${score} in ${game} on BRAINEO! 🎮🧠`);
    return;
  }
  
  try {
    await navigator.share({
      title: 'BRAINEO - My Score',
      text: `I scored ${score} in ${game}! Can you beat it? 🎮🧠`,
      url: window.location.href
    });
    console.log('✅ Score shared successfully');
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('❌ Share failed:', error);
    }
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      showNotification('📋 Copied to clipboard!');
    })
    .catch((error) => {
      console.error('Copy failed:', error);
    });
}

// ============================================
// Screenshot Capture (Canvas)
// ============================================

async function captureGameScreenshot(canvas, score) {
  try {
    // Create a new canvas with score overlay
    const screenshotCanvas = document.createElement('canvas');
    const ctx = screenshotCanvas.getContext('2d');
    
    screenshotCanvas.width = canvas.width;
    screenshotCanvas.height = canvas.height + 100; // Extra space for score
    
    // Draw game canvas
    ctx.drawImage(canvas, 0, 0);
    
    // Add score overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, canvas.height, canvas.width, 100);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height + 50);
    
    ctx.font = '16px Arial';
    ctx.fillText('BRAINEO - Train your mind', canvas.width / 2, canvas.height + 80);
    
    // Convert to blob
    const blob = await new Promise(resolve => screenshotCanvas.toBlob(resolve));
    
    // Share or download
    if (navigator.share && navigator.canShare({ files: [new File([blob], 'braineo-score.png')] })) {
      await navigator.share({
        title: 'My BRAINEO Score',
        text: `Check out my score! 🎮`,
        files: [new File([blob], 'braineo-score.png', { type: 'image/png' })]
      });
    } else {
      // Download fallback
      downloadBlob(blob, 'braineo-score.png');
    }
    
  } catch (error) {
    console.error('Screenshot failed:', error);
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  
  showNotification('📸 Screenshot saved!');
}

// ============================================
// Push Notifications (Optional)
// ============================================

async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

async function subscribeToPushNotifications() {
  if (!serviceWorkerRegistration) return;
  
  try {
    const subscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY) // Add your VAPID key
    });
    
    // Send subscription to server
    console.log('Push subscription:', subscription);
    
  } catch (error) {
    console.error('Push subscription failed:', error);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ============================================
// Helper Functions
// ============================================

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification-toast';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function trackEvent(eventName, data = {}) {
  // Track events (can integrate with analytics)
  console.log('📊 Event:', eventName, data);
  
  // Store locally for now
  const events = JSON.parse(localStorage.getItem('analytics') || '[]');
  events.push({ event: eventName, data, timestamp: Date.now() });
  localStorage.setItem('analytics', JSON.stringify(events));
}

// ============================================
// Export Functions for Games
// ============================================

window.pwaUtils = {
  shareScore,
  captureGameScreenshot,
  requestNotificationPermission,
  trackEvent
};

console.log('📱 PWA utilities loaded');
