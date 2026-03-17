// 核心游戏逻辑模块 - 游戏状态管理、回合流程、胜负判定

import { CardUtils } from './cards.js';

// 游戏状态
const GameState = {
    players: [],
    deck: [],
    currentTurnIndex: 0,
    gameActive: false,
    userRole: '',
    selectedCardIndex: -1,
    isTargetingMode: false,
    pendingChainTargets: [],
    
    // 重置游戏状态
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

// 游戏核心逻辑对象
const Game = {
    // 初始化游戏
    init() {
        GameState.reset();
        return GameState;
    },

    // 获取当前游戏状态
    getState() {
        return {
            players: GameState.players,
            deck: GameState.deck,
            currentTurnIndex: GameState.currentTurnIndex,
            gameActive: GameState.gameActive,
            userRole: GameState.userRole,
            selectedCardIndex: GameState.selectedCardIndex,
            isTargetingMode: GameState.isTargetingMode,
            pendingChainTargets: GameState.pendingChainTargets
        };
    },

    // 设置用户身份
    setUserRole(role) {
        GameState.userRole = role;
    },

    // 创建玩家
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

    // 初始化牌堆
    initDeck() {
        GameState.deck = CardUtils.createDeck();
        return GameState.deck;
    },

    // 开始游戏
    startGame(selectedHero, generalsData) {
        GameState.gameActive = true;
        
        // 初始化牌堆
        this.initDeck();

        // 分配身份
        let roles = ['主公', '忠臣', '反贼', '内奸'];
        roles.splice(roles.indexOf(GameState.userRole), 1);
        roles = CardUtils.shuffle(roles);

        // 获取AI武将池
        let aiPool = generalsData.filter(g => g.name !== selectedHero.name);
        aiPool = CardUtils.shuffle(aiPool);

        // 创建玩家 - 玩家永远是第一个（index 0）
        GameState.players = [];
        GameState.players.push(this.createPlayer(0, true, GameState.userRole, selectedHero));
        for (let i = 0; i < 3; i++) {
            GameState.players.push(this.createPlayer(i + 1, false, roles[i], aiPool[i]));
        }

        // 主公身份公开 - 所有人都知道主公是谁
        GameState.players.forEach(p => {
            if (p.role === '主公') {
                p.identityKnown = true;
            }
        });

        // 初始发牌 - 主公额外加1血，所以额外多摸1张牌
        GameState.players.forEach(p => {
            const extraCards = p.role === '主公' ? 1 : 0;
            this.drawCards(p, 4 + extraCards);
        });

        // 玩家第一个行动！（index 0），这样不会还没出牌就结束
        let firstIndex = 0;
        
        // 如果玩家选了主公，那还是玩家先手
        // 如果玩家没选主公，主公已经公开身份但还是玩家先手，这样玩家至少能出一轮牌
        
        return {
            players: GameState.players,
            lordIndex: GameState.players.findIndex(p => p.role === '主公'),
            firstIndex,
            message: `游戏开始！主公是 ${GameState.players[GameState.players.findIndex(p => p.role === '主公')].general.name}，你先手！`
        };
    },

    // 抽牌
    drawCards(player, count) {
        const cards = CardUtils.drawFromDeck(GameState.deck, count);
        player.hand.push(...cards);
        return cards;
    },

    // 开始回合
    async startTurn(idx, callbacks = {}) {
        if (!GameState.gameActive) return { success: false, reason: 'game_not_active' };
        
        GameState.currentTurnIndex = idx;
        const player = GameState.players[idx];

        if (player.isDead) {
            return { success: false, reason: 'player_dead', next: true };
        }

        // 重置回合状态
        player.hasAttacked = false;
        player.berserk = false;
        player.skillUsed = false;

        const events = [];

        // 1. 判定阶段 - 乐不思蜀
        if (player.lebu) {
            events.push({ type: 'judgment', card: '乐不思蜀', player: player.id });
            
            const success = Math.random() > 0.5;
            player.lebu = false;
            
            if (!success) {
                events.push({ type: 'judgment_fail', card: '乐不思蜀', player: player.id });
                
                // 甄姬洛神判定（回合开始）
                if (player.general.name === '甄姬') {
                    const luoShenResult = await this.triggerLuoShen(player);
                    events.push(luoShenResult);
                }
                
                // 华佗急救（回合结束）
                if (player.general.name === '华佗') {
                    const jiJiuResult = await this.triggerJiJiu(player);
                    events.push(jiJiuResult);
                }
                
                return { success: true, events, skipPlay: true };
            } else {
                events.push({ type: 'judgment_success', card: '乐不思蜀', player: player.id });
            }
        }

        // 甄姬洛神
        if (player.general.name === '甄姬') {
            const luoShenResult = await this.triggerLuoShen(player);
            events.push(luoShenResult);
        }

        // 2. 摸牌阶段
        const drawEvents = this.handleDrawPhase(player);
        events.push(...drawEvents);

        return { success: true, events, player: player.id };
    },

    // 摸牌阶段处理
    handleDrawPhase(player) {
        const events = [];
        
        if (player.general.name === '周瑜') {
            events.push({ type: 'skill', name: '英姿', player: player.id });
            this.drawCards(player, 3);
        } else if (player.general.name === '许褚') {
            events.push({ type: 'skill', name: '裸衣', player: player.id });
            this.drawCards(player, 1);
            player.berserk = true;
        } else {
            this.drawCards(player, 2);
        }

        if (player.general.name === '刘备') {
            events.push({ type: 'skill', name: '仁德', player: player.id });
            this.drawCards(player, 1);
        }

        events.push({ type: 'draw', player: player.id });
        return events;
    },

    // 甄姬洛神
    async triggerLuoShen(player) {
        const success = Math.random() > 0.4;
        if (success) {
            this.drawCards(player, 1);
            return { type: 'skill', name: '洛神', player: player.id, success: true };
        }
        return { type: 'skill', name: '洛神', player: player.id, success: false };
    },

    // 华佗急救
    async triggerJiJiu(player) {
        if (player.hp < player.maxHp) {
            player.hp++;
            player.stats.healed++;
            return { type: 'skill', name: '急救', player: player.id, hp: player.hp };
        }
        return null;
    },

    // 结束回合 - 自动弃牌，手牌不超过当前hp
    async endTurn() {
        const player = GameState.players[GameState.currentTurnIndex];
        const events = [];
        
        // 华佗急救
        if (player.general.name === '华佗') {
            const jiJiuResult = await this.triggerJiJiu(player);
            if (jiJiuResult) {
                events.push({ type: 'end_turn', player: player.id, skill: jiJiuResult });
            }
        }
        
        // 自动弃牌：手牌数量不能超过当前血量
        const maxCards = player.hp;
        while (player.hand.length > maxCards) {
            // 找优先级最低的牌丢弃
            // 优先级评分越低越值得保留，越高越值得扔
            let discardIdx = -1;
            let highestPriority = 0;
            
            for (let i = 0; i < player.hand.length; i++) {
                const card = player.hand[i];
                let priority = 0;
                
                // 优先级：需要扔的排优先级高
                // 桃酒 > 闪 > 杀 > 无懈 > 决斗火攻 > 顺手拆桥 > AOE > 延时锦囊
                if (card === '桃') priority = 10;
                else if (card === '酒') priority = 15;
                else if (card === '闪') priority = 20;
                else if (card === '杀') priority = 30;
                else if (card === '无懈') priority = 35;
                else if (card === '决斗' || card === '火攻') priority = 40;
                else if (card === '顺手' || card === '拆桥') priority = 45;
                else if (card === '万箭' || card === '南蛮') priority = 50;
                else if (card === '五谷' || card === '无中') priority = 55;
                else if (card === '乐不' || card === '兵粮' || card === '闪电') priority = 60;
                
                if (priority > highestPriority) {
                    highestPriority = priority;
                    discardIdx = i;
                }
            }
            
            if (discardIdx >= 0) {
                const discarded = player.hand.splice(discardIdx, 1)[0];
                events.push({ 
                    type: 'discard', 
                    source: player.id, 
                    card: discarded, 
                    reason: 'overlap' 
                });
            }
        }
        
        return { type: 'end_turn', player: player.id, events };
    },

    // 下一回合
    nextTurn() {
        const winCheck = this.checkWin();
        if (winCheck.gameOver) {
            return { gameOver: true, ...winCheck };
        }
        
        const nextIndex = (GameState.currentTurnIndex + 1) % GameState.players.length;
        return { gameOver: false, nextIndex };
    },

    // 选择卡牌
    selectCard(index) {
        const player = GameState.players[0];
        if (!player.isUser || GameState.currentTurnIndex !== 0) {
            return { success: false };
        }

        if (GameState.selectedCardIndex === index) {
            // 取消选择
            GameState.selectedCardIndex = -1;
            GameState.isTargetingMode = false;
            GameState.pendingChainTargets = [];
            return { success: true, action: 'cancel' };
        }

        GameState.selectedCardIndex = index;
        const card = player.hand[index];
        GameState.isTargetingMode = CardUtils.requiresTarget(card);
        GameState.pendingChainTargets = [];

        return { 
            success: true, 
            action: 'select', 
            card,
            requiresTarget: GameState.isTargetingMode,
            isChain: card === '铁索'
        };
    },

    // 选择目标
    selectTarget(targetId) {
        const player = GameState.players[0];
        
        // 特殊技能：黄盖苦肉
        if (player.general.name === '黄盖' && targetId === 0 && 
            GameState.currentTurnIndex === 0 && !player.skillUsed && 
            GameState.selectedCardIndex === -1) {
            if (player.hp > 1) {
                player.hp--;
                this.drawCards(player, 2);
                player.skillUsed = true;
                return { 
                    success: true, 
                    action: 'skill', 
                    skill: '苦肉', 
                    player: 0,
                    hp: player.hp
                };
            }
        }

        // 特殊技能：孙权制衡
        if (player.general.name === '孙权' && targetId === 0 && 
            GameState.currentTurnIndex === 0 && !player.skillUsed && 
            GameState.selectedCardIndex === -1) {
            if (player.hand.length > 0) {
                player.hand.pop();
                this.drawCards(player, 1);
                player.skillUsed = true;
                return { 
                    success: true, 
                    action: 'skill', 
                    skill: '制衡', 
                    player: 0
                };
            }
        }

        if (!GameState.isTargetingMode || GameState.selectedCardIndex === -1) {
            return { success: false };
        }

        const target = GameState.players[targetId];
        if (target.isDead) return { success: false, reason: 'target_dead' };

        const card = player.hand[GameState.selectedCardIndex];

        // 铁索连环特殊逻辑
        if (card === '铁索') {
            if (GameState.pendingChainTargets.includes(targetId)) {
                return { success: false, reason: 'already_selected' };
            }
            
            GameState.pendingChainTargets.push(targetId);
            
            if (GameState.pendingChainTargets.length < 2) {
                return { 
                    success: true, 
                    action: 'chain_select', 
                    selected: GameState.pendingChainTargets 
                };
            }
        }

        // 检查出牌限制
        if (card === '杀' && player.hasAttacked && player.general.name !== '张飞') {
            return { success: false, reason: 'already_attacked' };
        }
        
        if (card === '乐不' && target.lebu) {
            return { success: false, reason: 'already_has_lebu' };
        }

        return { 
            success: true, 
            action: 'target_selected', 
            cardIndex: GameState.selectedCardIndex,
            targetId,
            chainTargets: card === '铁索' ? GameState.pendingChainTargets : null
        };
    },

    // 使用卡牌
    async useCard(sourceIdx, cardIndex, targetInfo) {
        const source = GameState.players[sourceIdx];
        const card = source.hand[cardIndex];
        
        // 移除手牌
        source.hand.splice(cardIndex, 1);
        
        const events = [{ type: 'use_card', card, source: sourceIdx }];

        // 处理各种卡牌效果
        switch (card) {
            case '杀':
                source.hasAttacked = true;
                events.push({ 
                    type: 'attack', 
                    source: sourceIdx, 
                    target: targetInfo.id,
                    attackType: 'sha'
                });
                break;
                
            case '桃':
                if (targetInfo.hp < targetInfo.maxHp) {
                    targetInfo.hp++;
                    source.stats.healed++;
                    events.push({ 
                        type: 'heal', 
                        target: targetInfo.id, 
                        hp: targetInfo.hp 
                    });
                }
                break;
                
            case '酒':
                if (targetInfo.hp < targetInfo.maxHp) {
                    targetInfo.hp++;
                    source.stats.healed++;
                    events.push({ type: 'heal', target: targetInfo.id, hp: targetInfo.hp });
                }
                source.berserk = true;
                events.push({ type: 'buff', buff: 'berserk', target: sourceIdx });
                break;
                
            case '万箭':
            case '南蛮':
                events.push({ 
                    type: 'aoe', 
                    card, 
                    source: sourceIdx,
                    attackType: card === '万箭' ? 'wanjian' : 'nanman'
                });
                break;
                
            case '无中':
                this.drawCards(source, 2);
                events.push({ type: 'draw', player: sourceIdx, count: 2 });
                break;
                
            case '五谷':
                GameState.players.forEach(p => {
                    if (!p.isDead) {
                        this.drawCards(p, 1);
                    }
                });
                events.push({ type: 'aoe_draw', card });
                break;
                
            case '顺手':
                if (targetInfo.hand.length > 0) {
                    const stealIdx = Math.floor(Math.random() * targetInfo.hand.length);
                    const got = targetInfo.hand.splice(stealIdx, 1)[0];
                    source.hand.push(got);
                    events.push({ 
                        type: 'steal', 
                        source: sourceIdx, 
                        target: targetInfo.id,
                        card: got
                    });
                }
                break;
                
            case '拆桥':
                if (targetInfo.hand.length > 0) {
                    const discardIdx = Math.floor(Math.random() * targetInfo.hand.length);
                    const discarded = targetInfo.hand.splice(discardIdx, 1)[0];
                    events.push({ 
                        type: 'discard', 
                        source: sourceIdx, 
                        target: targetInfo.id,
                        card: discarded
                    });
                }
                break;
                
            case '决斗':
                events.push({ 
                    type: 'duel', 
                    source: sourceIdx, 
                    target: targetInfo.id 
                });
                break;
                
            case '火攻':
                events.push({ 
                    type: 'fire_attack', 
                    source: sourceIdx, 
                    target: targetInfo.id 
                });
                break;
                
            case '乐不':
                targetInfo.lebu = true;
                events.push({ 
                    type: 'delay', 
                    card: '乐不',
                    source: sourceIdx,
                    target: targetInfo.id 
                });
                break;
                
            case '铁索':
                const targets = Array.isArray(targetInfo) ? targetInfo : [targetInfo];
                targets.forEach(t => {
                    t.chained = !t.chained;
                    events.push({ 
                        type: 'chain',
                        source: sourceIdx,
                        target: t.id, 
                        chained: t.chained 
                    });
                });
                break;
        }

        // 清除选择状态
        GameState.selectedCardIndex = -1;
        GameState.isTargetingMode = false;
        GameState.pendingChainTargets = [];

        return { success: true, events, card };
    },

    // 响应攻击（闪/杀）
    async respondAttack(target, attackType) {
        const need = attackType === 'nanman' ? '杀' : '闪';
        let idx = target.hand.indexOf(need);

        // 赵云龙胆
        if (target.general.name === '赵云' && idx === -1) {
            idx = target.hand.indexOf(need === '闪' ? '杀' : '闪');
        }

        if (idx !== -1) {
            target.hand.splice(idx, 1);
            return { 
                success: true, 
                responded: true, 
                card: need,
                player: target.id
            };
        }

        return { 
            success: true, 
            responded: false, 
            player: target.id
        };
    },

    // 造成伤害
    async dealDamage(source, target, baseDamage = 1) {
        let damage = baseDamage;
        if (source.berserk) damage++;

        target.hp -= damage;
        source.stats.damageDealt += damage;

        const events = [{ 
            type: 'damage', 
            source: source.id, 
            target: target.id, 
            damage,
            hp: target.hp
        }];

        // 铁索连环传导
        if (target.chained) {
            target.chained = false;
            events.push({ type: 'chain_trigger', source: target.id });
            
            for (let p of GameState.players) {
                if (p !== target && p.chained && !p.isDead) {
                    p.chained = false;
                    const chainDamage = await this.dealDamage(source, p, damage);
                    events.push(...chainDamage.events);
                }
            }
        }

        // 受伤技能触发
        const skillEvents = this.triggerDamageSkill(target);
        if (skillEvents) events.push(skillEvents);

        // 濒死处理
        if (target.hp <= 0) {
            const taoIdx = target.hand.indexOf('桃');
            if (taoIdx !== -1) {
                target.hand.splice(taoIdx, 1);
                target.hp++;
                target.stats.healed++;
                events.push({ 
                    type: 'save', 
                    target: target.id, 
                    card: '桃',
                    hp: target.hp
                });
            } else {
                const deathEvents = this.handleDeath(source, target);
                events.push(...deathEvents);
            }
        }

        return { success: true, events, targetHp: target.hp };
    },

    // 受伤技能触发
    triggerDamageSkill(player) {
        if (player.isDead) return null;
        
        if (player.general.name === '曹操') {
            this.drawCards(player, 1);
            return { type: 'skill', name: '奸雄', player: player.id };
        }
        
        if (player.general.name === '郭嘉') {
            this.drawCards(player, 2);
            return { type: 'skill', name: '遗计', player: player.id };
        }
        
        return null;
    },

    // 处理死亡
    handleDeath(killer, dead) {
        dead.isDead = true;
        dead.identityKnown = true;
        killer.stats.kills++;

        const events = [{ 
            type: 'death', 
            player: dead.id, 
            killer: killer.id 
        }];

        // 身份奖励/惩罚
        if (dead.role === '反贼') {
            this.drawCards(killer, 3);
            events.push({ 
                type: 'reward', 
                killer: killer.id, 
                reason: 'kill_rebel',
                cards: 3
            });
        } else if (dead.role === '忠臣' && killer.role === '主公') {
            killer.hand = [];
            events.push({ 
                type: 'punish', 
                player: killer.id, 
                reason: 'lord_kill_loyal',
                action: 'discard_all'
            });
        }

        return events;
    },

    // 决斗处理
    async resolveDuel(source, target) {
        const events = [];
        
        // 目标出杀
        let tIdx = target.hand.indexOf('杀');
        if (target.general.name === '赵云' && tIdx === -1) {
            tIdx = target.hand.indexOf('闪');
        }
        
        if (tIdx === -1) {
            // 目标没有杀，受伤
            const damageResult = await this.dealDamage(source, target, 1);
            events.push(...damageResult.events);
            return { success: true, events };
        }

        // 目标出杀反击
        target.hand.splice(tIdx, 1);
        events.push({ type: 'duel_response', player: target.id, card: '杀' });

        // 源角色出杀
        let sIdx = source.hand.indexOf('杀');
        if (source.general.name === '赵云' && sIdx === -1) {
            sIdx = source.hand.indexOf('闪');
        }

        if (sIdx === -1) {
            // 源角色没有杀，受伤
            const damageResult = await this.dealDamage(target, source, 1);
            events.push(...damageResult.events);
        } else {
            // 源角色出杀，平局
            source.hand.splice(sIdx, 1);
            events.push({ type: 'duel_response', player: source.id, card: '杀' });
            events.push({ type: 'duel_draw' });
        }

        return { success: true, events };
    },

    // 火攻处理
    async resolveFireAttack(source, target) {
        const events = [];
        
        if (target.hand.length > 0) {
            const discardIdx = Math.floor(Math.random() * target.hand.length);
            const discarded = target.hand.splice(discardIdx, 1)[0];
            events.push({ 
                type: 'discard', 
                source: target.id, 
                reason: 'fire_attack_defense',
                card: discarded
            });
        } else {
            const damageResult = await this.dealDamage(source, target, 1);
            events.push(...damageResult.events);
        }
        
        return { success: true, events };
    },

    // 胜负判定
    checkWin() {
        const lord = GameState.players.find(p => p.role === '主公');
        const rebels = GameState.players.filter(p => p.role === '反贼' && !p.isDead);
        const traitor = GameState.players.filter(p => p.role === '内奸' && !p.isDead);

        if (lord.isDead) {
            return { 
                gameOver: true, 
                win: false, 
                message: '主公阵亡，霸业成空！',
                players: GameState.players
            };
        }
        
        if (rebels.length === 0 && traitor.length === 0) {
            return { 
                gameOver: true, 
                win: true, 
                message: '逆贼全灭，天下大定！',
                players: GameState.players
            };
        }

        return { gameOver: false };
    },

    // 游戏结束
    gameOver(win, message) {
        GameState.gameActive = false;
        return {
            win,
            message,
            players: GameState.players.map(p => ({
                id: p.id,
                role: p.role,
                general: p.general,
                isDead: p.isDead,
                stats: p.stats
            }))
        };
    },

    // 获取存活玩家
    getAlivePlayers() {
        return GameState.players.filter(p => !p.isDead);
    },

    // 获取玩家
    getPlayer(id) {
        return GameState.players.find(p => p.id === id);
    },

    // 获取当前玩家
    getCurrentPlayer() {
        return GameState.players[GameState.currentTurnIndex];
    },

    // 取消操作
    cancelAction() {
        GameState.selectedCardIndex = -1;
        GameState.isTargetingMode = false;
        GameState.pendingChainTargets = [];
        return { success: true };
    }
};

// 导出
export { Game, GameState };
export default Game;
