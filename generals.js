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

    { name: '华佗', hp: 4, skill: '神医', avatar: '⚕️', color: '#f39c12',
      skillDesc: '出牌阶段，可指定一名其他角色回复1点生命（每回合限一次）',
      skillType: 'active', canUse: true },

    { name: '曹操', hp: 4, skill: '奸雄', avatar: '🔥', color: '#e74c3c',
      skillDesc: '出牌阶段，可获得弃牌堆中的一张牌（每回合限一次）',
      skillType: 'active', canUse: true },

    { name: '诸葛亮', hp: 3, skill: '反击', avatar: '🌙', color: '#2c3e50',
      skillDesc: '出牌阶段，可令一名其他角色弃置一张手牌（每回合限一次）',
      skillType: 'active', canUse: true },

    { name: '赵云', hp: 4, skill: '龙胆', avatar: '🏹', color: '#d35400',
      skillDesc: '出牌阶段，可将一张【杀】当【闪】使用，或将一张【闪】当【杀】使用',
      skillType: 'active', canUse: true },

    { name: '黄忠', hp: 4, skill: '苦肉', avatar: '💂', color: '#e8860f',
      skillDesc: '出牌阶段，可失去1点生命摸2张牌（每回合限一次）',
      skillType: 'active', canUse: true },

    { name: '魏延', hp: 5, skill: '狂暴', avatar: '💥', color: '#e67e22',
      skillDesc: '出牌阶段，可摸1张牌（每回合限一次）',
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