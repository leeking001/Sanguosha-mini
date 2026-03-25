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
    pendingSkill: null,

    reset() {
        this.players = [];
        this.deck = [];
        this.currentTurnIndex = 0;
        this.gameActive = false;
        this.userRole = '';
        this.selectedCardIndex = -1;
        this.isTargetingMode = false;
        this.pendingChainTargets = [];
        this.pendingSkill = null;
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
            handLimitReduced: 0,  // 色诱技能的效果：本回合手牌上限减少
            stats: {
                damageDealt: 0,
                healed: 0,
                kills: 0,
                cardsPlayed: 0,
                strategiesUsed: 0,
                skillsUsed: 0
            }
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
        if (player.isDead) return { success: false, reason: 'player_dead', next: true };
        player.hasAttacked = false;
        player.berserk = false;
        player.skillUsed = false;

        // 重置所有玩家的色诱效果
        for (const p of GameState.players) {
            p.handLimitReduced = 0;
        }

        const events = [];
        if (player.lebu) {
            events.push({ type: 'judgment', card: '乐不思蜀', player: player.id });
            // 判定牌：红桃则乐不思蜀失效，其他花色则生效（跳过出牌阶段）
            // 红桃约占1/4，即25%几率跳过乐不
            const judgmentSuccess = Math.random() < 0.25;  // 红桃跳过
            player.lebu = false;
            if (!judgmentSuccess) {
                events.push({ type: 'judgment_fail', card: '乐不思蜀', player: player.id });
                return { success: true, events, skipPlay: true };
            } else {
                events.push({ type: 'judgment_success', card: '乐不思蜀', player: player.id });
            }
        }
        this.drawCards(player, 2);
        events.push({ type: 'draw', player: player.id });
        return { success: true, events };
    },

    async endTurn() {
        const player = GameState.players[GameState.currentTurnIndex];
        const events = [];
        let maxCards = player.hp;

        // 考虑色诱技能的影响：手牌上限减少
        if (player.handLimitReduced) {
            maxCards -= player.handLimitReduced;
        }

        // 确保手牌上限不为负数
        maxCards = Math.max(0, maxCards);

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

        // 铁索连环：需要选择2名目标
        if (card === '铁索') {
            // 初始化待选择的链接目标列表
            if (!GameState.pendingChainTargets) {
                GameState.pendingChainTargets = [];
            }

            // 检查目标是否已被选择
            if (GameState.pendingChainTargets.includes(targetId)) {
                return { success: false, reason: 'already_selected' };
            }

            // 添加目标到待选列表
            GameState.pendingChainTargets.push(targetId);

            // 如果只选了1个目标，等待第二个目标
            if (GameState.pendingChainTargets.length < 2) {
                return {
                    success: true,
                    action: 'chain_select',
                    selected: GameState.pendingChainTargets,
                    message: '已选择第1个目标，请选择第2个目标'
                };
            }

            // 2个目标都选完了，返回结果
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
                message: '铁索已连接两名角色'
            };
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
        source.stats.cardsPlayed += 1;
        const events = [{ type: 'use_card', card, source: sourceIdx, target: targetInfo?.id }];

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
                    source.stats.healed += 1;
                    events.push({ type: 'heal', target: targetInfo.id, hp: targetInfo.hp, amount: 1 });
                }
                break;
            case '酒':
                source.berserk = true;
                if (source.hp < source.maxHp) {
                    source.hp++;
                    source.stats.healed += 1;
                    events.push({ type: 'heal', target: sourceIdx, hp: source.hp, amount: 1 });
                }
                break;
            case '万箭':
            case '南蛮':
                source.stats.strategiesUsed += 1;
                const attackType = card === '万箭' ? 'wanjian' : 'nanman';
                events.push({ type: 'aoe', card, source: sourceIdx, attackType });
                break;
            case '五谷':
                // 五谷丰登：全场每人摸1张牌
                source.stats.strategiesUsed += 1;
                for (const p of GameState.players) {
                    if (!p.isDead) {
                        this.drawCards(p, 1);
                        events.push({ type: 'draw', target: p.id, count: 1 });
                    }
                }
                break;
            case '无中':
                source.stats.strategiesUsed += 1;
                this.drawCards(source, 2);
                events.push({ type: 'draw', count: 2 });
                break;
            case '乐不':
                source.stats.strategiesUsed += 1;
                if (targetInfo && targetInfo.id !== undefined) {
                    targetInfo.lebu = true;
                    events.push({ type: 'delay', card: '乐不', target: targetInfo.id });
                }
                break;
            case '顺手':
                source.stats.strategiesUsed += 1;
                if (targetInfo && targetInfo.hand && targetInfo.hand.length > 0) {
                    const stolen = targetInfo.hand.pop();
                    source.hand.push(stolen);
                    events.push({ type: 'steal', source: sourceIdx, target: targetInfo.id });
                }
                break;
            case '拆桥':
                source.stats.strategiesUsed += 1;
                if (targetInfo && targetInfo.hand && targetInfo.hand.length > 0) {
                    targetInfo.hand.pop();
                    events.push({ type: 'discard', source: sourceIdx, target: targetInfo.id });
                }
                break;
            case '决斗':
                source.stats.strategiesUsed += 1;
                if (targetInfo && targetInfo.id !== undefined) {
                    events.push({ type: 'duel', source: sourceIdx, target: targetInfo.id });
                }
                break;
            case '火攻':
                source.stats.strategiesUsed += 1;
                if (targetInfo && targetInfo.id !== undefined) {
                    events.push({ type: 'fire_attack', source: sourceIdx, target: targetInfo.id });
                }
                break;
            case '桃园':
                // 桃园结义：所有角色回复1点体力
                source.stats.strategiesUsed += 1;
                for (const p of GameState.players) {
                    if (!p.isDead && p.hp < p.maxHp) {
                        p.hp++;
                        source.stats.healed += 1;
                        events.push({ type: 'heal', target: p.id, hp: p.hp, amount: 1 });
                    }
                }
                break;
            case '铁索':
                source.stats.strategiesUsed += 1;
                // 铁索连接两名角色，使其进入连环状态
                // 连环状态下，一方受伤时另一方也受到伤害
                if (Array.isArray(targetInfo)) {
                    for (const target of targetInfo) {
                        // 切换目标的连环状态（connected/disconnected）
                        target.chained = !target.chained;
                        events.push({
                            type: 'chain',
                            target: target.id,
                            chained: target.chained,
                            status: target.chained ? '已连锁' : '已解锁'
                        });
                    }
                }
                break;
        }
        return { success: true, events, card };
    },

    async respondAttack(target, attackType) {
        const need = attackType === 'nanman' ? '杀' : '闪';

        // 检查赵云的龙胆技能：【杀】可当【闪】，【闪】可当【杀】
        let acceptCards = [need];
        if (target.general.skill === '龙胆') {
            const alternative = need === '杀' ? '闪' : '杀';
            acceptCards.push(alternative);
        }

        // 尝试找到可以接受的卡牌
        for (const card of acceptCards) {
            const idx = target.hand.indexOf(card);
            if (idx !== -1) {
                target.hand.splice(idx, 1);
                return { success: true, responded: true, card, player: target.id };
            }
        }

        return { success: true, responded: false, player: target.id };
    },

    // 检查目标是否可以使用无懈可击抵消锦囊
    checkWuxie(target, sourceId, cardName) {
        // 检查目标手中是否有无懈可击
        const wuxieIdx = target.hand.indexOf('无懈可击');
        if (wuxieIdx !== -1) {
            // 移除无懈可击
            target.hand.splice(wuxieIdx, 1);
            return {
                success: true,
                nullified: true,
                player: target.id,
                card: '无懈可击',
                targetCard: cardName
            };
        }
        return { success: true, nullified: false, player: target.id };
    },

    async dealDamage(source, target, baseDamage = 1, attackType = 'sha') {
        let damage = baseDamage;
        // 只有【杀】类型的攻击才会被酒的buff影响
        // 策略卡（南蛮、万箭等）不受酒buff影响
        if (source.berserk && attackType === 'sha') {
            damage++;
            source.berserk = false;  // 立即清除酒的buff，防止重复加成
        } else if (attackType !== 'sha' && source.berserk) {
            // 非杀类型的攻击，直接清除berserk，不应用buff
            source.berserk = false;
        }

        // 反骨延的狂暴技能：使用后下次【杀】伤害+1（主动）
        if (source.berserkActive && attackType === 'sha') {
            damage++;
            source.berserkActive = false; // 使用后清除状态
        }

        target.hp -= damage;
        // 更新伤害统计
        source.stats.damageDealt += damage;
        const events = [{ type: 'damage', source: source.id, target: target.id, damage, hp: target.hp }];

        // 检查是否触发连环伤害共享
        if (target.chained) {
            // 解除目标的连环状态
            target.chained = false;
            events.push({ type: 'chain_removed', target: target.id });

            // 找到所有连环的目标，依次传递伤害
            const chainedTargets = GameState.players.filter(p => p.chained && p.id !== target.id && !p.isDead);
            for (const p of chainedTargets) {
                // 解除该角色的连环状态
                p.chained = false;
                events.push({ type: 'chain_removed', target: p.id });

                // 对连环目标造成相同伤害
                const chainedDamage = damage;
                p.hp -= chainedDamage;
                source.stats.damageDealt += chainedDamage;
                events.push({
                    type: 'damage',
                    source: source.id,
                    target: p.id,
                    damage: chainedDamage,
                    hp: p.hp,
                    reason: 'chain_damage'
                });
                if (p.hp <= 0) {
                    p.isDead = true;
                    p.identityKnown = true;
                    source.stats.kills += 1;
                    events.push({ type: 'death', player: p.id, attacker: source.id });
                }
            }
        }

        if (target.hp <= 0) {
            target.isDead = true;
            target.identityKnown = true;
            // 更新击杀统计
            source.stats.kills += 1;
            events.push({ type: 'death', player: target.id, attacker: source.id });
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
    async resolveDuel(source, target) {
        const events = [];

        // 决斗：被挑战方先出【杀】，然后双方轮流出【杀】，不出者受伤害
        // 注意：决斗中只能出【杀】，不能出【闪】
        let currentPlayer = target;  // 被挑战方先出
        let otherPlayer = source;
        let round = 0;

        while (round < 100) { // 防止无限循环
            // 当前玩家尝试出【杀】
            let shaIdx = currentPlayer.hand.indexOf('杀');

            // 检查龙胆技能：【闪】可以当【杀】使用
            if (shaIdx === -1 && currentPlayer.general.skill === '龙胆') {
                shaIdx = currentPlayer.hand.indexOf('闪');
                if (shaIdx !== -1) {
                    // 用闪当杀
                    currentPlayer.hand.splice(shaIdx, 1);
                    events.push({ type: 'duel_attack', player: currentPlayer.id, card: '杀(龙胆)' });
                    // 交换攻防
                    [currentPlayer, otherPlayer] = [otherPlayer, currentPlayer];
                    round++;
                    continue;
                }
            }

            if (shaIdx !== -1) {
                currentPlayer.hand.splice(shaIdx, 1);
                events.push({ type: 'duel_attack', player: currentPlayer.id, card: '杀' });
                // 交换攻防角色，轮到对方出杀
                [currentPlayer, otherPlayer] = [otherPlayer, currentPlayer];
            } else {
                // 当前玩家出不出【杀】，受伤害
                const dmg = await this.dealDamage(otherPlayer, currentPlayer, 1, 'duel');
                events.push(...dmg.events);
                break;
            }

            round++;
        }

        return { success: true, events };
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
            const dmgResult = this.dealDamage(source, target, 1, 'fire_attack');
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
    },

    // 使用龙胆技能：将选中的【杀】转换为【闪】，或【闪】转换为【杀】
    useLongdanSkill(playerId, cardIndex) {
        const player = GameState.players[playerId];
        if (!player || player.isDead) {
            return { success: false, reason: 'player_dead' };
        }

        // 检查是否是该玩家的回合
        if (GameState.currentTurnIndex !== playerId) {
            return { success: false, reason: 'not_player_turn' };
        }

        // 检查技能是否已使用
        if (player.skillUsed) {
            return { success: false, reason: 'skill_already_used' };
        }

        // 检查是否选中了手牌
        if (cardIndex === null || cardIndex === undefined) {
            return { success: false, reason: 'no_card_selected' };
        }

        const card = player.hand[cardIndex];
        if (!card) {
            return { success: false, reason: 'invalid_card_index' };
        }

        // 检查选中的牌是否是【杀】或【闪】
        if (card !== '杀' && card !== '闪') {
            return { success: false, reason: 'invalid_card_for_longdan' };
        }

        // 转换卡牌
        const newCard = card === '杀' ? '闪' : '杀';
        player.hand[cardIndex] = newCard;
        player.skillUsed = true;

        const events = [{
            type: 'skill',
            name: '龙胆',
            player: playerId,
            description: `${player.general.name}发动【龙胆】，将一张【${card}】转换为【${newCard}】`
        }];

        return { success: true, events };
    },

    // 使用主动技能
    useActiveSkill(playerId, targetId = null) {
        const player = GameState.players[playerId];
        if (!player || player.isDead) {
            return { success: false, reason: 'player_dead' };
        }

        // 检查是否是该玩家的回合
        if (GameState.currentTurnIndex !== playerId) {
            return { success: false, reason: 'not_player_turn' };
        }

        // 检查是否已经使用过技能
        if (player.skillUsed) {
            return { success: false, reason: 'skill_already_used' };
        }

        const skillName = player.general.skill;
        const events = [];

        switch (skillName) {
            case '仁德':
                // 仁德：出牌阶段开始时，额外摸1张牌
                this.drawCards(player, 1);
                player.skillUsed = true;
                events.push({
                    type: 'skill',
                    name: '仁德',
                    player: playerId,
                    description: `${player.general.name}发动【仁德】，额外摸1张牌`
                });
                break;

            case '无双':
                // 无双：出牌阶段，使用【杀】无次数限制（这个是被动的，在出牌时处理）
                // 这里可以给一个视觉反馈
                events.push({
                    type: 'skill',
                    name: '无双',
                    player: playerId,
                    description: `${player.general.name}发动【无双】，本回合杀无次数限制`
                });
                player.skillUsed = true;
                break;

            case '制衡':
                // 制衡：出牌阶段，可弃置任意张手牌然后摸等量的牌（每回合限一次）
                if (player.hand.length > 0) {
                    const discardCount = Math.min(player.hand.length, Math.floor(Math.random() * 3) + 1);
                    player.hand.splice(0, discardCount);
                    this.drawCards(player, discardCount);
                    player.skillUsed = true;
                    events.push({
                        type: 'skill',
                        name: '制衡',
                        player: playerId,
                        description: `${player.general.name}发动【制衡】，弃置${discardCount}张牌摸${discardCount}张牌`
                    });
                } else {
                    return { success: false, reason: 'no_cards_to_discard' };
                }
                break;

            case '神医':
                // 神医：出牌阶段，可指定一名角色（包括自己）回复1点生命（每回合限一次）
                if (targetId === null) {
                    // 如果没有指定目标，返回可选目标列表
                    const aliveOthers = GameState.players.filter(p => !p.isDead && p.hp < p.maxHp);
                    if (aliveOthers.length === 0) {
                        return { success: false, reason: 'no_valid_target' };
                    }
                    return { success: false, reason: 'need_target', targets: aliveOthers.map(p => p.id), skillName: '神医' };
                }

                const targetForHeal = GameState.players[targetId];
                if (!targetForHeal || targetForHeal.isDead) {
                    return { success: false, reason: 'invalid_target' };
                }
                if (targetForHeal.hp >= targetForHeal.maxHp) {
                    return { success: false, reason: 'target_already_full_hp' };
                }

                targetForHeal.hp++;
                player.skillUsed = true;
                player.stats.healed += 1;
                events.push({
                    type: 'skill',
                    name: '神医',
                    player: playerId,
                    description: `${player.general.name}发动【神医】，令${targetForHeal.general.name}回复1点生命`,
                    hp: targetForHeal.hp
                });
                break;

            case '老当益壮':
                // 老当益壮：出牌阶段，可摸1张牌（每回合限一次）
                this.drawCards(player, 1);
                player.skillUsed = true;
                events.push({
                    type: 'skill',
                    name: '老当益壮',
                    player: playerId,
                    description: `${player.general.name}发动【老当益壮】，摸1张牌`
                });
                break;

            case '苦肉':
                // 苦肉：出牌阶段，可失去1点生命摸2张牌（每回合限一次）
                if (player.hp > 1) {
                    player.hp--;
                    this.drawCards(player, 2);
                    player.skillUsed = true;
                    events.push({
                        type: 'skill',
                        name: '苦肉',
                        player: playerId,
                        description: `${player.general.name}发动【苦肉】，失去1点生命摸2张牌`,
                        hp: player.hp
                    });
                } else {
                    return { success: false, reason: 'insufficient_hp' };
                }
                break;

            case '奸雄':
                // 奸雄：出牌阶段，可获得弃牌堆中的一张牌（简化：摸1张牌）
                this.drawCards(player, 1);
                player.skillUsed = true;
                events.push({
                    type: 'skill',
                    name: '奸雄',
                    player: playerId,
                    description: `${player.general.name}发动【奸雄】，摸1张牌`
                });
                break;

            case '反击':
                // 反击：出牌阶段，可令一名其他角色弃置一张手牌（每回合限一次）
                if (targetId === null) {
                    // 如果没有指定目标，返回可选目标列表
                    const aliveEnemies = GameState.players.filter(p => !p.isDead && p.id !== playerId && p.hand.length > 0);
                    if (aliveEnemies.length === 0) {
                        return { success: false, reason: 'no_valid_target' };
                    }
                    return { success: false, reason: 'need_target', targets: aliveEnemies.map(p => p.id), skillName: '反击' };
                }

                const targetForDiscard = GameState.players[targetId];
                if (!targetForDiscard || targetForDiscard.isDead || targetForDiscard.id === playerId) {
                    return { success: false, reason: 'invalid_target' };
                }
                if (targetForDiscard.hand.length === 0) {
                    return { success: false, reason: 'target_no_cards' };
                }

                const discardIdx = Math.floor(Math.random() * targetForDiscard.hand.length);
                targetForDiscard.hand.splice(discardIdx, 1);
                player.skillUsed = true;
                events.push({
                    type: 'skill',
                    name: '反击',
                    player: playerId,
                    description: `${player.general.name}发动【反击】，令${targetForDiscard.general.name}弃置1张牌`
                });
                break;

            case '龙胆':
                // 龙胆：出牌阶段，需要先选中手牌中的【杀】或【闪】，点击技能后自动转换
                // 该技能需要配合选中的手牌使用，在这里只做检查
                // 实际转换逻辑在 useLongdanSkill 方法中
                const shaCards = player.hand.filter(c => c === '杀');
                const shanCards = player.hand.filter(c => c === '闪');

                if (shaCards.length === 0 && shanCards.length === 0) {
                    return { success: false, reason: 'no_convertible_cards' };
                }

                // 返回需要选择手牌的提示
                return {
                    success: false,
                    reason: 'need_card_selection',
                    message: '请先选中手牌中的【杀】或【闪】，再点击龙胆技能'
                };
                break;

            case '急救':
                // 急救：出牌阶段，可回复1点生命（每回合限一次）
                if (player.hp < player.maxHp) {
                    player.hp++;
                    player.skillUsed = true;
                    player.stats.healed += 1;
                    events.push({
                        type: 'skill',
                        name: '急救',
                        player: playerId,
                        description: `${player.general.name}发动【急救】，回复1点生命`,
                        hp: player.hp
                    });
                } else {
                    return { success: false, reason: 'already_full_hp' };
                }
                break;

            case '狂暴':
                // 狂暴：主动激活，下一次使用【杀】时伤害+1
                player.berserkActive = true;
                player.skillUsed = true;
                events.push({
                    type: 'skill',
                    name: '狂暴',
                    player: playerId,
                    description: `${player.general.name}发动【狂暴】，下次【杀】伤害+1`
                });
                break;

            case '色诱':
                // 色诱：出牌阶段，可指定一名其他角色，获得其一张手牌（每回合限一次）
                if (targetId === null) {
                    // 如果没有指定目标，返回可选目标列表
                    const aliveEnemies = GameState.players.filter(p => !p.isDead && p.id !== playerId && p.hand.length > 0);
                    if (aliveEnemies.length === 0) {
                        return { success: false, reason: 'no_valid_target' };
                    }
                    return { success: false, reason: 'need_target', targets: aliveEnemies.map(p => p.id), skillName: '色诱' };
                }

                const targetForSeduction = GameState.players[targetId];
                if (!targetForSeduction || targetForSeduction.isDead || targetForSeduction.id === playerId) {
                    return { success: false, reason: 'invalid_target' };
                }

                if (targetForSeduction.hand.length === 0) {
                    return { success: false, reason: 'target_no_cards' };
                }

                // 随机抽取目标的一张手牌，交给使用者
                const stealIdx = Math.floor(Math.random() * targetForSeduction.hand.length);
                const stolenCard = targetForSeduction.hand.splice(stealIdx, 1)[0];
                player.hand.push(stolenCard);

                player.skillUsed = true;
                events.push({
                    type: 'skill',
                    name: '色诱',
                    player: playerId,
                    description: `${player.general.name}发动【色诱】，获得了${targetForSeduction.general.name}一张手牌`
                });
                break;

            case '营救':
                // 营救：出牌阶段，可指定一名其他角色摸1张牌（每回合限一次）
                if (targetId === null) {
                    // 如果没有指定目标，返回可选目标列表
                    const aliveOthers = GameState.players.filter(p => !p.isDead && p.id !== playerId);
                    if (aliveOthers.length === 0) {
                        return { success: false, reason: 'no_valid_target' };
                    }
                    return { success: false, reason: 'need_target', targets: aliveOthers.map(p => p.id), skillName: '营救' };
                }

                const targetForRescue = GameState.players[targetId];
                if (!targetForRescue || targetForRescue.isDead || targetForRescue.id === playerId) {
                    return { success: false, reason: 'invalid_target' };
                }

                this.drawCards(targetForRescue, 1);
                player.skillUsed = true;
                events.push({
                    type: 'skill',
                    name: '营救',
                    player: playerId,
                    description: `${player.general.name}发动【营救】，${targetForRescue.general.name}摸1张牌`,
                    hp: targetForRescue.hp
                });
                break;

            default:
                return { success: false, reason: 'skill_not_found' };
        }

        // 统计技能使用
        player.stats.skillsUsed += 1;
        return { success: true, events };
    },

    // 检查玩家是否可以使用技能
    canUseSkill(playerId) {
        const player = GameState.players[playerId];
        if (!player || player.isDead) return false;
        if (GameState.currentTurnIndex !== playerId) return false;
        if (player.skillUsed) return false;
        if (!player.general || !player.general.skill) return false;
        return true;
    },

    // 获取技能信息
    getSkillInfo(playerId) {
        const player = GameState.players[playerId];
        if (!player || !player.general) return null;
        return {
            name: player.general.skill,
            description: player.general.skillDesc,
            canUse: this.canUseSkill(playerId)
        };
    }
};

export { Game, GameState };
export default Game;
