// 存储系统模块 - 管理游戏存档和统计数据

const StorageSystem = {
    // 存储键名
    KEYS: {
        GAME_STATE: 'sanguosha_game_state',
        STATISTICS: 'sanguosha_statistics',
        SETTINGS: 'sanguosha_settings',
        HISTORY: 'sanguosha_history'
    },
    
    // 检查是否支持本地存储
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('LocalStorage not available');
            return false;
        }
    },
    
    // 保存游戏状态
    saveGameState(state) {
        if (!this.isAvailable()) return false;
        try {
            const data = {
                timestamp: Date.now(),
                state: state
            };
            localStorage.setItem(this.KEYS.GAME_STATE, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Failed to save game state:', e);
            return false;
        }
    },
    
    // 加载游戏状态
    loadGameState() {
        if (!this.isAvailable()) return null;
        try {
            const data = localStorage.getItem(this.KEYS.GAME_STATE);
            if (!data) return null;
            const parsed = JSON.parse(data);
            // 检查是否过期（24小时）
            if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem(this.KEYS.GAME_STATE);
                return null;
            }
            return parsed.state;
        } catch (e) {
            console.error('Failed to load game state:', e);
            return null;
        }
    },
    
    // 清除游戏状态
    clearGameState() {
        if (!this.isAvailable()) return;
        localStorage.removeItem(this.KEYS.GAME_STATE);
    },
    
    // 获取统计数据
    getStatistics() {
        if (!this.isAvailable()) return this.getDefaultStatistics();
        try {
            const data = localStorage.getItem(this.KEYS.STATISTICS);
            return data ? JSON.parse(data) : this.getDefaultStatistics();
        } catch (e) {
            return this.getDefaultStatistics();
        }
    },
    
    // 默认统计数据
    getDefaultStatistics() {
        return {
            totalGames: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            favoriteGeneral: null,
            generalStats: {},
            cardUsage: {},
            totalKills: 0,
            totalDamage: 0,
            totalHeal: 0,
            longestGame: 0,
            shortestGame: Infinity,
            achievements: []
        };
    },
    
    // 保存统计数据
    saveStatistics(stats) {
        if (!this.isAvailable()) return false;
        try {
            localStorage.setItem(this.KEYS.STATISTICS, JSON.stringify(stats));
            return true;
        } catch (e) {
            console.error('Failed to save statistics:', e);
            return false;
        }
    },
    
    // 更新游戏结果统计
    recordGameResult(result, general, duration) {
        const stats = this.getStatistics();
        stats.totalGames++;
        
        if (result === 'win') {
            stats.wins++;
        } else {
            stats.losses++;
        }
        
        stats.winRate = Math.round((stats.wins / stats.totalGames) * 100);
        
        // 记录武将使用
        if (!stats.generalStats[general]) {
            stats.generalStats[general] = { used: 0, wins: 0 };
        }
        stats.generalStats[general].used++;
        if (result === 'win') {
            stats.generalStats[general].wins++;
        }
        
        // 更新游戏时长记录
        if (duration > stats.longestGame) {
            stats.longestGame = duration;
        }
        if (duration < stats.shortestGame) {
            stats.shortestGame = duration;
        }
        
        this.saveStatistics(stats);
    },
    
    // 记录卡牌使用
    recordCardUsage(cardName) {
        const stats = this.getStatistics();
        if (!stats.cardUsage[cardName]) {
            stats.cardUsage[cardName] = 0;
        }
        stats.cardUsage[cardName]++;
        this.saveStatistics(stats);
    },
    
    // 获取设置
    getSettings() {
        if (!this.isAvailable()) return this.getDefaultSettings();
        try {
            const data = localStorage.getItem(this.KEYS.SETTINGS);
            return data ? { ...this.getDefaultSettings(), ...JSON.parse(data) } : this.getDefaultSettings();
        } catch (e) {
            return this.getDefaultSettings();
        }
    },
    
    // 默认设置
    getDefaultSettings() {
        return {
            soundEnabled: true,
            bgmEnabled: false,
            animationEnabled: true,
            fastMode: false,
            showTips: true,
            language: 'zh-CN'
        };
    },
    
    // 保存设置
    saveSettings(settings) {
        if (!this.isAvailable()) return false;
        try {
            const current = this.getSettings();
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify({ ...current, ...settings }));
            return true;
        } catch (e) {
            console.error('Failed to save settings:', e);
            return false;
        }
    },
    
    // 添加游戏历史记录
    addGameHistory(record) {
        if (!this.isAvailable()) return false;
        try {
            const history = this.getGameHistory();
            history.unshift({
                timestamp: Date.now(),
                ...record
            });
            // 只保留最近50条
            if (history.length > 50) {
                history.pop();
            }
            localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));
            return true;
        } catch (e) {
            console.error('Failed to add game history:', e);
            return false;
        }
    },
    
    // 获取游戏历史
    getGameHistory() {
        if (!this.isAvailable()) return [];
        try {
            const data = localStorage.getItem(this.KEYS.HISTORY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },
    
    // 清除所有数据
    clearAll() {
        if (!this.isAvailable()) return;
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },
    
    // 导出数据
    exportData() {
        return {
            statistics: this.getStatistics(),
            settings: this.getSettings(),
            history: this.getGameHistory(),
            exportTime: new Date().toISOString()
        };
    },
    
    // 导入数据
    importData(data) {
        if (!this.isAvailable()) return false;
        try {
            if (data.statistics) {
                this.saveStatistics(data.statistics);
            }
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            if (data.history) {
                localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(data.history));
            }
            return true;
        } catch (e) {
            console.error('Failed to import data:', e);
            return false;
        }
    }
};

// ES6 导出
export { StorageSystem };
