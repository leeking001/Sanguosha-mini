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
                if (!target) {
                    // 如果没有已知的反贼，攻击未知身份的角色
                    target = alive.find(p => !p.identityKnown && p.role !== '主公');
                }
                if (!target) {
                    // 如果全是主公，就不出手
                    return null;
                }
                break;
                
            case '主公':
                // 攻击已知的反贼或内奸
                target = alive.find(p => p.identityKnown && (p.role === '反贼' || p.role === '内奸'));
                break;
                
            case '内奸':
                // 内奸策略：早期帮主公杀反贼，后期再杀忠臣
                // 目标是成为最后与主公单挑的人
                const aliveRebels = alive.filter(p => p.identityKnown && p.role === '反贼');
                const aliveLoyals = alive.filter(p => p.identityKnown && p.role === '忠臣');
                const aliveLord = alive.find(p => p.role === '主公');

                if (aliveRebels.length > 0) {
                    // 优先攻击反贼（帮主公）
                    target = aliveRebels[Math.floor(Math.random() * aliveRebels.length)];
                } else if (aliveLoyals.length > 0) {
                    // 反贼死光后，攻击忠臣
                    target = aliveLoyals[Math.floor(Math.random() * aliveLoyals.length)];
                } else if (aliveLord) {
                    // 只剩主公了，攻击主公
                    target = aliveLord;
                }
                break;
        }

        // 如果没有明确目标，随机选择（忠臣不能攻击主公）
        if (!target && alive.length > 0) {
            if (ai.role === '忠臣') {
                // 忠臣只能攻击反贼或内奸
                const validTargets = alive.filter(p => p.role !== '主公');
                target = validTargets.length > 0 ? validTargets[Math.floor(Math.random() * validTargets.length)] : null;
            } else {
                target = alive[Math.floor(Math.random() * alive.length)];
            }
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

        // 0. 使用主动技能（如果有利）
        const skillResult = this.shouldUseActiveSkill(ai, game);
        if (skillResult) {
            let useSkillResult = game.useActiveSkill(ai.id);

            // 如果技能需要目标，AI自动选择一个目标
            if (!useSkillResult.success && useSkillResult.reason === 'need_target') {
                const targets = useSkillResult.targets;
                if (targets && targets.length > 0) {
                    // 选择一个敌方目标
                    let targetId = null;
                    for (const tid of targets) {
                        const t = GameState.players[tid];
                        if (t && !this.isAlly(ai, t)) {
                            targetId = tid;
                            break;
                        }
                    }
                    // 如果没有敌方，选第一个
                    if (targetId === null) {
                        targetId = targets[0];
                    }
                    // 再次调用技能，这次带上目标
                    useSkillResult = game.useActiveSkill(ai.id, targetId);
                }
            }

            if (useSkillResult.success) {
                events.push(...useSkillResult.events);
            }
        }

        // 1. 使用无中生有
        const wuzhongIdx = ai.hand.indexOf('无中');
        if (wuzhongIdx !== -1) {
            const result = await game.useCard(ai.id, wuzhongIdx, null);
            events.push(...result.events);
        }

        // 2. 使用五谷丰登
        const wuguIdx = ai.hand.indexOf('五谷');
        if (wuguIdx !== -1) {
            const result = await game.useCard(ai.id, wuguIdx, null);
            events.push(...result.events);
        }

        // 3. 使用桃回复
        while (ai.hp < ai.maxHp && ai.hand.includes('桃')) {
            const taoIdx = ai.hand.indexOf('桃');
            const result = await game.useCard(ai.id, taoIdx, ai);
            events.push(...result.events);
        }

        // 4. 使用酒回复或增益
        const jiuIdx = ai.hand.indexOf('酒');
        if (jiuIdx !== -1 && ai.hp < ai.maxHp) {
            const result = await game.useCard(ai.id, jiuIdx, ai);
            events.push(...result.events);
        }

        // 获取攻击目标
        const target = this.getEnemyTarget(ai, GameState.players);

        if (target && !target.isDead) {
            // 5. 使用乐不思蜀
            const lebuIdx = ai.hand.indexOf('乐不');
            if (lebuIdx !== -1 && !target.lebu) {
                const result = await game.useCard(ai.id, lebuIdx, target);
                events.push(...result.events);
            }

            // 6. 使用顺手牵羊
            const shunshouIdx = ai.hand.indexOf('顺手');
            if (shunshouIdx !== -1 && target.hand.length > 0) {
                const result = await game.useCard(ai.id, shunshouIdx, target);
                events.push(...result.events);
            }

            // 7. 使用过河拆桥
            const chaiqiaoIdx = ai.hand.indexOf('拆桥');
            if (chaiqiaoIdx !== -1 && target.hand.length > 0) {
                const result = await game.useCard(ai.id, chaiqiaoIdx, target);
                events.push(...result.events);
            }

            // 8. 使用决斗
            const juedouIdx = ai.hand.indexOf('决斗');
            if (juedouIdx !== -1) {
                // 评估是否适合决斗
                // 决斗中被挑战方先出杀，所以需要确保我方杀比对方多
                const myShaCount = ai.hand.filter(c => c === '杀').length;
                const targetShaEstimate = Math.min(target.hand.length, 2); // 估计对方大约有2张杀

                // 只有当我方杀数量明显多于对方时才发起决斗
                if (myShaCount >= targetShaEstimate + 1 || target.hand.length <= 1) {
                    const result = await game.useCard(ai.id, juedouIdx, target);
                    events.push(...result.events);
                    // 注意：决斗的具体处理由 handleAIEvent 统一处理
                }
            }

            // 9. 使用铁索连环
            const tiesuoIdx = ai.hand.indexOf('铁索');
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
            const shaIdx = ai.hand.indexOf('杀');
            if (shaIdx !== -1) {
                if (!ai.hasAttacked || ai.general.skill === '无双') {
                    const result = await game.useCard(ai.id, shaIdx, target);
                    events.push(...result.events);
                    // 注意：攻击响应和伤害处理由 handleAIEvent 的 resolveAttack 统一处理
                }
            }
        }

        // 11. 使用AOE（如果有且不会伤害友军太多）
        const wanjianIdx = ai.hand.indexOf('万箭');
        if (wanjianIdx !== -1) {
            const result = await this.evaluateAndUseAOE(ai, wanjianIdx, '万箭', game);
            if (result) events.push(...result.events);
        }

        const nanmanIdx = ai.hand.indexOf('南蛮');
        if (nanmanIdx !== -1) {
            const result = await this.evaluateAndUseAOE(ai, nanmanIdx, '南蛮', game);
            if (result) events.push(...result.events);
        }

        return { success: true, events };
    },

    // 评估AI是否应该使用主动技能
    shouldUseActiveSkill(ai, game) {
        if (ai.skillUsed || !ai.general || !ai.general.skill) return false;

        const skill = ai.general.skill;

        switch (skill) {
            case '仁德':
                // 仁德：如果手牌数接近上限，先摸牌（出牌阶段开始时触发）
                return ai.hand.length < ai.hp - 1;

            case '无双':
                // 无双：如果有杀，先使用技能让杀无限制
                return ai.hand.includes('杀');

            case '制衡':
                // 制衡：如果手牌过多，可以用技能换牌
                return ai.hand.length > ai.hp + 2;

            case '苦肉':
                // 苦肉：如果需要更多手牌且生命值充足，使用技能
                return ai.hp > 1 && ai.hand.length < ai.hp + 1;

            case '奸雄':
                // 奸雄：手牌少时使用
                return ai.hand.length < ai.hp - 1;

            case '反击':
                // 反击：如果有敌人且他们有牌，就使用
                const enemies = GameState.players.filter(p => !p.isDead && p.id !== ai.id && p.hand.length > 0);
                return enemies.length > 0;

            case '龙胆':
                // 龙胆：如果有杀或闪，就使用
                return ai.hand.includes('杀') || ai.hand.includes('闪');

            case '神医':
                // 神医：如果有受伤的队友，就治疗
                const aliveOthers = GameState.players.filter(p => !p.isDead && p.id !== ai.id);
                const injuredAlly = aliveOthers.find(p => p.hp < p.maxHp && this.isAlly(ai, p));
                return injuredAlly !== undefined;

            case '苦肉':
                // 苦肉：如果需要更多手牌且生命值充足，使用技能
                return ai.hp > 1 && ai.hand.length < ai.hp + 1;

            case '色诱':
                // 色诱：如果有敌人且他们手牌多，就使用
                const seductionEnemies = GameState.players.filter(p => !p.isDead && p.id !== ai.id && p.hand.length > 0);
                return seductionEnemies.length > 0 && seductionEnemies.some(e => e.hand.length >= 3);

            case '营救':
                // 营救：如果有队友血量少或手牌少，就救他们
                const aliveAllies = GameState.players.filter(p => !p.isDead && p.id !== ai.id && this.isAlly(ai, p));
                return aliveAllies.some(a => a.hp <= 2 || a.hand.length < 2);

            case '狂暴':
                // 狂暴：手牌少时使用
                return ai.hand.length < ai.hp - 1;

            case '挑衅':
                // 挑衅：被动技能，不需要主动使用
                return false;

            case '坚守':
                // 坚守：防御技能，血量少时使用
                return ai.hp <= 2;

            default:
                return false;
        }
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
                return ai.hand.length > 0 && ai.hand.filter(c => c === '闪').length > 1;
                
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
            '无中': 100,    // 优先过牌
            '五谷': 90,     // 团队增益
            '桃': 80,       // 生存优先
            '酒': 70,       // 增益/回复
            '顺手': 60,     // 干扰敌方
            '拆桥': 55,     // 干扰敌方
            '乐不': 50,     // 控制
            '决斗': 45,     // 输出
            '杀': 40,       // 基础输出
            '铁索': 35,     // 连锁
            '火攻': 30,     // 输出
            '万箭': 25,     // AOE
            '南蛮': 25,     // AOE
            '闪': 0         // 防御牌不出
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
                if (ai.hand.includes('桃')) {
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
