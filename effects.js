// 特效系统模块 - 管理游戏视觉特效

const EffectSystem = {
    // 特效层元素
    layer: null,
    
    // 初始化
    init() {
        this.layer = document.getElementById('fx-layer');
        if (!this.layer) {
            this.layer = document.createElement('div');
            this.layer.id = 'fx-layer';
            this.layer.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                pointer-events: none; z-index: 50;
            `;
            document.body.appendChild(this.layer);
        }
    },
    
    // 获取元素中心位置
    getCenterPosition(elementId) {
        let el;
        if (elementId === 0) {
            el = document.getElementById('player-status');
        } else {
            el = document.querySelector(`#enemy-zone .enemy-card:nth-child(${elementId})`);
        }
        
        if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        
        const rect = el.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    },
    
    // 显示文字特效
    async showText(targetId, text, type = 'normal') {
        if (!this.layer) this.init();
        
        const el = document.createElement('div');
        el.innerText = text;
        el.className = `fx-text ${type === 'damage' ? 'fx-damage' : (type === 'skill' ? 'fx-skill' : '')}`;
        
        const pos = this.getCenterPosition(targetId);
        el.style.cssText = `
            position: absolute;
            font-size: ${type === 'damage' ? '40px' : '32px'};
            font-weight: bold; white-space: nowrap;
            color: ${type === 'damage' ? '#c0392b' : '#fff'};
            text-shadow: 0 0 5px #000, 0 0 10px #d4af37;
            opacity: 0;
            left: ${pos.x}px;
            top: ${pos.y}px;
            transform: translate(-50%, -50%);
            animation: fxZoomFade 1.2s ease-out forwards;
            pointer-events: none;
            z-index: 100;
        `;
        
        this.layer.appendChild(el);
        
        await new Promise(resolve => setTimeout(resolve, 1200));
        el.remove();
    },
    
    // 显示伤害特效
    showDamage(targetId, damage) {
        return this.showText(targetId, `-${damage}`, 'damage');
    },
    
    // 显示治疗特效
    showHeal(targetId, amount) {
        return this.showText(targetId, `+${amount}`, 'heal');
    },
    
    // 显示技能特效
    showSkill(targetId, skillName) {
        return this.showText(targetId, skillName, 'skill');
    },
    
    // 显示获得卡牌特效
    showDrawCard(targetId, count = 1) {
        return this.showText(targetId, `+${count}🎴`, 'normal');
    },
    
    // 屏幕震动效果
    shakeScreen(duration = 300) {
        document.body.style.animation = `fxShake ${duration}ms ease-in-out`;
        setTimeout(() => {
            document.body.style.animation = '';
        }, duration);
    },
    
    // 卡牌飞行动画
    async flyCard(fromId, toId, cardName) {
        if (!this.layer) this.init();
        
        const fromPos = this.getCenterPosition(fromId);
        const toPos = this.getCenterPosition(toId);
        
        const card = document.createElement('div');
        card.className = 'fx-flying-card';
        // 使用简单的卡牌图标，避免依赖CardUtils
        const cardIcons = {
            '杀': '⚔️', '闪': '💨', '桃': '🍑', '酒': '🍶',
            '万箭': '🏹', '南蛮': '🐘', '无中': '🎁', '五谷': '🌾',
            '顺手': '🔗', '拆桥': '🪓', '决斗': '⚔️', '火攻': '🔥',
            '乐不': '🤐', '铁索': '⛓️'
        };
        card.innerText = cardIcons[cardName] || '🎴';
        card.style.cssText = `
            position: absolute;
            font-size: 40px;
            left: ${fromPos.x}px;
            top: ${fromPos.y}px;
            transform: translate(-50%, -50%);
            transition: all 0.5s ease-out;
            pointer-events: none;
            z-index: 60;
            text-shadow: 0 0 10px rgba(0,0,0,0.5);
        `;
        
        this.layer.appendChild(card);
        
        // 触发重绘
        card.offsetHeight;
        
        // 飞行动画
        card.style.left = `${toPos.x}px`;
        card.style.top = `${toPos.y}px`;
        card.style.transform = 'translate(-50%, -50%) scale(0.5)';
        card.style.opacity = '0';
        
        await new Promise(resolve => setTimeout(resolve, 500));
        card.remove();
    },
    
    // 创建粒子效果
    createParticles(x, y, color = '#d4af37', count = 10) {
        if (!this.layer) this.init();
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            const angle = (Math.PI * 2 * i) / count;
            const distance = 50 + Math.random() * 50;
            
            particle.style.cssText = `
                position: absolute;
                width: 6px; height: 6px;
                background: ${color};
                border-radius: 50%;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                z-index: 55;
            `;
            
            this.layer.appendChild(particle);
            
            // 动画
            const destX = x + Math.cos(angle) * distance;
            const destY = y + Math.sin(angle) * distance;
            
            particle.animate([
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: `translate(${destX - x}px, ${destY - y}px) scale(0)`, opacity: 0 }
            ], {
                duration: 600 + Math.random() * 200,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }
    },
    
    // 胜利特效
    async showVictory() {
        if (!this.layer) this.init();
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // 创建胜利文字
        const victory = document.createElement('div');
        victory.innerText = '胜利!';
        victory.style.cssText = `
            position: absolute;
            font-size: 80px;
            font-weight: bold;
            color: #d4af37;
            text-shadow: 0 0 20px #d4af37, 0 0 40px #d4af37;
            left: ${centerX}px;
            top: ${centerY}px;
            transform: translate(-50%, -50%) scale(0);
            pointer-events: none;
            z-index: 100;
            animation: fxVictory 1.5s ease-out forwards;
        `;
        
        this.layer.appendChild(victory);
        
        // 粒子效果
        this.createParticles(centerX, centerY, '#d4af37', 20);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        victory.remove();
    },
    
    // 失败特效
    async showDefeat() {
        if (!this.layer) this.init();
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        const defeat = document.createElement('div');
        defeat.innerText = '失败...';
        defeat.style.cssText = `
            position: absolute;
            font-size: 80px;
            font-weight: bold;
            color: #c0392b;
            text-shadow: 0 0 20px #c0392b, 0 0 40px #c0392b;
            left: ${centerX}px;
            top: ${centerY}px;
            transform: translate(-50%, -50%) translateY(-100px);
            opacity: 0;
            pointer-events: none;
            z-index: 100;
            animation: fxDefeat 1.5s ease-out forwards;
        `;
        
        this.layer.appendChild(defeat);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        defeat.remove();
    }
};

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fxZoomFade {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
        20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
    }
    
    @keyframes fxShake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes fxVictory {
        0% { transform: translate(-50%, -50%) scale(0) rotate(-10deg); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.2) rotate(5deg); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
    }
    
    @keyframes fxDefeat {
        0% { transform: translate(-50%, -50%) translateY(-100px); opacity: 0; }
        100% { transform: translate(-50%, -50%) translateY(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EffectSystem };
}
