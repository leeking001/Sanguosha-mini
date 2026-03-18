// AI逻辑模块 - AI决策、出牌策略

import { CardUtils } from './cards.js';
import { Game, GameState } from './game.js';

// AI策略对象
const AI = {
    // 判断目标身份
    analyzeTargetRole(ai, target) {
        // 如果身份已知，直接返回
        if (target.identityKnown) {
            return target.role;
        }
        
        // 根据游戏行为推断（简化版）
        return 'unknown';
    },

    // 获取敌对目标
    getEnemyTarget(ai, players) {
        const alive = players.filter(p => !p.isDead && p !== ai);
        let target = null;

        switch (ai.role) {
            case '反贼':
                // 优先攻击已知的忠臣，最后才打主公
                target = alive.find(p => p.identityKnown && p.role === '忠臣');
                if (!target) {
                    // 其次攻击已知的内奸
                    target = alive.find(p => p.identityKnown && p.role === '内奸');
                }
                if (!target) {
                    // 最后才攻击主公 - 不要上来就集火主公
                    target = alive.find(p => p.role === '主公');
                }
                break;
                
            case '忠臣':
                // 攻击已知的反贼 - 绝对不攻击主公
                target = alive.find(p => p.identityKnown && p.role === '反贼');
                break;
                
            case '主公':
                // 攻击已知的反贼或内奸
                target = alive.find(p => p.identityKnown && (p.role === '反贼' || p.role === '内奸'));
                break;
                
            case '内奸':
                // 内奸策略：平衡局势，优先攻击已知忠臣，最后才打主公
                const rebels = alive.filter(p => p.identityKnown && p.role === '忠臣');
                const lords = alive.filter(p => p.role === '主公');
                
                if (rebels.length > 0) {
                    target = alive.find(p => p.role === '忠臣');
                } else {
                    // 只有主公了才打主公
                    target = alive.find(p => p.role === '主公');
                }
                break;
        }

        // 如果没有明确目标，随机选择
        if (!target && alive.length > 0) {
            target = alive[Math.floor(Math.random() * alive.length)];
        }

        return target;
    },

    // 获取友方目标（用于辅助）
    getAllyTarget(ai, players) {
        const alive = players.filter(p => !p.isDead && p !== ai);
        
        switch (ai.role) {
            case '主公':
                return alive.find(p => p.role === '忠臣');
            case '忠臣':
                return alive.find(p => p.role === '主公');
            case '反贼':
                return alive.find(p => p.role === '反贼');
            default:
                return null;
        }
    },

    // AI回合行动
    async takeTurn(ai, game) {
        const events = [];
        
        if (ai.isDead || !GameState.gameActive) {
            return { success: false, reason: 'cannot_act' };
        }

        // 1. 使用无中生有
        const wuzhongIdx = ai.hand.indexOf('幸运');
        if (wuzhongIdx !== -1) {
            const result = await game.useCard(ai.id, wuzhongIdx, null);
            events.push(...result.events);
        }

        // 2. 使用五谷丰登
        const wuguIdx = ai.hand.indexOf('丰收');
        if (wuguIdx !== -1) {
            const result = await game.useCard(ai.id, wuguIdx, null);
            events.push(...result.events);
        }

        // 3. 使用桃回复
        while (ai.hp < ai.maxHp && ai.hand.includes('药')) {
            const taoIdx = ai.hand.indexOf('药');
            const result = await game.useCard(ai.id, taoIdx, ai);
            events.push(...result.events);
        }

        // 4. 使用酒回复或增益
        const jiuIdx = ai.hand.indexOf('怒');
        if (jiuIdx !== -1 && ai.hp < ai.maxHp) {
            const result = await game.useCard(ai.id, jiuIdx, ai);
            events.push(...result.events);
        }

        // 获取攻击目标
        const target = this.getEnemyTarget(ai, GameState.players);

        if (target && !target.isDead) {
            // 5. 使用乐不思蜀
            const lebuIdx = ai.hand.indexOf('迷惑');
            if (lebuIdx !== -1 && !target.lebu) {
                const result = await game.useCard(ai.id, lebuIdx, target);
                events.push(...result.events);
            }

            // 6. 使用顺手牵羊
            const shunshouIdx = ai.hand.indexOf('偷袭');
            if (shunshouIdx !== -1 && target.hand.length > 0) {
                const result = await game.useCard(ai.id, shunshouIdx, target);
                events.push(...result.events);
            }

            // 7. 使用过河拆桥
            const chaiqiaoIdx = ai.hand.indexOf('破坏');
            if (chaiqiaoIdx !== -1 && target.hand.length > 0) {
                const result = await game.useCard(ai.id, chaiqiaoIdx, target);
                events.push(...result.events);
            }

            // 8. 使用决斗
            const juedouIdx = ai.hand.indexOf('单挑');
            if (juedouIdx !== -1) {
                // 评估是否适合决斗（目标手牌少时更有利）
                if (target.hand.length <= 2 || ai.hand.filter(c => c === '斩').length >= 2) {
                    const result = await game.useCard(ai.id, juedouIdx, target);
                    events.push(...result.events);
                    // 注意：决斗的具体处理由 handleAIEvent 统一处理
                }
            }

            // 9. 使用铁索连环
            const tiesuoIdx = ai.hand.indexOf('锁链');
            if (tiesuoIdx !== -1) {
                const aliveOthers = GameState.players.filter(p => !p.isDead && p !== ai);
                if (aliveOthers.length >= 2) {
                    // 选择两个目标
                    const t1 = target;
                    const t2 = aliveOthers.find(p => p !== t1) || aliveOthers[0];
                    const result = await game.useCard(ai.id, tiesuoIdx, [t1, t2]);
                    events.push(...result.events);
                }
            }

            // 10. 使用杀
            const shaIdx = ai.hand.indexOf('斩');
            if (shaIdx !== -1) {
                if (!ai.hasAttacked || ai.general.name === '狂战勇士') {
                    const result = await game.useCard(ai.id, shaIdx, target);
                    events.push(...result.events);
                    // 注意：攻击响应和伤害处理由 handleAIEvent 的 resolveAttack 统一处理
                }
            }
        }

        // 11. 使用AOE（如果有且不会伤害友军太多）
        const wanjianIdx = ai.hand.indexOf('箭雨');
        if (wanjianIdx !== -1) {
            const result = await this.evaluateAndUseAOE(ai, wanjianIdx, '箭雨', game);
            if (result) events.push(...result.events);
        }

        const nanmanIdx = ai.hand.indexOf('兽潮');
        if (nanmanIdx !== -1) {
            const result = await this.evaluateAndUseAOE(ai, nanmanIdx, '兽潮', game);
            if (result) events.push(...result.events);
        }

        return { success: true, events };
    },

    // 评估并使用AOE
    async evaluateAndUseAOE(ai, cardIdx, cardType, game) {
        const others = GameState.players.filter(p => !p.isDead && p !== ai);

        // 计算友军和敌军
        let allies = 0;
        let enemies = 0;

        for (const p of others) {
            if (this.isAlly(ai, p)) {
                allies++;
            } else {
                enemies++;
            }
        }

        // 如果敌军多于友军，使用AOE
        if (enemies > allies) {
            const result = await game.useCard(ai.id, cardIdx, null);
            // 注意：AOE的攻击响应和伤害处理由 handleAIEvent 统一处理
            return { success: true, events: result.events };
        }

        return null;
    },

    // 判断是否为友军
    isAlly(ai, target) {
        if (target.identityKnown) {
            if (ai.role === '主公') return target.role === '忠臣';
            if (ai.role === '忠臣') return target.role === '主公' || target.role === '忠臣';
            if (ai.role === '反贼') return target.role === '反贼';
        }
        return false;
    },

    // 获取AI行动延迟（用于模拟思考时间）
    getActionDelay() {
        return 500 + Math.random() * 500;
    },

    // AI技能使用决策
    shouldUseSkill(ai, skillName, context = {}) {
        switch (skillName) {
            case '苦肉':
                // 苦肉战将：血量大于1且手牌较少时使用
                return ai.hp > 1 && ai.hand.length < 3;
                
            case '制衡':
                // 制衡帝王：手牌质量较低时使用
                return ai.hand.length > 0 && ai.hand.filter(c => c === '躲').length > 1;
                
            case '裸衣':
                // 许褚：总是使用（摸牌阶段自动触发）
                return true;
                
            default:
                return false;
        }
    },

    // AI卡牌使用优先级
    getCardPriority(card, ai, target) {
        const priorities = {
            '幸运': 100,    // 优先过牌
            '丰收': 90,     // 团队增益
            '药': 80,       // 生存优先
            '怒': 70,       // 增益/回复
            '偷袭': 60,     // 干扰敌方
            '破坏': 55,     // 干扰敌方
            '迷惑': 50,     // 控制
            '单挑': 45,     // 输出
            '斩': 40,       // 基础输出
            '锁链': 35,     // 连锁
            '火攻': 30,     // 输出
            '箭雨': 25,     // AOE
            '兽潮': 25,     // AOE
            '躲': 0         // 防御牌不出
        };
        
        return priorities[card] || 10;
    },

    // 选择最佳卡牌
    selectBestCard(ai, target) {
        let bestIdx = -1;
        let bestPriority = -1;
        
        for (let i = 0; i < ai.hand.length; i++) {
            const card = ai.hand[i];
            const priority = this.getCardPriority(card, ai, target);
            
            if (priority > bestPriority) {
                bestPriority = priority;
                bestIdx = i;
            }
        }
        
        return bestIdx;
    },

    // AI响应请求（如求桃）
    shouldRespond(ai, requestType, target) {
        switch (requestType) {
            case 'tao':
                // 是否出桃救人
                if (ai.hand.includes('药')) {
                    // 友军优先救
                    if (this.isAlly(ai, target)) {
                        return true;
                    }
                    // 主公身份暴露后，反贼可能救内奸以平衡局势
                    if (ai.role === '反贼' && target.role === '内奸') {
                        return Math.random() > 0.5;
                    }
                }
                return false;
                
            case 'wuxie':
                // 是否无懈可击（简化版，暂不支持）
                return false;
                
            default:
                return false;
        }
    }
};

// 导出
export { AI };
export default AI;
