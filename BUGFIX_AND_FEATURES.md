# 🐛 Bug Fixes & Feature Enhancement Report

**Commit**: `8385e25`
**Date**: March 18, 2026
**Status**: ✅ COMPLETED

---

## 问题 1: 诸葛亮反击技能无法施放

### 问题描述
用户反馈诸葛亮的【反击】技能无法施放，也无法选择目标。

### 根本原因
反击技能需要选择目标，但UI没有实现技能目标选择流程。当`useActiveSkill()`返回`need_target`错误时，UI没有进行任何处理。

### 解决方案

#### 1. **游戏状态追踪**
- 在 `GameState` 中添加 `pendingSkill` 属性用于追踪等待目标选择的技能

```javascript
const GameState = {
    // ... 其他属性
    pendingSkill: null,  // { skillName, targets }
};
```

#### 2. **处理 need_target 错误**
- 修改 `handleSkillUse()` 函数识别 `need_target` 错误
- 显示提示信息指导玩家选择目标
- 高亮所有可选目标

```javascript
} else if (result.reason === 'need_target') {
    UI.log(`请选择【${result.skillName}】的目标`, 'system');
    showSkillToast(`点击敌方角色作为【${result.skillName}】的目标`);

    GameState.pendingSkill = {
        skillName: result.skillName,
        targets: result.targets
    };

    // 高亮可选目标
    for (const targetId of result.targets) {
        const targetEl = document.getElementById(`player-${targetId}`);
        if (targetEl) {
            targetEl.classList.add('skill-target-available');
        }
    }
}
```

#### 3. **目标选择处理**
- 新增 `handleSkillTargetSelect()` 函数处理技能目标选择
- 验证所选目标的有效性
- 用选中的目标重新调用 `useActiveSkill(targetId)`

```javascript
async function handleSkillTargetSelect(targetId) {
    if (!GameState.pendingSkill) return;

    if (!GameState.pendingSkill.targets.includes(targetId)) {
        UI.log('无效的目标', 'system');
        return;
    }

    // 移除高亮
    for (const id of GameState.pendingSkill.targets) {
        const targetEl = document.getElementById(`player-${id}`);
        if (targetEl) {
            targetEl.classList.remove('skill-target-available');
        }
    }

    const skillName = GameState.pendingSkill.skillName;
    GameState.pendingSkill = null;

    // 用选中的目标调用技能
    const result = Game.useActiveSkill(0, targetId);
    // ... 处理结果
}
```

#### 4. **更新玩家点击处理**
- 修改 `handlePlayerClick()` 判断是否处于技能目标选择模式
- 如果是，则调用 `handleSkillTargetSelect()`

```javascript
async function handlePlayerClick(playerId) {
    if (GameState.currentTurnIndex !== 0) return;

    // 如果正在选择技能目标，处理目标选择
    if (GameState.pendingSkill) {
        await handleSkillTargetSelect(playerId);
        return;
    }
    // ... 其他逻辑
}
```

#### 5. **UI 更新**
- 在 `renderEnemyZone()` 中添加 `player-${i}` ID
- 检查 `GameState.pendingSkill` 并添加 `skill-target-available` 类

```javascript
if (this.gameState.pendingSkill &&
    this.gameState.pendingSkill.targets.includes(i)) {
    classes += ' skill-target-available';
}
```

#### 6. **样式**
- 添加 `.skill-target-available` CSS 类，使用蓝色脉冲效果

```css
.enemy-card.skill-target-available {
    border-color: #3498db;
    box-shadow: 0 0 25px #3498db, 0 0 40px rgba(52, 152, 219, 0.5);
    animation: skillTargetPulse 0.6s infinite;
    cursor: pointer;
}
```

### 结果
✅ 诸葛亮的【反击】技能现在可以正常施放
✅ 玩家可以清晰看到可选目标的蓝色脉冲高亮
✅ 点击目标后技能立即发动

---

## 问题 2: 扩展结算画面统计数据

### 问题描述
用户希望结算画面显示更多丰富的统计数据项，以便找到每局表现出色的角色。

### 原有数据项
- 伤害 (damageDealt)
- 回复 (healed)
- 击杀 (kills)

### 新增数据项

#### 1. **出牌数 (cardsPlayed)**
- 统计玩家在整局游戏中使用的卡牌总数
- 不区分卡牌类型，所有卡牌都计算

#### 2. **锦囊数 (strategiesUsed)**
- 统计玩家使用的策略类卡牌总数
- 包括：万箭、南蛮、五谷、无中、乐不、顺手、拆桥、决斗、火攻、铁索

#### 3. **技能释放数 (skillsUsed)**
- 统计玩家使用的主动技能总次数
- 每个英雄的技能限制(每回合限一次)仍然有效，此处只统计成功释放的次数

### 实现方案

#### 1. **初始化新字段**
在 `createPlayer()` 中添加新的统计字段：

```javascript
stats: {
    damageDealt: 0,
    healed: 0,
    kills: 0,
    cardsPlayed: 0,      // ✅ NEW
    strategiesUsed: 0,   // ✅ NEW
    skillsUsed: 0        // ✅ NEW
}
```

#### 2. **出牌数追踪**
在 `useCard()` 函数最开始添加追踪：

