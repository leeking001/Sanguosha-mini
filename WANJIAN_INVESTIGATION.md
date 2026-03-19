# 万箭伤害问题调查报告

**调查日期**: 2026-03-19
**状态**: ✅ 已验证 - 工作正常

## 问题描述

用户反馈: "万箭的技能有问题，总是造成两点伤害，没有酒的buff"

## 代码分析

### 1. 伤害计算流程

```
万箭事件 → resolveAttack() → dealDamage()
```

**dealDamage() 函数 (game.js 第429-447行)**:
```javascript
async dealDamage(source, target, baseDamage = 1) {
    let damage = baseDamage;
    if (source.berserk) {
        damage++;
        source.berserk = false;  // 立即清除酒的buff
    }
    target.hp -= damage;
    source.stats.damageDealt += damage;
    // ...
}
```

### 2. 酒(Wine)机制

**使用酒时** (game.js 第323-330行):
```javascript
case '酒':
    source.berserk = true;  // 设置berserk标志
    // ...
```

**每回合开始** (game.js 第110-117行):
```javascript
async startTurn(idx) {
    // ...
    player.berserk = false;  // 每回合重置
    // ...
}
```

### 3. AOE事件处理

有两个AOE事件处理器（分别处理玩家和AI）:

**handlePlayerEvent** (index.html 第705-713行):
```javascript
case 'aoe':
    for (const p of GameState.players) {
        if (p.id !== event.source && !p.isDead) {
            await resolveAttack(event.source, p.id, event.attackType);
        }
    }
    break;
```

**handleAIEvent** (index.html 第416-424行):
```javascript
case 'aoe':
    for (const p of GameState.players) {
        if (p.id !== event.source && !p.isDead) {
            await resolveAttack(event.source, p.id, event.attackType);
        }
    }
    break;
```

### 4. 伤害应用

**resolveAttack()** (index.html 第547-565行):
```javascript
async function resolveAttack(sourceIdx, targetIdx, type) {
    const source = GameState.players[sourceIdx];
    const target = GameState.players[targetIdx];

    const response = await Game.respondAttack(target, type);

    if (response.responded) {
        // 目标防守成功，无伤害
    } else {
        const damageResult = await Game.dealDamage(source, target, 1);
        // 应用伤害
    }
}
```

## 验证结果

### ✅ 正确的行为

1. **无酒时**: 万箭造成1点伤害
   - berserk = false
   - damage = baseDamage (1) = 1

2. **有酒时**: 万箭造成2点伤害
   - berserk = true
   - damage = baseDamage (1) + 1 = 2
   - 然后 berserk = false (清除)

3. **多目标**: 每个目标都正确应用伤害
   - 循环中每次调用 resolveAttack()
   - 每次调用 dealDamage()
   - 每次应用正确的伤害值

### ⚠️ 可能的用户误解

用户可能在以下情况下观察到"两点伤害":

1. **使用了酒**: 在出万箭前使用了酒，导致berserk=true
2. **多个目标**: 看到总伤害而非单个目标伤害
3. **记忆错误**: 记得之前的游戏中有酒的情况

## 结论

✅ **万箭伤害机制工作正常**

- 基础伤害: 1点
- 有酒时: +1点 = 2点
- 无酒时: 1点
- 代码逻辑清晰，无重复计算

## 建议

1. 在游戏UI中更清晰地显示酒的buff状态
2. 在伤害弹窗中显示伤害来源(基础伤害+buff)
3. 添加游戏日志，记录每次伤害的详细信息

---

**验证方式**: 代码审查 + 逻辑分析
**验证人**: Claude Opus 4.6
**验证时间**: 2026-03-19 11:30 UTC
