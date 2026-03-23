// 卡牌系统模块 - 定义所有卡牌类型和牌堆

// 卡牌类型定义
const CARD_TYPES = {
    // 基本牌
    SHA: { name: '杀', type: 'basic', icon: '⚔️', color: '#8b0000' },
    SHAN: { name: '闪', type: 'basic', icon: '💨', color: '#154360' },
    TAO: { name: '桃', type: 'basic', icon: '🍑', color: '#d81b60' },
    JIU: { name: '酒', type: 'basic', icon: '🍶', color: '#a04000' },

    // 锦囊牌
    WANJIAN: { name: '万箭', fullName: '万箭齐发', type: 'scroll', icon: '🏹', color: '#6c3483' },
    NANMAN: { name: '南蛮', fullName: '南蛮入侵', type: 'scroll', icon: '🐘', color: '#6c3483' },
    WUZHONG: { name: '无中', fullName: '无中生有', type: 'scroll', icon: '🎁', color: '#1e8449' },
    WUGU: { name: '五谷', fullName: '五谷丰登', type: 'scroll', icon: '🌾', color: '#1e8449' },
    SHUNSHOU: { name: '顺手', fullName: '顺手牵羊', type: 'scroll', icon: '🔗', color: '#117864' },
    CHAIQIAO: { name: '拆桥', fullName: '过河拆桥', type: 'scroll', icon: '🪓', color: '#117864' },
    JUEDOU: { name: '决斗', type: 'scroll', icon: '⚔️', color: '#000' },
    HUOGONG: { name: '火攻', type: 'scroll', icon: '🔥', color: '#e74c3c' },
    TIESUO: { name: '铁索', fullName: '铁索连环', type: 'scroll', icon: '⛓️', color: '#555' },
    LEBU: { name: '乐不', fullName: '乐不思蜀', type: 'delay', icon: '🤐', color: '#2c3e50' },

    // 新增锦囊
    WUXIE: { name: '无懈可击', fullName: '无懈可击', type: 'scroll', icon: '🛡️', color: '#3498db' },
    TAOYUAN: { name: '桃园', fullName: '桃园结义', type: 'scroll', icon: '🌸', color: '#e91e63' }
};

// 牌堆模板 - 标准牌堆配置
const DECK_TEMPLATE = [
    // 基本牌 (60张)
    ...Array(25).fill('杀'),
    ...Array(15).fill('闪'),
    ...Array(10).fill('桃'),
    ...Array(6).fill('酒'),

    // 锦囊牌 (30张)
    ...Array(3).fill('万箭'),
    ...Array(3).fill('南蛮'),
    ...Array(4).fill('无中'),
    ...Array(2).fill('五谷'),
    ...Array(4).fill('顺手'),
    ...Array(5).fill('拆桥'),
    ...Array(3).fill('决斗'),
    ...Array(3).fill('火攻'),
    ...Array(4).fill('铁索'),
    ...Array(3).fill('乐不'),
    ...Array(2).fill('无懈可击'),
    ...Array(2).fill('桃园')
];

// 卡牌工具函数
const CardUtils = {
    // 检查卡牌是否需要目标
    requiresTarget(card) {
        return ['杀', '顺手', '拆桥', '决斗', '火攻', '乐不', '铁索'].includes(card);
    },

    // 检查是否为AOE锦囊
    isAOE(card) {
        return ['万箭', '南蛮', '五谷', '桃园'].includes(card);
    },

    // 检查是否为延时锦囊
    isDelay(card) {
        return ['乐不'].includes(card);
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