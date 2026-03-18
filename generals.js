// 英雄数据模块 - 迷你杀英雄定义

const GENERALS_DATA = [
    // 红方势力（强攻型）
    { name: '赤焰将军', hp: 4, skill: '霸权', avatar: '🔥', color: '#e74c3c', faction: '红',
      skillDesc: '受到伤害后，可获得对方打出的牌并摸一张牌' },
    { name: '青锋剑客', hp: 4, skill: '突袭', avatar: '⚡', color: '#7f8c8d', faction: '红',
      skillDesc: '摸牌阶段，可少摸1张牌，然后获得其他角色一张手牌' },
    { name: '智谋军师', hp: 3, skill: '反击', avatar: '🌙', color: '#2c3e50', faction: '红',
      skillDesc: '受到伤害后，可令伤害来源弃置一张手牌' },

    // 蓝方势力（团队型）
    { name: '仁德君主', hp: 4, skill: '仁德', avatar: '🐉', color: '#2ecc71', faction: '蓝',
      skillDesc: '出牌阶段开始时，额外摸1张牌' },
    { name: '狂战勇士', hp: 4, skill: '咆哮', avatar: '⚔️', color: '#c0392b', faction: '蓝',
      skillDesc: '出牌阶段，使用【斩】无次数限制' },
    { name: '神弓手', hp: 4, skill: '神射', avatar: '🏹', color: '#d35400', faction: '蓝',
      skillDesc: '使用【斩】可额外指定一名目标' },

    // 绿方势力（平衡型）
    { name: '制衡帝王', hp: 4, skill: '制衡', avatar: '👑', color: '#3498db', faction: '绿',
      skillDesc: '出牌阶段，可弃置任意张手牌然后摸等量的牌（每回合限一次）' },
    { name: '铁骑将军', hp: 4, skill: '奇袭', avatar: '⚫', color: '#2c3e50', faction: '绿',
      skillDesc: '可将黑色牌当【破坏】使用' },

    // 黄方势力（特殊型）
    { name: '苦肉战将', hp: 4, skill: '苦肉', avatar: '🛡️', color: '#f39c12', faction: '黄',
      skillDesc: '出牌阶段，可失去1点生命摸2张牌（每回合限一次）' },
    { name: '神医圣手', hp: 3, skill: '急救', avatar: '🌿', color: '#27ae60', faction: '黄',
      skillDesc: '回合结束时若已受伤，回复1点生命' },
    { name: '暴怒战神', hp: 5, skill: '无双', avatar: '💥', color: '#e74c3c', faction: '黄',
      skillDesc: '使用【斩】需2张【躲】抵消；单挑时对方需出2张【斩】' }
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