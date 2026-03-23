# 🀄 Mini Sha - Legendary Duel

**HTML5 / JavaScript Modular · No Server Required · Works Offline**

A minimal yet feature-complete **Single-Player Sanguosha (Three Kingdoms Duel)**: No installation, no internet, no external resources needed. Pure frontend implementation with complete hero skills, identity system, card mechanics, sound effects, and intelligent AI.

**🌍 Available Languages: [中文](README.md) | English**

---

## 🌟 Key Features

### 🎨 Oriental Warrior Style UI

* Ink brush background, parchment texture
* Bronze UI elements
* Chinese calligraphy fonts
* Full card and avatar redesign

### 🎮 Complete Sanguosha Gameplay

* **Base Cards**: Sha / Shan / Tao / Jiu / Barrage / Southern Invasion / Windfall / Harvest / Take / Dismantlement / Duel / Fire Attack / Chain / Dreaming / Starvation / Lightning
* **Trick Cards**: Negate / Borrow Sword / Peach Garden
* **Hero System**: 9 carefully selected heroes with complete skill implementations
* **AI Behavior**: Intelligent decision-making for attack, healing, dodge, and area control
* **4-Player Identity System**: Lord / Loyalist / Rebel / Spy

### 📱 Deep Mobile Optimization

* AI enemies displayed horizontally at top
* Scrollable battle log in middle
* Horizontal scrolling hand cards at bottom (Hearthstone-style)
* Large buttons for easy tapping
* Full touch support

### 🔊 Native Sound Effects (No MP3 Files)

* Attack and damage sounds
* Victory/defeat 8-bit melodies
* Web Audio API native synthesis

### 📊 Game Statistics & Progress Saving

* Local storage for game stats (wins, win rate, hero win rates)
* Continue previous games
* Game history tracking

### 🌐 Multi-Language Support

* Chinese (中文) and English
* Easy language switching
* Full UI localization

---

## 🕹️ Quick Start

### ▶️ **Play Online**

Visit directly: https://leeking001.github.io/Sanguosha-mini/

### ▶️ **Local Play**

Download project → Open `index.html` → Start playing
(No dependencies, no server, just double-click!)

### ▶️ **Local Development**

For local debugging:
```bash
cd Sanguosha-mini
python3 -m http.server 8000
# Then open http://localhost:8000/
```

---

## 📸 Screenshot Preview

* Hero selection: 9 heroes, grid layout
* Game board: Top (enemies) / Middle (battle log) / Bottom (hand cards) layout
* Mobile optimized for portrait orientation

---

## ⚔️ 9 Selected Heroes

### Strength-Based (Red Faction)

| Hero | Skill | HP | Description |
|------|-------|----|----|
| 🐉 **Big Ear** | Benevolence | 4 | Draw 1 extra card each turn |
| ⚔️ **Great Flyer** | Unmatched | 4 | Unlimited Sha usage in play phase |
| 👑 **Sun Tens** | Balance | 4 | Discard any cards to draw equal amount |

### Team-Based (Blue Faction)

| Hero | Skill | HP | Description |
|------|-------|----|----|
| ⚕️ **Doctor Hua** | Divine Physician | 4 | Heal 1 HP (active skill) |
| 🔥 **Fair Lady** | Seduction | 4 | Reduce target's hand limit by 1 |
| 🌙 **Bright Mind** | Counter | 3 | Target discards 1 card after damage |

### Balance-Based (Green Faction)

| Hero | Skill | HP | Description |
|------|-------|----|----|
| 🏹 **Cloud Chaser** | Dragon Daring | 4 | Use Shan as Sha and vice versa |
| 💂 **Old Yellow** | Rescue | 4 | Designate a target to draw 1 card |

### Special (Yellow Faction)

| Hero | Skill | HP | Description |
|------|-------|----|----|
| 💥 **Wild Rebel** | Berserk | 5 | Sha damage +1 |

---

## 🎴 Card Guide

### Base Cards

| Card | Effect |
|------|--------|
| ⚔️ **Sha** | Attack an opponent within range; costs 1 Shan to block |
| 💨 **Shan** | Block Sha or Barrage |
| 🍑 **Tao** | Heal 1 HP; save yourself or others when dying |
| 🍶 **Jiu** | This turn's Sha damage +1; or save yourself when dying |

### Trick Cards

| Card | Effect |
|------|--------|
| 🏹 **Barrage** | All others must play Shan or take 1 damage |
| 🐘 **Southern Invasion** | All others must play Sha or take 1 damage |
| 🎁 **Windfall** | Draw 2 cards |
| 🌾 **Harvest** | All players draw 1 card |
| 🔗 **Take** | Take 1 card from a nearby opponent |
| 🪓 **Dismantlement** | Opponent discards 1 card |
| ⚔️ **Duel** | Both take turns playing Sha; first to fail takes 1 damage |
| 🔥 **Fire Attack** | Opponent discards a matching suit or takes 1 damage |
| ⛓️ **Chain** | Link two characters; shared damage |
| 🤐 **Dreaming** | Judgment: if not Heart, skip play phase |
| 🍚 **Starvation** | Judgment: if not Club, skip draw phase |
| ⚡ **Lightning** | Judgment: if Spade 2-9, take 3 damage; else move to next |
| 🛡️ **Negate** | Cancel a trick card's effect |
| 🔪 **Borrow Sword** | Force target to attack another or give you a card |
| 🌸 **Peach Garden** | All characters heal 1 HP |

