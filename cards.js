// 卡牌系统模块 - 定义所有卡牌类型和牌堆

// 卡牌类型定义
const CARD_TYPES = {
    // 基本牌
    SHA: { name: '斩', type: 'basic', icon: '⚔️', color: '#8b0000' },
    SHAN: { name: '躲', type: 'basic', icon: '💨', color: '#154360' },
    TAO: { name: '药', type: 'basic', icon: '💊', color: '#d81b60' },
    JIU: { name: '怒', type: 'basic', icon: '💢', color: '#a04000' },

    // 锦囊牌
    WANJIAN: { name: '箭雨', fullName: '箭雨齐发', type: 'scroll', icon: '🏹', color: '#6c3483' },
    NANMAN: { name: '兽潮', fullName: '兽潮入侵', type: 'scroll', icon: '🐘', color: '#6c3483' },
    WUZHONG: { name: '幸运', fullName: '幸运之神', type: 'scroll', icon: '🎁', color: '#1e8449' },
    WUGU: { name: '丰收', fullName: '丰收时节', type: 'scroll', icon: '🌾', color: '#1e8449' },
    SHUNSHOU: { name: '偷袭', fullName: '偷袭行动', type: 'scroll', icon: '🔗', color: '#117864' },
    CHAIQIAO: { name: '破坏', fullName: '破坏行动', type: 'scroll', icon: '🪓', color: '#117864' },
    JUEDOU: { name: '单挑', type: 'scroll', icon: '⚔️', color: '#000' },
    HUOGONG: { name: '火攻', type: 'scroll', icon: '🔥', color: '#e74c3c' },
    TIESUO: { name: '锁链', fullName: '锁链连环', type: 'scroll', icon: '⛓️', color: '#555' },
    LEBU: { name: '迷惑', fullName: '迷惑之术', type: 'delay', icon: '🤐', color: '#2c3e50' },
    BINGLIANG: { name: '断粮', fullName: '断粮计策', type: 'delay', icon: '🍚', color: '#7f8c8d' },
    SHANDIAN: { name: '闪电', type: 'delay', icon: '⚡', color: '#9b59b6' },

    // 新增锦囊
    WUXIE: { name: '无效', fullName: '无效化解', type: 'scroll', icon: '🛡️', color: '#3498db' },
    JIEDAO: { name: '计谋', fullName: '借刀计谋', type: 'scroll', icon: '🔪', color: '#8e44ad' },
    TAOYUAN: { name: '结义', fullName: '结义回血', type: 'scroll', icon: '🌸', color: '#e91e63' }
};

// 牌堆模板 - 标准牌堆配置
const DECK_TEMPLATE = [
    // 基本牌 (60张)
    ...Array(25).fill('斩'),
    ...Array(15).fill('躲'),
    ...Array(10).fill('药'),
    ...Array(6).fill('怒'),

    // 锦囊牌 (40张)
    ...Array(3).fill('箭雨'),
    ...Array(3).fill('兽潮'),
    ...Array(4).fill('幸运'),
    ...Array(2).fill('丰收'),
    ...Array(4).fill('偷袭'),
    ...Array(5).fill('破坏'),
    ...Array(3).fill('单挑'),
    ...Array(3).fill('火攻'),
    ...Array(4).fill('锁链'),
    ...Array(3).fill('迷惑'),
    ...Array(2).fill('断粮'),
    ...Array(1).fill('闪电'),
    ...Array(2).fill('无效'),
    ...Array(1).fill('计谋')
];

// 卡牌工具函数
const CardUtils = {
    // 检查卡牌是否需要目标
    requiresTarget(card) {
        return ['斩', '偷袭', '破坏', '单挑', '火攻', '迷惑', '锁链', '计谋'].includes(card);
    },

    // 检查是否为AOE锦囊
    isAOE(card) {
        return ['箭雨', '兽潮', '丰收', '结义'].includes(card);
    },

    // 检查是否为延时锦囊
    isDelay(card) {
        return ['迷惑', '断粮', '闪电'].includes(card);
    },
    
    // 获取卡牌信息
    getCardInfo(cardName) {
        const entry = Object.values(CARD_TYPES).find(c => c.name === cardName);
        return entry || { name: cardName, icon: '❓', color: '#333' };
    },
    
    // 获取卡牌图标
    getCardIcon(cardName) {
        const info = this.getCardInfo(cardName);
        return info.icon || '❓';
    },
    
    // 获取卡牌完整名称
    getFullName(cardName) {
        const info = this.getCardInfo(cardName);
        return info.fullName || info.name;
    },
    
    // 创建卡牌DOM元素
    createCardElement(cardName, index, isSelected = false, onClick = null) {
        const info = this.getCardInfo(cardName);
        const el = document.createElement('div');
        el.className = `card ${isSelected ? 'selected' : ''}`;
        el.setAttribute('data-type', cardName);
        el.setAttribute('data-index', index);
        
        if (onClick) {
            el.addEventListener('click', () => onClick(index));
        }
        
        el.innerHTML = `
            <div class="card-icon">${info.icon}</div>
            <div class="card-text">${cardName}</div>
        `;
        
        return el;
    },
    
    // 洗牌
    shuffle(deck) {
        const arr = [...deck];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },
    
    // 创建新牌堆
    createDeck() {
        return this.shuffle([...DECK_TEMPLATE]);
    },
    
    // 从牌堆抽牌
    drawFromDeck(deck, count = 1) {
        const cards = [];
        for (let i = 0; i < count; i++) {
            if (deck.length === 0) {
                // 牌堆空了，重新洗牌
                deck.push(...this.createDeck());
            }
            cards.push(deck.pop());
        }
        return cards;
    }
};

// ES6 导出
export { CARD_TYPES, DECK_TEMPLATE, CardUtils };