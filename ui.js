// UI渲染模块 - 负责DOM操作、界面更新和事件绑定

import { CardUtils } from './cards.js';
import { AudioSystem } from './audio.js';
import { EffectSystem } from './effects.js';
import { StorageSystem } from './storage.js';

// UI管理对象
const UI = {
    // 游戏状态引用
    game: null,
    gameState: null,
    
    // 回调函数
    callbacks: {},
    
    // 初始化UI
    init(game, gameState, callbacks = {}) {
        this.game = game;
        this.gameState = gameState;
        this.callbacks = callbacks;
        
        // 初始化子系统
        EffectSystem.init();
        AudioSystem.init();
        
        // 绑定顶部按钮事件
        this.bindTopBarEvents();
        
        // 绑定控制按钮事件
        this.bindControlEvents();
        
        // 绑定玩家点击事件（用于技能）
        this.bindPlayerZoneEvents();
        
        return this;
    },
    
    // 绑定顶部栏事件
    bindTopBarEvents() {
        const bgmBtn = document.getElementById('btn-bgm');
        const soundBtn = document.getElementById('btn-sound');
        const helpBtn = document.getElementById('btn-help');
        
        if (bgmBtn) {
            bgmBtn.addEventListener('click', () => {
                const enabled = AudioSystem.toggleBGM();
                bgmBtn.innerText = enabled ? '🎵' : '✖️';
            });
        }
        
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const enabled = AudioSystem.toggleSound();
                soundBtn.innerText = enabled ? '🔊' : '🔇';
            });
        }
        
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }
    },
    
    // 绑定控制按钮事件
    bindControlEvents() {
        const confirmBtn = document.getElementById('btn-confirm');
        const cancelBtn = document.getElementById('btn-cancel');
        const endBtn = document.getElementById('btn-end');
        const skillBtn = document.getElementById('btn-skill');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (this.callbacks.onConfirm) {
                    this.callbacks.onConfirm();
                }
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (this.callbacks.onCancel) {
                    this.callbacks.onCancel();
                }
            });
        }

        if (endBtn) {
            endBtn.addEventListener('click', () => {
                if (this.callbacks.onEndTurn) {
                    this.callbacks.onEndTurn();
                }
            });
        }

        if (skillBtn) {
            skillBtn.addEventListener('click', () => {
                if (this.callbacks.onSkillUse) {
                    this.callbacks.onSkillUse();
                }
            });
        }
    },
    
    // 绑定玩家区域事件（用于技能触发）
    bindPlayerZoneEvents() {
        const playerStatus = document.getElementById('player-status');
        if (playerStatus) {
            playerStatus.addEventListener('click', () => {
                if (this.callbacks.onPlayerClick) {
                    this.callbacks.onPlayerClick(0);
                }
            });
        }
    },
    
    // 显示身份选择界面
    showRoleSelection(onSelect) {
        const setupScreen = document.getElementById('setup-screen');
        const stepRole = document.getElementById('step-role');
        const stepHero = document.getElementById('step-hero');
        
        if (setupScreen) setupScreen.style.display = 'flex';
        if (stepRole) stepRole.style.display = 'block';
        if (stepHero) stepHero.style.display = 'none';
        
        // 绑定身份选择事件
        const roleCards = document.querySelectorAll('.role-card');
        roleCards.forEach(card => {
            // 移除旧的事件监听器
            card.onclick = null;
            // 添加新的事件监听器
            card.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const role = card.getAttribute('data-role') || card.textContent.trim();
                console.log('Role selected:', role);
                if (onSelect && typeof onSelect === 'function') {
                    onSelect(role);
                }
            };
        });
    },
    
    // 显示武将选择界面
    showHeroSelection(generals, onSelect) {
        console.log('showHeroSelection called, generals count:', generals.length);
        
        const stepRole = document.getElementById('step-role');
        const stepHero = document.getElementById('step-hero');
        const heroSelection = document.getElementById('hero-selection');
        
        console.log('Elements:', { stepRole, stepHero, heroSelection });
        
        if (stepRole) {
            stepRole.style.display = 'none';
            console.log('step-role hidden');
        }
        if (stepHero) {
            stepHero.style.display = 'block';
            console.log('step-hero shown');
        }
        
        // 清空并填充武将选项
        if (heroSelection) {
            heroSelection.innerHTML = '';
            console.log('Populating heroes...');
            generals.forEach(hero => {
                const el = document.createElement('div');
                el.className = 'hero-option';
                // 支持图片头像和emoji头像
                const avatarHtml = hero.avatar && hero.avatar.includes('.')
                    ? `<img src="${hero.avatar}" alt="${hero.name}" class="hero-avatar-img" />`
                    : `<div class="hero-avatar" style="color:${hero.color}">${hero.avatarEmoji || hero.avatar}</div>`;
                // 生成血量条
                const hpBars = Array.from({length: hero.hp}, () => '<div class="hp-point"></div>').join('');

                el.innerHTML = `
                    ${avatarHtml}
                    <div class="hero-name">${hero.name}</div>
                    <div class="hero-skill">${hero.skill}</div>
                    <div class="hero-skill-brief">${hero.skillBrief || hero.skillDesc}</div>
                    <div class="hero-hp-bar" style="display: flex; gap: 2px; justify-content: center; margin-top: 2px;">
                        ${hpBars}
                    </div>
                `;
                el.onclick = () => {
                    console.log('Hero selected:', hero.name);
                    if (onSelect) onSelect(hero);
                };
                heroSelection.appendChild(el);
            });
        }
    },
    
    // 隐藏设置界面
    hideSetupScreen() {
        const setupScreen = document.getElementById('setup-screen');
        if (setupScreen) setupScreen.style.display = 'none';
    },
    
    // 渲染整个游戏界面
    renderAll() {
        this.renderEnemyZone();
        this.renderPlayerZone();
        this.renderHand();
        this.updateButtons();
    },
    
    // 渲染敌方区域
    renderEnemyZone() {
        const container = document.getElementById('enemy-zone');
        if (!container || !this.gameState.players.length) return;

        container.innerHTML = '';

        for (let i = 1; i <= 3; i++) {
            const p = this.gameState.players[i];
            if (!p) continue;

            const div = document.createElement('div');
            const roleText = p.identityKnown ? p.role : '???';

            let classes = `enemy-card ${p.isDead ? 'dead' : ''} ${this.gameState.currentTurnIndex === i ? 'active-turn' : ''}`;
            if (this.gameState.isTargetingMode && !p.isDead) classes += ' targetable';
            if (this.gameState.pendingChainTargets.includes(i)) classes += ' selected-chain';
            if (this.gameState.pendingSkill && this.gameState.pendingSkill.targets.includes(i)) classes += ' skill-target-available';
            if (p.role === '主公') classes += ' lord-border';

            div.className = classes;
            div.id = `player-${i}`;
            div.onclick = () => {
                // ✅ 改进：根据当前状态调用不同的处理器
                if (this.gameState.pendingSkill) {
                    // 如果正在选择技能目标，调用技能目标选择处理器
                    if (this.callbacks.onSkillTargetSelect) {
                        this.callbacks.onSkillTargetSelect(i);
                    }
                } else {
                    // 否则调用普通目标选择处理器
                    if (this.callbacks.onTargetSelect) {
                        this.callbacks.onTargetSelect(i);
                    }
                }
            };

            // 状态图标
            let statusHtml = '';
            if (p.lebu) statusHtml += '<span class="status-icon">🤐</span>';
            if (p.chained) statusHtml += '<span class="status-icon">⛓️</span>';

            // 身份颜色
            const roleColor = p.identityKnown
                ? (p.role === '反贼' ? '#2ecc71' : (p.role === '忠臣' ? '#e67e22' : (p.role === '主公' ? '#f1c40f' : '#9b59b6')))
                : '#333';
            const roleTextColor = p.role === '主公' ? '#000' : '#fff';

            // 处理头像 - 支持图片和emoji
            const enemyAvatarHtml = p.general.avatar && p.general.avatar.includes('.')
                ? `<img src="${p.general.avatar}" alt="${p.general.name}" class="enemy-avatar-img" />`
                : `<div class="avatar-frame" style="color:${p.general.color}">${p.general.avatarEmoji || p.general.avatar}</div>`;

            // 主公标识徽章
            const lordBadgeHtml = p.role === '主公' ? '<div class="enemy-lord-badge">👑</div>' : '';

            div.innerHTML = `
                <div class="role-badge" style="background:${roleColor}; color:${roleTextColor}">${roleText}</div>
                <div class="enemy-avatar-container">
                    ${enemyAvatarHtml}
                    ${lordBadgeHtml}
                </div>
                <div class="status-icons">${statusHtml}</div>
                <div class="info-block">
                    <div class="general-name">${p.general.name}</div>
                    <div class="enemy-skill">【${p.general.skill}】</div>
                    <div class="hp-bar">${this.getHpHtml(p.hp, p.maxHp)}</div>
                    <div class="enemy-hand-count">手牌: ${p.hand.length}</div>
                </div>
            `;

            container.appendChild(div);
        }
    },
    
    // 渲染玩家区域
    renderPlayerZone() {
        const player = this.gameState.players[0];
        if (!player) return;
        
        // 更新角色徽章和主公标识
        const roleBadge = document.getElementById('my-role-badge');
        if (roleBadge) {
            roleBadge.innerText = player.role;
            roleBadge.className = `my-role role-${this.getRoleClass(player.role)}`;
        }

        // 显示主公标识
        const lordBadge = document.getElementById('my-lord-badge');
        if (lordBadge) {
            lordBadge.style.display = player.role === '主公' ? 'flex' : 'none';
        }

        // 更新头像
        const myAvatar = document.getElementById('my-avatar');
        if (myAvatar) {
            // 支持图片头像
            if (player.general.avatar && player.general.avatar.includes('.')) {
                myAvatar.src = player.general.avatar;
                myAvatar.style.display = 'block';
            } else if (player.general.avatarEmoji) {
                myAvatar.style.display = 'none';
            }
        }

        // 更新名字
        const myName = document.getElementById('my-name');
        if (myName) myName.innerText = player.general.name;
        
        // 更新技能
        const mySkill = document.getElementById('my-skill');
        if (mySkill) mySkill.innerText = `[${player.general.skill}]`;
        
        // 更新血量
        const myHpBar = document.getElementById('my-hp-bar');
        if (myHpBar) myHpBar.innerHTML = this.getHpHtml(player.hp, player.maxHp);
        
        // 更新状态图标
        const myStatusIcons = document.getElementById('my-status-icons');
        if (myStatusIcons) {
            let statusHtml = '';
            if (player.lebu) statusHtml += '<span class="status-icon">🤐</span>';
            if (player.chained) statusHtml += '<span class="status-icon">⛓️</span>';
            myStatusIcons.innerHTML = statusHtml;
        }
    },
    
    // 渲染手牌
    renderHand() {
        const container = document.getElementById('hand-scroll-container');
        if (!container) return;
        
        const player = this.gameState.players[0];
        if (!player) return;
        
        container.innerHTML = '';
        
        player.hand.forEach((card, i) => {
            const el = document.createElement('div');
            const isSelected = i === this.gameState.selectedCardIndex;
            el.className = `card ${isSelected ? 'selected' : ''}`;
            el.setAttribute('data-type', card);
            
            const icon = CardUtils.getCardIcon(card);
            
            el.innerHTML = `
                <div class="card-icon">${icon}</div>
                <div class="card-text">${card}</div>
            `;
            
            el.onclick = () => {
                if (this.callbacks.onCardSelect) {
                    this.callbacks.onCardSelect(i);
                }
            };
            
            container.appendChild(el);
        });
    },
    
    // 更新手牌UI（仅更新选中状态）
    updateHandUI() {
        this.renderHand();
    },
    
    // 获取血量HTML
    getHpHtml(hp, max) {
        let html = '';
        for (let i = 0; i < max; i++) {
            html += `<div class="hp-point ${i < hp ? '' : 'hp-lost'}"></div>`;
        }
        return html;
    },
    
    // 获取角色类名
    getRoleClass(role) {
        switch (role) {
            case '主公': return 'lord';
            case '忠臣': return 'loyal';
            case '反贼': return 'rebel';
            case '内奸': return 'spy';
            default: return '';
        }
    },
    
    // 更新按钮状态
    updateButtons() {
        const isMyTurn = this.gameState.currentTurnIndex === 0;
        const hasSel = this.gameState.selectedCardIndex !== -1;
        const player = this.gameState.players[0];

        const confirmBtn = document.getElementById('btn-confirm');
        const cancelBtn = document.getElementById('btn-cancel');
        const endBtn = document.getElementById('btn-end');
        const skillBtn = document.getElementById('btn-skill');

        if (endBtn) endBtn.disabled = !isMyTurn;
        if (cancelBtn) cancelBtn.disabled = !hasSel;

        // 判断是否可以确认出牌
        let canConfirm = false;
        if (isMyTurn && hasSel && player) {
            const card = player.hand[this.gameState.selectedCardIndex];
            if (card === '桃' && player.hp < player.maxHp) canConfirm = true;
            if (card === '酒') canConfirm = true;
            if (['万箭', '南蛮', '无中', '五谷', '桃园'].includes(card)) canConfirm = true;
        }

        if (confirmBtn) confirmBtn.disabled = !canConfirm;

        // 更新技能按钮状态
        if (skillBtn && player) {
            const canUseSkill = isMyTurn && !player.skillUsed && player.general && player.general.skill;
            skillBtn.disabled = !canUseSkill;
            if (canUseSkill && player.general) {
                skillBtn.innerText = `【${player.general.skill}】`;
                skillBtn.style.opacity = '1';
            } else {
                skillBtn.style.opacity = '0.5';
            }
        }
    },
    
    // 添加日志
    log(message, type = '') {
        const box = document.getElementById('log-zone');
        if (!box) return;
        
        const div = document.createElement('div');
        div.className = `log-line ${this.getLogClass(type)}`;
        div.innerText = message;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    },
    
    // 获取日志类名
    getLogClass(type) {
        switch (type) {
            case 'turn': return 'log-turn';
            case 'damage': return 'log-damage';
            case 'skill': return 'log-skill';
            case 'system': return 'log-system';
            case 'heal': return 'log-heal';
            default: return '';
        }
    },
    
    // 清空日志
    clearLog() {
        const box = document.getElementById('log-zone');
        if (box) box.innerHTML = '';
    },
    
    // 显示特效
    async showEffect(targetId, text, type = 'normal') {
        await EffectSystem.showText(targetId, text, type);
    },
    
    // 显示伤害特效
    showDamage(targetId, damage) {
        return EffectSystem.showDamage(targetId, damage);
    },
    
    // 显示治疗特效
    showHeal(targetId, amount) {
        return EffectSystem.showHeal(targetId, amount);
    },
    
    // 显示技能特效
    showSkill(targetId, skillName) {
        return EffectSystem.showSkill(targetId, skillName);
    },
    
    // 播放音效
    playSound(soundName) {
        if (AudioSystem.SFX[soundName]) {
            AudioSystem.SFX[soundName]();
        }
    },
    
    // 显示帮助
    showHelp() {
        const helpOverlay = document.getElementById('help-overlay');
        if (helpOverlay) helpOverlay.style.display = 'flex';
    },
    
    // 隐藏帮助
    hideHelp() {
        const helpOverlay = document.getElementById('help-overlay');
        if (helpOverlay) helpOverlay.style.display = 'none';
    },
    
    // 显示游戏结果
    showGameResult(win, message, players) {
        const resultOverlay = document.getElementById('result-overlay');
        const resultTitle = document.getElementById('result-title');
        const resultList = document.getElementById('result-list');

        if (resultTitle) {
            resultTitle.innerText = message;
            resultTitle.className = win ? 'win' : 'lose';
        }

        if (resultList && players) {
            let html = `
                <div class="result-row result-header">
                    <span class="res-role">身份</span>
                    <span class="res-name">武将</span>
                    <span class="res-stat-small">伤害</span>
                    <span class="res-stat-small">回复</span>
                    <span class="res-stat-small">击杀</span>
                    <span class="res-stat-small">出牌</span>
                    <span class="res-stat-small">锦囊</span>
                    <span class="res-stat-small">技能</span>
                </div>
            `;

            players.forEach(p => {
                const roleColor = p.role === '主公' ? '#f1c40f' :
                    (p.role === '忠臣' ? '#e67e22' : (p.role === '反贼' ? '#2ecc71' : '#9b59b6'));

                // 处理头像 - 支持图片和emoji
                const avatarHtml = p.general.avatar && p.general.avatar.includes('.')
                    ? `<img src="${p.general.avatar}" alt="${p.general.name}" style="width:32px; height:32px; border-radius:3px; object-fit:cover;" />`
                    : p.general.avatarEmoji || p.general.avatar;

                html += `
                    <div class="result-row">
                        <span class="res-role" style="color:${roleColor}">${p.role}</span>
                        <span class="res-name">${avatarHtml} ${p.general.name}</span>
                        <span class="res-stat-small" style="color:#e74c3c">${p.stats.damageDealt}</span>
                        <span class="res-stat-small" style="color:#2ecc71">${p.stats.healed}</span>
                        <span class="res-stat-small" style="color:#f1c40f">${p.stats.kills}</span>
                        <span class="res-stat-small" style="color:#3498db">${p.stats.cardsPlayed}</span>
                        <span class="res-stat-small" style="color:#9b59b6">${p.stats.strategiesUsed}</span>
                        <span class="res-stat-small" style="color:#1abc9c">${p.stats.skillsUsed}</span>
                    </div>
                `;
            });

            resultList.innerHTML = html;
        }

        if (resultOverlay) resultOverlay.style.display = 'flex';

        // 播放音效
        if (win) {
            AudioSystem.SFX.win();
        } else {
            AudioSystem.SFX.lose();
        }

        // 停止BGM
        AudioSystem.stopBGM();
    },
    
    // 隐藏游戏结果
    hideGameResult() {
        const resultOverlay = document.getElementById('result-overlay');
        if (resultOverlay) resultOverlay.style.display = 'none';
    },
    
    // 显示技能按钮
    showSkillButton(skillName, onClick) {
        const skillBtn = document.getElementById('btn-skill');
        if (skillBtn) {
            skillBtn.innerText = `【${skillName}】`;
            skillBtn.disabled = false;
            skillBtn.style.opacity = '1';
            skillBtn.onclick = onClick;
        }
    },

    // 隐藏技能按钮
    hideSkillButton() {
        const skillBtn = document.getElementById('btn-skill');
        if (skillBtn) {
            skillBtn.disabled = true;
            skillBtn.style.opacity = '0.5';
            skillBtn.onclick = null;
        }
    },
    
    // 获取元素中心位置（用于特效定位）
    getCenterPosition(elementId) {
        return EffectSystem.getCenterPosition(elementId);
    },
    
    // 屏幕震动
    shakeScreen(duration = 300) {
        EffectSystem.shakeScreen(duration);
    },
    
    // 创建粒子效果
    createParticles(x, y, color = '#d4af37', count = 10) {
        EffectSystem.createParticles(x, y, color, count);
    },
    
    // 显示统计面板
    showStatsPanel(stats) {
        const panel = document.getElementById('stats-panel');
        if (!panel) return;
        
        panel.innerHTML = `
            <div class="stats-title">游戏统计</div>
            <div class="stats-item"><span>总场次:</span><span class="stats-value">${stats.totalGames}</span></div>
            <div class="stats-item"><span>胜率:</span><span class="stats-value">${stats.winRate}%</span></div>
            <div class="stats-item"><span>击杀:</span><span class="stats-value">${stats.totalKills}</span></div>
        `;
        panel.classList.add('show');
    },
    
    // 隐藏统计面板
    hideStatsPanel() {
        const panel = document.getElementById('stats-panel');
        if (panel) panel.classList.remove('show');
    },
    
    // 显示游戏菜单
    showGameMenu() {
        const menu = document.getElementById('game-menu');
        if (menu) menu.classList.add('show');
    },
    
    // 隐藏游戏菜单
    hideGameMenu() {
        const menu = document.getElementById('game-menu');
        if (menu) menu.classList.remove('show');
    }
};

// 导出
export { UI };
export default UI;
