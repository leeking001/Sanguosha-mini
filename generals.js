// 英雄数据模块 - 迷你杀英雄定义

const GENERALS_DATA = [
    { name: '曹操', hp: 4, skill: '奸雄', avatar: '🔥', color: '#e74c3c',
      skillDesc: '受到伤害后，可获得对方打出的牌并摸一张牌' },
    { name: '诸葛亮', hp: 3, skill: '反击', avatar: '🌙', color: '#2c3e50',
      skillDesc: '受到伤害后，可令伤害来源弃置一张手牌' },
    { name: '刘备', hp: 4, skill: '仁德', avatar: '🐉', color: '#2ecc71',
      skillDesc: '出牌阶段开始时，额外摸1张牌' },

    { name: '吕布', hp: 4, skill: '无双', avatar: '⚔️', color: '#c0392b',
      skillDesc: '出牌阶段，使用【杀】无次数限制' },
    { name: '赵云', hp: 4, skill: '龙胆', avatar: '🏹', color: '#d35400',
      skillDesc: '【杀】可当【闪】，【闪】可当【杀】' },

    { name: '孙权', hp: 4, skill: '制衡', avatar: '👑', color: '#3498db',
      skillDesc: '出牌阶段，可弃置任意张手牌然后摸等量的牌（每回合限一次）' },

    { name: '华佗', hp: 4, skill: '苦肉', avatar: '🛡️', color: '#f39c12',
      skillDesc: '出牌阶段，可失去1点生命摸2张牌（每回合限一次）' },
    { name: '黄月英', hp: 3, skill: '急救', avatar: '🌿', color: '#27ae60',
      skillDesc: '回合结束时若已受伤，回复1点生命' },
    { name: '魏延', hp: 5, skill: '狂暴', avatar: '💥', color: '#e74c3c',
      skillDesc: '使用【杀】需2张【闪】抵消；决斗时对方需出2张【杀】' }
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