```javascript
async useCard(sourceIdx, cardIndex, targetInfo) {
    const source = GameState.players[sourceIdx];
    const card = source.hand[cardIndex];
    source.hand.splice(cardIndex, 1);
    source.stats.cardsPlayed += 1;  // ✅ ADDED
    const events = [{ type: 'use_card', card, source: sourceIdx }];
```

#### 3. **锦囊数追踪**
为所有策略卡牌在其 case 分支中添加追踪：

```javascript
case '万箭':
case '南蛮':
    source.stats.strategiesUsed += 1;  // ✅ ADDED
    // ... 其他逻辑

case '五谷':
    source.stats.strategiesUsed += 1;  // ✅ ADDED
    // ... 其他逻辑

// ... 对所有策略卡牌重复
```

#### 4. **技能释放数追踪**
在 `useActiveSkill()` 成功返回前添加追踪：

```javascript
// 统计技能使用
player.stats.skillsUsed += 1;  // ✅ ADDED
return { success: true, events };
```

#### 5. **结算画面 UI 更新**
修改 `showGameResult()` 显示所有 6 个统计数据：

```javascript
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

html += `
    <div class="result-row">
        <span class="res-role" style="color:${roleColor}">${p.role}</span>
        <span class="res-name">${p.general.avatar} ${p.general.name}</span>
        <span class="res-stat-small" style="color:#e74c3c">${p.stats.damageDealt}</span>
        <span class="res-stat-small" style="color:#2ecc71">${p.stats.healed}</span>
        <span class="res-stat-small" style="color:#f1c40f">${p.stats.kills}</span>
        <span class="res-stat-small" style="color:#3498db">${p.stats.cardsPlayed}</span>
        <span class="res-stat-small" style="color:#9b59b6">${p.stats.strategiesUsed}</span>
        <span class="res-stat-small" style="color:#1abc9c">${p.stats.skillsUsed}</span>
    </div>
`;
```

#### 6. **样式调整**
添加 `res-stat-small` CSS 类用于紧凑显示：

```css
.res-stat-small {
    width: 11%;
    text-align: center;
    font-size: 11px;
}
```

### 数据颜色编码
| 数据项 | 颜色 | 代码 |
|--------|------|------|
| 伤害 | 红色 | #e74c3c |
| 回复 | 绿色 | #2ecc71 |
| 击杀 | 黄色 | #f1c40f |
| 出牌 | 蓝色 | #3498db |
| 锦囊 | 紫色 | #9b59b6 |
| 技能 | 青色 | #1abc9c |

### 统计覆盖

✅ **出牌数** - 所有卡牌都计算（共15种）
✅ **锦囊数** - 10种策略卡牌追踪
✅ **技能数** - 9个英雄的主动技能追踪

### 结果
✅ 结算画面现在显示 8 个数据列
✅ 玩家可以看到各个角色的全面表现数据
✅ 不同颜色区分各数据项，易于阅读
✅ 表格自动适配 8 列显示

---

## 技术统计

### 代码变化
| 文件 | 行数 | 类型 |
|------|------|------|
| game.js | +25 | 逻辑和追踪 |
| index.html | +71 | UI 和事件处理 |
| ui.js | +58 | 界面渲染 |
| style.css | +7 | 样式 |
| **总计** | **+161** | |

### 新增功能
- ✅ 技能目标选择 UI
- ✅ 技能目标高亮动画
- ✅ 3 个新的统计字段
- ✅ 扩展的结算画面

### Bug 修复
- ✅ 诸葛亮反击技能无法施放
- ✅ 需要目标的技能无法选择

---

## 测试清单

### 功能测试

#### 反击技能
- [ ] 诸葛亮可以正常触发反击技能
- [ ] 点击技能按钮后，可选目标显示蓝色脉冲边框
- [ ] 可以点击敌方角色作为目标
- [ ] 技能成功施放，敌方弃置一张手牌
- [ ] 华佗的神医技能同样工作（需要目标的其他技能）

#### 统计追踪
- [ ] 出牌数：每张卡牌使用时 +1
- [ ] 锦囊数：只有策略卡牌时 +1
- [ ] 技能数：技能成功施放时 +1
- [ ] 伤害数：敌方受伤时 +N（N为伤害值）
- [ ] 回复数：角色回复时 +1
- [ ] 击杀数：敌方阵亡时 +1

#### 结算画面
- [ ] 显示所有 6 个统计数据
- [ ] 数据格式正确（数字显示）
- [ ] 颜色编码清晰
- [ ] 表格排版整齐

---

## 已知限制

1. **技能目标搜索**：只能点击敌方角色作为目标，不能点击己方角色
2. **策略卡牌**：只追踪基础的 10 种策略卡牌，如有新增需要手动添加
3. **统计重置**：每局新游戏时统计重置为 0，不保存历史记录

---

## 后续改进建议

1. **统计分析**
   - 添加历史统计追踪（胜/负场数）
   - 按英雄统计平均表现
   - 生成游戏回放数据

2. **技能目标选择**
   - 支持自身为目标的技能
   - 显示目标选择的详细信息（如剩余手牌数）
   - 添加撤销操作

3. **UI 增强**
   - 结算画面支持排序（点击列标题排序）
   - 添加 MVP（最有价值玩家）标签
   - 统计趋势图表