---

## 🎮 Game Flow

1. **First Step: Choose Your Role** - Lord/Loyalist/Rebel/Spy
2. **Second Step: Choose Your Hero** - Select from randomly generated heroes
3. **Start Game** - Take turns in sequence
   - **Draw Phase**: Draw two cards (skills may change amount)
   - **Play Phase**: Play cards and use skills
   - **Discard Phase**: Discard to hand limit if needed
   - **End Turn**: Pass to next player

### Controls

- **Select Card**: Tap hand card to select, tap again to deselect
- **Select Target**: After selecting card, tap target character
- **Play Card**: Click "Play Card" button when ready
- **Cancel**: Click "Cancel" to clear selection
- **End Turn**: Click "End Turn" when done
- **Trigger Skill**: Some skills need manual activation (tap your avatar)

---

## 🔔 Sound Effects

Click **🎵** to toggle background music or **🔊** to toggle sound effects.

| Action | Sound |
|--------|-------|
| Play card | Paper shuffle |
| Sha | Sword clash |
| Damage | Deep impact |
| Barrage / Invasion | Whoosh |
| Victory/Defeat | 8-bit melody |

All synthesized using **Web Audio API** - no MP3 downloads needed.

---

## 📦 Version History

### **v3.0 – Multi-Language & Mobile Optimization**

* Added English language support
* Improved mobile layout with self-adaptive heights
* Fixed mobile scroll and control visibility
* Updated game documentation

### **v2.0 – Hero Redesign & Skill Balancing**

* Simplified to **9 heroes** with complete implementations
* Added new skills: Seduction, Rescue
* Fixed multiple gameplay bugs
* Improved hero balance

### **v1.0 – Modular Rewrite & Content Expansion**

* Converted from single file to ES6 modules
* Expanded from 6 to 22 heroes
* Added multiple trick card types
* Implemented local storage and statistics
* Enhanced mobile interaction

### **v0.05 – UI Redesign & Native Sound**

* Complete UI redesign with ink wash style
* Added Web Audio API sound effects
* Added hero selection on game start
* Display hero names in battle log

### **v0.04 – Avatar System & Cards**

* CSS+Emoji hero avatars
* New cards: Southern Invasion, Windfall
* Added in-game instructions
* Enhanced UI details

### **v0.03 – Mobile Portrait Optimization**

* Top/Middle/Bottom layout
* Horizontal hand card scrolling
* Independent log scrolling
* Optimized touch controls

### **v0.02 – Identity System & Skills**

* Complete Lord/Loyalist/Rebel/Spy logic
* Hero skill system
* AI strategy behavior

### **v0.01 – Initial 1v1 Single File**

* Sha, Shan, Tao, Barrage cards
* AI auto-play
* Single HTML file

---

## 🏗️ Project Structure

```
Sanguosha-mini/
├── index.html       # Game entry point
├── style.css        # Stylesheet
├── generals.js      # Hero data (9 heroes)
├── cards.js         # Card system
├── game.js          # Core game logic
├── ai.js            # AI decision logic
├── ui.js            # UI rendering & events
├── i18n.js          # Internationalization
├── storage.js       # Local storage & stats
├── audio.js         # Sound effects system
├── effects.js       # Visual effects
├── GAME_GUIDE.md    # Game guide (Chinese/English)
├── README.md        # Project documentation (Chinese)
└── README_EN.md     # Project documentation (English)
```

---

## 🧩 Tech Stack

* **HTML5**
* **CSS3**
* **JavaScript ES6 Modules (Zero Dependencies)**
* **Web Audio API (Sound Synthesis)**

---

## 🌐 Internationalization

The game supports both Chinese (中文) and English versions. Switch languages using the language toggle button in the top bar. Language preference is saved locally and persists across sessions.

---

## 🤝 Contributing

Contributions welcome for:

* New hero designs
* UI improvements
* Bug fixes
* New game modes
* Translation improvements

Feel free to submit Issues or Pull Requests!

---

## 📄 License

MIT License - Free to use, modify, and distribute.

---

## 🎯 Design Philosophy

This project uses original hero names to avoid copyright issues:
- Strength faction (Big Ear, Great Flyer, Sun Tens)
- Team faction (Doctor Hua, Fair Lady, Bright Mind)
- Balance faction (Cloud Chaser, Old Yellow)
- Special faction (Wild Rebel)

Classic Sanguosha gameplay mechanics are preserved with original hero design.

---

## 📖 Full Documentation

For detailed game rules and strategy guide, see [GAME_GUIDE.md](GAME_GUIDE.md)

---

**Enjoy the game! May you reign victorious!** 🎮⚔️🏆
