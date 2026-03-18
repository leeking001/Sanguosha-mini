// 英雄数据模块 - 迷你杀英雄定义

const GENERALS_DATA = [
    { name: '刘备', hp: 4, skill: '仁德', avatar: '🐉', color: '#2ecc71',
      skillDesc: '出牌阶段开始时，额外摸1张牌',
      skillType: 'active', canUse: true },

    { name: '吕布', hp: 4, skill: '无双', avatar: '⚔️', color: '#c0392b',
      skillDesc: '出牌阶段，使用【杀】无次数限制',
      skillType: 'active', canUse: true },

    { name: '孙权', hp: 4, skill: '制衡', avatar: '👑', color: '#3498db',
      skillDesc: '出牌阶段，可弃置任意张手牌然后摸等量的牌（每回合限一次）',
      skillType: 'active', canUse: true },

    { name: '华佗', hp: 4, skill: '苦肉', avatar: '🛡️', color: '#f39c12',
      skillDesc: '出牌阶段，可失去1点生命摸2张牌（每回合限一次）',
      skillType: 'active', canUse: true }
];

// 获取随机英雄（排除已选）
function getRandomGenerals(count, exclude = []) {
    const available = GENERALS_DATA.filter(g => !exclude.includes(g.name));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// 根据名称获取英雄
function getGeneralByName(name) {
    return GENERALS_DATA.find(g => g.name === name);
}

// ES6 导出
export { GENERALS_DATA, getRandomGenerals, getGeneralByName };