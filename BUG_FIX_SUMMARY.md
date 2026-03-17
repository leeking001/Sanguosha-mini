# 三国杀Mini游戏 - Bug修复总结

## 🐛 问题描述
部分卡牌造成**多次扣血**的bug，导致同一次攻击造成重复伤害。

## 🔍 根本原因分析

### 问题1：普通【杀】卡牌重复扣血
**位置**：`ai.js` 第176-193行

**原因**：
1. AI使用【杀】时，在 `ai.js` 中调用 `game.useCard()` 返回 `attack` 事件
2. 然后 AI 逻辑又**手动调用** `game.respondAttack()` 和 `game.dealDamage()`
3. 这些事件被添加到 events 数组并返回
4. `index.html` 的 `handleAIEvent()` 收到 `attack` 事件后，**再次调用** `resolveAttack()`
5. `resolveAttack()` 又会调用 `game.respondAttack()` 和 `game.dealDamage()`
6. **结果**：造成了双倍伤害！

**修复**：删除 AI 逻辑中的重复处理，只返回 `attack` 事件，让统一的事件处理器处理伤害。

### 问题2：AOE卡牌（万箭齐发、南蛮入侵）重复扣血
**位置**：`ai.js` 第214-251行 `evaluateAndUseAOE()` 函数

**原因**：同样的双重处理问题
1. AI 在 `evaluateAndUseAOE()` 中手动遍历所有玩家并处理攻击响应和伤害
2. `handleAIEvent()` 收到 `aoe` 事件后又遍历一次所有玩家处理伤害
3. **结果**：每个玩家受到双倍伤害！

**修复**：简化 `evaluateAndUseAOE()`，只返回 `aoe` 事件，删除手动伤害处理。

### 问题3：决斗卡牌可能的重复处理
**位置**：`ai.js` 第147-161行

**原因**：类似问题，在 AI 逻辑中提前调用了 `resolveDuel()`

**修复**：删除提前调用，让事件处理器统一处理。

## ✅ 修复内容

### 1. 修复 `ai.js` - 删除重复的伤害处理

#### 1.1 修复【杀】卡牌（第176-183行）
```javascript
// 修复前：
const result = await game.useCard(ai.id, shaIdx, target);
events.push(...result.events);

if (result.events.find(e => e.type === 'attack')) {
    const response = await game.respondAttack(target, 'sha');
    events.push(response);

    if (!response.responded) {
        const damageResult = await game.dealDamage(ai, target, 1);  // ❌ 重复
        events.push(...damageResult.events);
    }
}

// 修复后：
const result = await game.useCard(ai.id, shaIdx, target);
events.push(...result.events);
// 攻击响应和伤害处理由 handleAIEvent 的 resolveAttack 统一处理 ✅
```

#### 1.2 修复 AOE 卡牌（第214-251行）
```javascript
// 修复前：
const result = await game.useCard(ai.id, cardIdx, null);

const aoeEvents = [...result.events];
for (const p of others) {
    const attackType = cardType === '万箭' ? 'wanjian' : 'nanman';
    const response = await game.respondAttack(p, attackType);
    aoeEvents.push(response);

    if (!response.responded) {
        const damageResult = await game.dealDamage(ai, p, 1);  // ❌ 重复
        aoeEvents.push(...damageResult.events);
    }
}
return { success: true, events: aoeEvents };

// 修复后：
const result = await game.useCard(ai.id, cardIdx, null);
// AOE的攻击响应和伤害处理由 handleAIEvent 统一处理 ✅
return { success: true, events: result.events };
```

#### 1.3 修复决斗卡牌（第147-161行）
```javascript
// 修复前：
const result = await game.useCard(ai.id, juedouIdx, target);
events.push(...result.events);

if (result.events.find(e => e.type === 'duel')) {
    const duelResult = await game.resolveDuel(ai, target);  // ❌ 重复
    events.push(...duelResult.events);
}

// 修复后：
const result = await game.useCard(ai.id, juedouIdx, target);
events.push(...result.events);
// 决斗的具体处理由 handleAIEvent 统一处理 ✅
```

### 2. 完善 `game.js` - 添加缺失卡牌的处理

#### 2.1 在 `useCard()` 中添加缺失卡牌（第225-287行）
新增以下卡牌的事件生成：
- **顺手牵羊**：返回 `steal` 事件
- **过河拆桥**：返回 `discard` 事件
- **决斗**：返回 `duel` 事件
- **火攻**：返回 `fire_attack` 事件
- **铁索连环**：返回 `chain` 事件

#### 2.2 修复 AOE 卡牌的 attackType（第249-253行）
```javascript
// 修复前：
case '万箭':
case '南蛮':
    events.push({ type: 'aoe', card, source: sourceIdx });
    break;

// 修复后：
case '万箭':
case '南蛮':
    const attackType = card === '万箭' ? 'wanjian' : 'nanman';
    events.push({ type: 'aoe', card, source: sourceIdx, attackType });  // ✅ 添加 attackType
    break;
```

#### 2.3 修复铁索连环的目标选择（第207-231行）
```javascript
// 修复前：
if (GameState.pendingChainTargets.length < 2) {
    return { success: true, action: 'chain_select', selected: GameState.pendingChainTargets };
}
// 没有正确处理选择完成的情况 ❌

// 修复后：
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
        chainTargets  // ✅ 返回两个目标
    };
}
```

## 🎯 设计原则

修复遵循了以下设计原则：

1. **单一职责**：AI 逻辑只负责决策出牌，不负责处理伤害
2. **统一处理**：所有伤害处理统一由 `index.html` 的事件处理器完成
3. **事件驱动**：使用事件系统传递信息，避免直接调用
4. **避免重复**：删除所有重复的伤害计算逻辑

## 📋 事件处理流程（修复后）

```
AI决策出牌
    ↓
调用 game.useCard()
    ↓
生成事件（attack/aoe/duel等）
    ↓
返回事件数组到 AI.takeTurn()
    ↓
aiTurn() 遍历事件数组
    ↓
handleAIEvent() 处理每个事件
    ↓
根据事件类型调用对应处理函数
    ↓
resolveAttack() / resolveDuel() 等
    ↓
调用 game.respondAttack()
    ↓
如果未响应，调用 game.dealDamage()
    ↓
✅ 单次伤害结算完成
```

## 🧪 测试建议

1. **普通攻击测试**：AI使用【杀】攻击玩家，验证只扣血一次
2. **AOE测试**：AI使用【万箭齐发】或【南蛮入侵】，验证每个目标只扣血一次
3. **决斗测试**：AI使用【决斗】，验证伤害正常
4. **连锁攻击测试**：测试铁索连环是否正常工作
5. **多回合测试**：进行多回合游戏，确保没有累积性bug

## 📝 后续优化建议

1. 实现 `resolveDuel()` 和 `resolveFireAttack()` 的完整逻辑
2. 添加单元测试覆盖卡牌效果
3. 考虑使用 TypeScript 增强类型安全
4. 添加事件日志系统用于调试
5. 实现回放功能以便复现bug

## ✨ 修复日期
2026-03-17

## 🎮 测试状态
- [ ] 基础攻击测试
- [ ] AOE卡牌测试
- [ ] 决斗测试
- [ ] 铁索连环测试
- [ ] 完整游戏流程测试
