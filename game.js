// 核心游戏逻辑模块
import { CardUtils } from './cards.js';

const GameState = {
    players: [],
    deck: [],
    currentTurnIndex: 0,
    gameActive: false,
    userRole: '',
    selectedCardIndex: -1,
    isTargetingMode: false,
    pendingChainTargets: [],
    
    reset() {
        this.players = [];
        this.deck = [];
        this.currentTurnIndex = 0;
        this.gameActive = false;
        this.userRole = '';
        this.selectedCardIndex = -1;
        this.isTargetingMode = false;
        this.pendingChainTargets = [];
    }
};

const Game = {
    init() {
        GameState.reset();
        return GameState;
    },

    getState() {
        return GameState;
    },

    setUserRole(role) {
        GameState.userRole = role;
    },

    createPlayer(id, isUser, role, general) {
        return {
            id,
            isUser,
            role,
            general,
            hp: general.hp + (role === '主公' ? 1 : 0),
            maxHp: general.hp + (role === '主公' ? 1 : 0),
            hand: [],
            isDead: false,
            hasAttacked: false,
            berserk: false,
            identityKnown: role === '主公',
            lebu: false,
            chained: false,
            skillUsed: false,
            stats: { damageDealt: 0, healed: 0, kills: 0 }
        };
    },

    initDeck() {
        GameState.deck = CardUtils.createDeck();
        return GameState.deck;
    },

    startGame(selectedHero, generalsData) {
        GameState.gameActive = true;
        this.initDeck();
        let roles = ['主公', '忠臣', '反贼', '内奸'];
        roles.splice(roles.indexOf(GameState.userRole), 1);
        roles = CardUtils.shuffle(roles);
        let aiPool = generalsData.filter(g => g.name !== selectedHero.name);
        aiPool = CardUtils.shuffle(aiPool);
        GameState.players = [];
        GameState.players.push(this.createPlayer(0, true, GameState.userRole, selectedHero));
        for (let i = 0; i < 3; i++) {
            GameState.players.push(this.createPlayer(i + 1, false, roles[i], aiPool[i]));
        }
        // 标记主公身份可见
        GameState.players.forEach(p => { if (p.role === '主公') p.identityKnown = true; });
        // 发牌，主公多摸一张
        GameState.players.forEach(p => {
            const extraCards = p.role === '主公' ? 1 : 0;
            this.drawCards(p, 4 + extraCards);
        });
        // 找到主公的索引
        const lordIndex = GameState.players.findIndex(p => p.role === '主公');
        return {
            players: GameState.players,
            lordIndex: lordIndex,
            firstIndex: lordIndex,
            message: '游戏开始！'
        };
    },

    drawCards(player, count) {
        const cards = CardUtils.drawFromDeck(GameState.deck, count);
        player.hand.push(...cards);
        return cards;
    },

    async startTurn(idx) {
        if (!GameState.gameActive) return { success: false };
        GameState.currentTurnIndex = idx;
        const player = GameState.players[idx];
        if (player.isDead) return { success: false, next: true };
        player.hasAttacked = false;
        player.berserk = false;
        player.skillUsed = false;
        const events = [];
        if (player.lebu) {
            events.push({ type: 'judgment', card: '乐不思蜀', player: player.id });
            const success = Math.random() > 0.5;
            player.lebu = false;
            if (!success) return { success: true, events, skipPlay: true };
        }
        this.drawCards(player, 2);
        events.push({ type: 'draw', player: player.id });
        return { success: true, events };
    },

    async endTurn() {
        const player = GameState.players[GameState.currentTurnIndex];
        const events = [];
        const maxCards = player.hp;
        while (player.hand.length > maxCards && player.hand.length > 0) {
            player.hand.pop();
            events.push({ type: 'discard', source: player.id });
        }
        return { type: 'end_turn', player: player.id, events };
    },

    nextTurn() {
        const winCheck = this.checkWin();
        if (winCheck.gameOver) return { gameOver: true, ...winCheck };
        const nextIndex = (GameState.currentTurnIndex + 1) % GameState.players.length;
        return { gameOver: false, nextIndex };
    },

    checkWin() {
        const lord = GameState.players.find(p => p.role === '主公' && !p.isDead);
        const rebels = GameState.players.filter(p => p.role === '反贼' && !p.isDead);
        const traitor = GameState.players.filter(p => p.role === '内奸' && !p.isDead);
        const user = GameState.players[0];

        // 主公阵亡
        if (!lord) {
            // 检查玩家阵营
            if (user.role === '主公') {
                return { gameOver: true, win: false, message: '主公阵亡，你败了！' };
            } else if (user.role === '忠臣') {
                return { gameOver: true, win: false, message: '主公阵亡，忠臣战败！' };
            } else if (user.role === '反贼') {
                return { gameOver: true, win: true, message: '主公阵亡，反贼胜利！' };
            } else if (user.role === '内奸') {
                return { gameOver: true, win: true, message: '主公阵亡，内奸胜利！' };
            }
        }

        // 反贼和内奸全部阵亡 - 主公阵营胜利
        if (rebels.length === 0 && traitor.length === 0) {
            if (user.role === '主公' || user.role === '忠臣') {
                return { gameOver: true, win: true, message: '反贼全灭，你胜利了！' };
            } else {
                return { gameOver: true, win: false, message: '反贼全灭，你败了！' };
            }
        }

        // 反贼全部阵亡但还有内奸 - 游戏继续
        if (rebels.length === 0 && traitor.length > 0) {
            return { gameOver: false };
        }

        return { gameOver: false };
    },

    gameOver(win, message) {
        GameState.gameActive = false;
        return { win, message };
    },

    getAlivePlayers() { return GameState.players.filter(p => !p.isDead); },
    getPlayer(id) { return GameState.players.find(p => p.id === id); },
    getCurrentPlayer() { return GameState.players[GameState.currentTurnIndex]; },

    selectCard(index) {
        const player = GameState.players[0];
        if (!player.isUser || GameState.currentTurnIndex !== 0) return { success: false };
        GameState.selectedCardIndex = index;
        const card = player.hand[index];
        GameState.isTargetingMode = CardUtils.requiresTarget(card);
        return { success: true, action: 'select', card, requiresTarget: GameState.isTargetingMode };
    },

    selectTarget(targetId) {
        const player = GameState.players[0];

        // 检查是否在出牌阶段
        if (GameState.selectedCardIndex === -1) {
            // 可能是在使用技能
            const skillName = player.general.skill;

            // 苦肉技能：失去1点生命摸2张牌
            if (skillName === '苦肉' && targetId === 0 && GameState.currentTurnIndex === 0 && !player.skillUsed) {
                if (player.hp > 1) {
                    player.hp--;
                    this.drawCards(player, 2);
                    player.skillUsed = true;
                    return {
                        success: true,
                        action: 'skill',
                        skill: '苦肉',
                        skillDesc: `${player.general.name}发动【苦肉】，失去1点生命摸2张牌`,
                        player: 0,
                        hp: player.hp
                    };
                }
            }

            // 制衡技能：弃任意张手牌摸等量的牌（每回合限一次）
            if (skillName === '制衡' && targetId === 0 && GameState.currentTurnIndex === 0 && !player.skillUsed) {
                if (player.hand.length > 0) {
                    player.hand.pop();
                    this.drawCards(player, 1);
                    player.skillUsed = true;
                    return {
                        success: true,
                        action: 'skill',
                        skill: '制衡',
                        skillDesc: `${player.general.name}发动【制衡】，弃置1张牌摸1张牌`,
                        player: 0
                    };
                }
            }
            return { success: false };
        }

        const card = player.hand[GameState.selectedCardIndex];
        if (!card) return { success: false };

        // 检查出牌限制
        if (card === '杀' && player.hasAttacked && player.general.skill !== '无双') {
            return { success: false, reason: 'already_attacked' };
        }

        // 铁索连环特殊逻辑
        if (card === '铁索') {
            if (!GameState.pendingChainTargets) GameState.pendingChainTargets = [];
            if (GameState.pendingChainTargets.includes(targetId)) {
                return { success: false, reason: 'already_selected' };
            }
            GameState.pendingChainTargets.push(targetId);
            if (GameState.pendingChainTargets.length < 2) {
                return { success: true, action: 'chain_select', selected: GameState.pendingChainTargets };
            } else {
                // 选择完成，返回铁索目标
                const chainTargets = [...GameState.pendingChainTargets];
                GameState.pendingChainTargets = [];
                GameState.isTargetingMode = false;
                const cardIndex = GameState.selectedCardIndex;
                GameState.selectedCardIndex = -1;
                return {
                    success: true,
                    action: 'target_selected',
                    cardIndex,
                    chainTargets,
                    targetId: targetId  // 添加 targetId，虽然铁索不使用单目标
                };
            }
        }

        // 有目标卡牌，返回目标信息
        GameState.isTargetingMode = false;
        const cardIndex = GameState.selectedCardIndex;
        GameState.selectedCardIndex = -1;
        return { success: true, action: 'target_selected', targetId: targetId, cardIndex };
    },

    async useCard(sourceIdx, cardIndex, targetInfo) {
        const source = GameState.players[sourceIdx];
        const card = source.hand[cardIndex];
        source.hand.splice(cardIndex, 1);
        const events = [{ type: 'use_card', card, source: sourceIdx }];

        switch (card) {
            case '杀':
                source.hasAttacked = true;
                if (targetInfo && targetInfo.id !== undefined) {
                    events.push({ type: 'attack', source: sourceIdx, target: targetInfo.id, attackType: 'sha' });
                }
                break;
            case '桃':
                if (targetInfo && targetInfo.hp < targetInfo.maxHp) {
                    targetInfo.hp++;
                    events.push({ type: 'heal', target: targetInfo.id, hp: targetInfo.hp, amount: 1 });
                }
                break;
            case '酒':
                source.berserk = true;
                if (source.hp < source.maxHp) {
                    source.hp++;
                    events.push({ type: 'heal', target: sourceIdx, hp: source.hp, amount: 1 });
                }
                break;
            case '万箭':
            case '南蛮':
                const attackType = card === '万箭' ? 'wanjian' : 'nanman';
                events.push({ type: 'aoe', card, source: sourceIdx, attackType });
                break;
            case '五谷':
                // 五谷丰登：全场每人摸1张牌
                for (const p of GameState.players) {
                    if (!p.isDead) {
                        this.drawCards(p, 1);
                        events.push({ type: 'draw', target: p.id, count: 1 });
                    }
                }
                break;
            case '无中':
                this.drawCards(source, 2);
                events.push({ type: 'draw', count: 2 });
                break;
            case '乐不':
                if (targetInfo && targetInfo.id !== undefined) {
                    targetInfo.lebu = true;
                    events.push({ type: 'delay', card: '乐不', target: targetInfo.id });
                }
                break;
            case '顺手':
                if (targetInfo && targetInfo.hand && targetInfo.hand.length > 0) {
                    const stolen = targetInfo.hand.pop();
                    source.hand.push(stolen);
                    events.push({ type: 'steal', source: sourceIdx, target: targetInfo.id });
                }
                break;
            case '拆桥':
                if (targetInfo && targetInfo.hand && targetInfo.hand.length > 0) {
                    targetInfo.hand.pop();
                    events.push({ type: 'discard', source: sourceIdx, target: targetInfo.id });
                }
                break;
            case '决斗':
                if (targetInfo && targetInfo.id !== undefined) {
                    events.push({ type: 'duel', source: sourceIdx, target: targetInfo.id });
                }
                break;
            case '火攻':
                if (targetInfo && targetInfo.id !== undefined) {
                    events.push({ type: 'fire_attack', source: sourceIdx, target: targetInfo.id });
                }
                break;
            case '铁索':
                // targetInfo 应该是数组
                if (Array.isArray(targetInfo)) {
                    for (const t of targetInfo) {
                        t.chained = !t.chained;
                        events.push({ type: 'chain', target: t.id, chained: t.chained });
                    }
                }
                break;
        }
        return { success: true, events, card };
    },

    async respondAttack(target, attackType) {
        const need = attackType === 'nanman' ? '杀' : '闪';
        const idx = target.hand.indexOf(need);
        if (idx !== -1) {
            target.hand.splice(idx, 1);
            return { success: true, responded: true, card: need, player: target.id };
        }
        return { success: true, responded: false, player: target.id };
    },

    async dealDamage(source, target, baseDamage = 1) {
        let damage = baseDamage;
        if (source.berserk) {
            damage++;
            source.berserk = false;  // 立即清除酒的buff，防止重复加成
        }
        target.hp -= damage;
        const events = [{ type: 'damage', source: source.id, target: target.id, damage, hp: target.hp }];
        if (target.hp <= 0) {
            target.isDead = true;
            target.identityKnown = true;
            events.push({ type: 'death', player: target.id });
        }
        return { success: true, events };
    },

    cancelAction() {
        GameState.selectedCardIndex = -1;
        GameState.isTargetingMode = false;
        GameState.pendingChainTargets = [];
        return { success: true };
    },

    // 解析决斗
    resolveDuel(source, target) {
        return { success: true, events: [] };
    },

    // 火攻处理
    resolveFireAttack(source, target) {
        const events = [];
        // 火攻：目标需要弃一张牌，否则受1点伤害
        if (target.hand.length > 0) {
            // 目标有牌，弃掉一张
            const discardIdx = Math.floor(Math.random() * target.hand.length);
            const discardedCard = target.hand.splice(discardIdx, 1)[0];
            events.push({ type: 'discard', source: source.id, target: target.id, card: discardedCard, reason: 'fire_attack_defense' });
        } else {
            // 目标没有牌，受伤害
            const dmgResult = this.dealDamage(source, target, 1);
            events.push(...dmgResult.events);
        }
        return { success: true, events };
    },

    // 解析AOE攻击
    async resolveAOE(source, attackType) {
        const events = [];
        for (const p of GameState.players) {
            if (!p.isDead && p.id !== source.id) {
                const resp = await this.respondAttack(p, attackType);
                if (!resp.responded) {
                    const dmg = await this.dealDamage(source, p, 1);
                    events.push(...dmg.events);
                }
            }
        }
        return { success: true, events };
    }
};

export { Game, GameState };
export default Game;
