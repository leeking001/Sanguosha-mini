// 音效系统模块 - 管理游戏音效和背景音乐

const AudioSystem = {
    ctx: null,
    soundEnabled: true,
    bgmEnabled: false,
    bgmOscillators: [],
    bgmInterval: null,
    
    // 初始化音频上下文
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this;
    },
    
    // 切换音效开关
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.updateSoundIcon();
        return this.soundEnabled;
    },
    
    // 切换BGM开关
    toggleBGM() {
        this.bgmEnabled = !this.bgmEnabled;
        this.updateBGMIcon();
        if (this.bgmEnabled) {
            this.startBGM();
        } else {
            this.stopBGM();
        }
        return this.bgmEnabled;
    },
    
    // 更新图标
    updateSoundIcon() {
        const btn = document.getElementById('btn-sound');
        if (btn) btn.innerText = this.soundEnabled ? '🔊' : '🔇';
    },
    
    updateBGMIcon() {
        const btn = document.getElementById('btn-bgm');
        if (btn) btn.innerText = this.bgmEnabled ? '🎵' : '✖️';
    },
    
    // 播放单音
    playTone(freq, type = 'sine', duration = 0.1, volume = 0.1) {
        if (!this.soundEnabled || !this.ctx) return;
        
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn('Audio play failed:', e);
        }
    },
    
    // 播放和弦
    playChord(freqs, type = 'sine', duration = 0.3, volume = 0.08) {
        if (!this.soundEnabled || !this.ctx) return;
        freqs.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, type, duration, volume), i * 50);
        });
    },
    
    // 开始背景音乐
    startBGM() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        
        // 五声音阶
        const scale = [196.00, 220.00, 261.63, 293.66, 329.63, 392.00];
        
        const playNote = () => {
            if (!this.bgmEnabled) return;
            const freq = scale[Math.floor(Math.random() * scale.length)];
            this.playTone(freq, 'sine', 4, 0.05);
        };
        
        // 持续低音
        const drone = this.ctx.createOscillator();
        const droneGain = this.ctx.createGain();
        drone.type = 'triangle';
        drone.frequency.value = 98.00;
        droneGain.gain.value = 0.02;
        drone.connect(droneGain);
        droneGain.connect(this.ctx.destination);
        drone.start();
        this.bgmOscillators.push(drone);
        
        playNote();
        this.bgmInterval = setInterval(playNote, 2500);
    },
    
    // 停止背景音乐
    stopBGM() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
        this.bgmOscillators.forEach(osc => {
            try { osc.stop(); } catch (e) {}
        });
        this.bgmOscillators = [];
    },
    
    // 音效预设
    SFX: {
        card: () => AudioSystem.playTone(800, 'triangle', 0.05, 0.05),
        attack: () => AudioSystem.playTone(600, 'sawtooth', 0.1, 0.1),
        damage: () => AudioSystem.playTone(100, 'square', 0.3, 0.2),
        heal: () => AudioSystem.playChord([523.25, 659.25, 783.99], 'sine', 0.5, 0.08),
        aoe: () => {
            AudioSystem.playTone(200, 'sawtooth', 0.4, 0.1);
            setTimeout(() => AudioSystem.playTone(150, 'sawtooth', 0.4, 0.1), 100);
        },
        duel: () => {
            AudioSystem.playTone(400, 'square', 0.1);
            setTimeout(() => AudioSystem.playTone(400, 'square', 0.1), 150);
        },
        win: () => {
            AudioSystem.playChord([523.25, 659.25, 783.99, 1046.50], 'triangle', 0.8, 0.1);
        },
        lose: () => {
            AudioSystem.playTone(300, 'sawtooth', 0.5, 0.15);
            setTimeout(() => AudioSystem.playTone(200, 'sawtooth', 0.5, 0.15), 400);
        },
        skill: () => {
            AudioSystem.playChord([440, 554.37, 659.25], 'sine', 0.3, 0.08);
        },
        chain: () => {
            AudioSystem.playTone(300, 'square', 0.2, 0.1);
            setTimeout(() => AudioSystem.playTone(400, 'square', 0.2, 0.1), 100);
        },
        equip: () => {
            AudioSystem.playTone(600, 'sine', 0.15, 0.08);
        },
        thunder: () => {
            AudioSystem.playTone(80, 'sawtooth', 0.5, 0.2);
            setTimeout(() => AudioSystem.playTone(60, 'sawtooth', 0.8, 0.25), 100);
        }
    }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioSystem };
}