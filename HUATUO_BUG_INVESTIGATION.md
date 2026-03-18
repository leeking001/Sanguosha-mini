# 华佗3倍伤害Bug调查

## 问题描述
华佗使用杀和南蛮后，被施放者掉了3滴血（应该只掉1滴）

## 可能原因假设

### 假设1：dealDamage 被调用了3次
如果每个目标都受到3点伤害，可能是伤害计算被重复调用。

**检查点**：
- resolveAttack() 被调用次数
- dealDamage() 被调用次数
- damage 事件被处理次数

### 假设2：伤害值计算错误
dealDamage() 中的伤害计算有问题：
```javascript
let damage = baseDamage;
if (source.berserk) damage++;
```

可能的问题：
- berserk 状态没有正确清除？
- baseDamage 参数传入错误？

### 假设3：AOE循环问题
南蛮入侵的循环可能有问题：
```javascript
for (const p of GameState.players) {
    if (p.id !== event.source && !p.isDead) {
        await resolveAttack(event.source, p.id, event.attackType);
    }
}
```

可能的问题：
- 循环执行了多次？
- GameState.players 数组异常？

### 假设4：华佗特定bug
华佗的ID或将军数据有问题，导致某种特殊情况。

## 调查步骤

### 步骤1：确认问题范围
需要确认：
1. 是每个被攻击的玩家都掉3滴血？还是只有某个玩家掉3滴血？
2. 是南蛮入侵每个目标掉3滴？还是使用杀也会造成3倍伤害？
3. 是只有华佗有这个问题？还是其他武将也有？
4. 是作为AI时有问题？还是作为玩家时也有问题？

### 步骤2：添加Debug日志
在关键位置添加 console.log：

```javascript
// game.js - dealDamage
async dealDamage(source, target, baseDamage = 1) {
    console.log(`[DEBUG] dealDamage called: source=${source.general.name}, target=${target.general.name}, baseDamage=${baseDamage}, berserk=${source.berserk}`);
    let damage = baseDamage;
    if (source.berserk) damage++;
    console.log(`[DEBUG] Final damage=${damage}, target HP before=${target.hp}`);
    target.hp -= damage;
    console.log(`[DEBUG] target HP after=${target.hp}`);
    // ...
}

// index.html - resolveAttack
async function resolveAttack(sourceIdx, targetIdx, type) {
    console.log(`[DEBUG] resolveAttack called: source=${sourceIdx}, target=${targetIdx}, type=${type}`);
    const source = GameState.players[sourceIdx];
    const target = GameState.players[targetIdx];
    // ...
}

// index.html - handleAIEvent aoe
case 'aoe':
    console.log(`[DEBUG] AOE event: source=${event.source}, card=${event.card}`);
    UI.log(`${getPlayerName(event.source)} 释放【${event.card}】`, 'skill');
    AudioSystem.SFX.aoe();
    console.log(`[DEBUG] Players count=${GameState.players.length}`);
    for (const p of GameState.players) {
        console.log(`[DEBUG] Checking player: id=${p.id}, isDead=${p.isDead}, isSource=${p.id === event.source}`);
        if (p.id !== event.source && !p.isDead) {
            console.log(`[DEBUG] Attacking player ${p.id}`);
            await resolveAttack(event.source, p.id, event.attackType);
        }
    }
    break;
```

### 步骤3：检查事件流程
追踪完整的事件流程：

**南蛮入侵流程**：
```
1. AI.takeTurn() → game.useCard(华佗, 南蛮)
2. game.useCard() 返回 [use_card, aoe]
3. aiTurn() 遍历 events
4. handleAIEvent(use_card) → 不显示日志（被过滤）
5. handleAIEvent(aoe) → 循环所有玩家
   5.1. resolveAttack(华佗, 玩家1, 'nanman')
        → respondAttack() → 没有杀
        → dealDamage(华佗, 玩家1, 1)
        → handleAIEvent(damage)
   5.2. resolveAttack(华佗, 玩家2, 'nanman')
        → ...
```

### 步骤4：检查特殊情况
检查是否有以下情况：
1. 华佗的 berserk 状态异常
2. 华佗的 ID 重复
3. 事件队列被重复处理
4. AOE 循环被嵌套调用

## 临时解决方案

如果无法立即定位问题，可以：
1. 在 dealDamage() 中添加日志
2. 限制伤害最大值为 1（临时修复）
3. 在 resolveAttack() 中添加防重入检查

## 测试用例

创建专门的测试场景：
1. 华佗作为AI，使用南蛮入侵
2. 华佗作为玩家，使用南蛮入侵
3. 华佗使用杀攻击单个目标
4. 其他武将使用南蛮入侵（对照组）

## 可能的修复方案

### 方案1：限制伤害值
```javascript
async dealDamage(source, target, baseDamage = 1) {
    let damage = baseDamage;
    if (source.berserk) damage++;
    damage = Math.min(damage, 2);  // 限制最大伤害
    target.hp -= damage;
    // ...
}
```

### 方案2：添加防重入标记
```javascript
let isProcessingDamage = false;

async function resolveAttack(sourceIdx, targetIdx, type) {
    if (isProcessingDamage) {
        console.warn('[WARN] resolveAttack called recursively!');
        return;
    }
    isProcessingDamage = true;
    try {
        // ... 原有逻辑
    } finally {
        isProcessingDamage = false;
    }
}
```

### 方案3：清除所有buff
```javascript
async dealDamage(source, target, baseDamage = 1) {
    let damage = baseDamage;
    if (source.berserk) {
        damage++;
        source.berserk = false;  // 立即清除buff
    }
    target.hp -= damage;
    // ...
}
```

## 下一步行动
1. 用户提供更详细的复现步骤
2. 添加debug日志追踪
3. 测试不同武将是否有同样问题
4. 根据日志定位具体原因
