# 🧠 BRAINEO - Mind Training Games

![BRAINEO Banner](https://img.shields.io/badge/BRAINEO-Mind%20Training-blueviolet?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)


**Train your mind. Play peacefully. Improve daily.**

BRAINEO is a Progressive Web App (PWA) featuring three relaxing mind-training games designed to help you focus, practice mental math, and improve memory - all without stress or time pressure.

🎮 **[Play Now →](https://braineo.netlify.app)**

---

## ✨ Features

- 🐍 **Snake Game** - Classic arcade nostalgia with smooth, relaxing gameplay
- ⚡ **Math Playground** - Sharpen your skills with gentle, pressure-free challenges  
- 🧠 **Memory Match** - Strengthen your memory in a zen-like flow
- 📊 **Stats Tracking** - Monitor your progress across all games
- 🎵 **Ambient Music** - Optional calming background music
- 🎨 **Beautiful UI** - Smooth animations and gradient designs
- 🔌 **Offline Mode** - Play anytime, anywhere

---

## 🎮 Games

### Snake 🐍
Classic snake game with progressive difficulty. Control the snake to eat food and grow longer while avoiding walls and yourself.

**Features:**
- Smooth arrow key & WASD controls
- Progressive difficulty (speeds up every 5 foods)
- Mobile D-pad support
- Pause/Resume functionality
- High score tracking

### Math Playground ⚡
Practice mental math without pressure. Choose from three difficulty levels and solve problems at your own pace.

**Features:**
- 3 difficulty levels (Beginner, Intermediate, Advanced)
- Multiple operations (+, -, ×, ÷)
- Instant feedback with encouraging messages
- Streak counter
- Detailed results with statistics

### Memory Match 🧠
Match pairs of cards to test and improve your memory. Multiple themes and grid sizes available.

**Features:**
- 3 grid sizes (4×4, 6×6, 8×8)
- 3 themes (Emojis, Numbers, Letters)
- Beautiful 3D card flip animations
- Timer and move counter
- Best time tracking

---

## 🚀 Quick Start

### Play Online
Visit **[braineo.netlify.app](https://braineo.netlify.app)** and start playing immediately!

### Install as App
1. Visit the website on Chrome/Edge/Safari
2. Click the install button (appears in address bar)
3. Or: Menu → "Install Braineo"
4. Play like a native app! 📱

### Run Locally
```bash
# Clone the repository
git clone https://github.com/ishanipshita1-jpg/braineo.git

# Navigate to directory
cd braineo

# Start a local server
python -m http.server 8080
# OR
npx http-server

# Visit http://localhost:8080
```

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **PWA:** Service Workers, Web App Manifest
- **Graphics:** Canvas API (Snake game)
- **Storage:** LocalStorage for stats persistence
- **Audio:** Web Audio API for sound effects
- **Fonts:** Google Fonts (Space Grotesk, DM Sans)
- **Hosting:** Netlify
- **Version Control:** Git/GitHub

**No frameworks, no dependencies - pure web technologies!** ⚡

---

## 📱 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Edge | ✅ Full |
| Mobile | ✅ Full |

**PWA Features require HTTPS** (automatically provided by Netlify)

---

## 📊 Project Structure
```
braineo/
├── index.html              # Main homepage
├── style.css              # Global styles
├── script.js              # Stats & music control
├── manifest.json          # PWA configuration
├── service-worker.js      # Offline functionality
├── pwa-installer.js       # Install prompts
├── pwa-styles.css         # PWA UI elements
├── favicon.svg            # App icon
├── assets/
│   └── ambient.mp3        # Background music
└── games/
    ├── snake.html/css/js  # Snake game
    ├── math.html/css/js   # Math game
    └── memory.html/css/js # Memory game
```

---

## 🎨 Design Philosophy

BRAINEO follows these design principles:

1. **Calming First** - No harsh colors, stressful timers, or pressure
2. **Progressive Enhancement** - Works everywhere, enhanced on modern browsers
3. **Accessibility** - Keyboard navigation, clear contrast, readable fonts
4. **Performance** - Fast loading, smooth animations, optimized assets
5. **Offline-Ready** - Service worker caching for complete offline functionality

---

## 🔧 Development

### Prerequisites
- Any modern web browser
- Local web server (Python, Node.js, or VS Code Live Server)
- Text editor (VS Code recommended)

### Setup Development Environment
```bash
# Clone repository
git clone https://github.com/ishanipshita1-jpg/braineo.git
cd braineo

# Install VS Code Live Server extension (recommended)
# Or use Python
python -m http.server 8080

# Open http://localhost:8080
```

### Making Changes
```bash
# Create a branch
git checkout -b feature/your-feature

# Make changes and test locally

# Commit changes
git add .
git commit -m "Add: your feature description"

# Push to GitHub
git push origin feature/your-feature

# Create Pull Request on GitHub
```

---

## 📈 Roadmap

### v1.0 (Current) ✅
- [x] Snake game with smooth controls
- [x] Math playground with 3 difficulty levels
- [x] Memory match with themes
- [x] Stats tracking system
- [x] PWA functionality
- [x] Offline mode

### v1.1 (Planned)
- [ ] Daily challenges
- [ ] Achievement system
- [ ] Social sharing with score screenshots
- [ ] More game themes
- [ ] Leaderboards (local)

### v2.0 (Future)
- [ ] User accounts
- [ ] Cloud save
- [ ] Multiplayer mode (local)
- [ ] More mini-games
- [ ] Custom themes
- [ ] Analytics dashboard

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Please ensure:**
- Code follows existing style
- All games work without errors
- Mobile responsiveness maintained
- No breaking changes without discussion

---

## 👨‍💻 Author

**Ishan**
- GitHub: [@ishanipshita1-jpg](https://github.com/ishanipshita1-jpg)
- Project Link: [https://github.com/ishanipshita1-jpg/braineo](https://github.com/ishanipshita1-jpg/braineo)

---

## 🙏 Acknowledgments

- Inspired by classic arcade games and brain training apps
- Font: [Google Fonts](https://fonts.google.com/)
- Hosting: [Netlify](https://netlify.com)
- Icons: Emoji characters
- Made with ❤️ for peaceful minds

---

🎮 [Play Now](https://braineo.netlify.app) | 🐛 [Report Bug](https://github.com/ishanipshita1-jpg/braineo/issues) | ✨ [Request Feature](https://github.com/ishanipshita1-jpg/braineo/issues)
