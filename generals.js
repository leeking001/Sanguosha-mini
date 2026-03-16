// 武将数据模块 - 包含所有可用武将的信息

const GENERALS_DATA = [
    // 魏势力
    { name: '曹操', hp: 4, skill: '奸雄', avatar: '👑', color: '#8e44ad', faction: '魏', 
      skillDesc: '受到伤害后，可以获得造成伤害的牌并摸1张牌' },
    { name: '郭嘉', hp: 3, skill: '遗计', avatar: '🔮', color: '#2980b9', faction: '魏',
      skillDesc: '受到1点伤害后，可摸2张牌' },
    { name: '司马懿', hp: 3, skill: '反馈', avatar: '🌙', color: '#2c3e50', faction: '魏',
      skillDesc: '受到伤害后，可令伤害来源弃置一张手牌' },
    { name: '夏侯惇', hp: 4, skill: '刚烈', avatar: '👁️', color: '#c0392b', faction: '魏',
      skillDesc: '受到伤害后，可进行判定，若结果为红色，伤害来源受到1点伤害' },
    { name: '张辽', hp: 4, skill: '突袭', avatar: '⚡', color: '#7f8c8d', faction: '魏',
      skillDesc: '摸牌阶段，可少摸1张牌，然后获得其他角色一张手牌' },
    
    // 蜀势力
    { name: '刘备', hp: 4, skill: '仁德', avatar: '🐉', color: '#2ecc71', faction: '蜀',
      skillDesc: '出牌阶段开始时，额外摸1张牌' },
    { name: '关羽', hp: 4, skill: '武圣', avatar: '🔴', color: '#c0392b', faction: '蜀',
      skillDesc: '可将红色牌当【杀】使用或打出' },
    { name: '张飞', hp: 4, skill: '咆哮', avatar: '👹', color: '#c0392b', faction: '蜀',
      skillDesc: '出牌阶段，使用【杀】无次数限制' },
    { name: '赵云', hp: 4, skill: '龙胆', avatar: '🛡️', color: '#95a5a6', faction: '蜀',
      skillDesc: '【杀】可当【闪】，【闪】可当【杀】' },
    { name: '诸葛亮', hp: 3, skill: '观星', avatar: '🌟', color: '#3498db', faction: '蜀',
      skillDesc: '回合开始阶段，可观看牌堆顶2张牌并调整顺序' },
    { name: '马超', hp: 4, skill: '铁骑', avatar: '🐴', color: '#8e44ad', faction: '蜀',
      skillDesc: '使用【杀】指定目标后，可令目标无法使用【闪】响应' },
    { name: '黄月英', hp: 3, skill: '集智', avatar: '📚', color: '#9b59b6', faction: '蜀',
      skillDesc: '使用锦囊牌时，可摸1张牌' },
    
    // 吴势力
    { name: '孙权', hp: 4, skill: '制衡', avatar: '⚔️', color: '#27ae60', faction: '吴',
      skillDesc: '出牌阶段，可弃置1张牌摸1张牌（每回合限一次）' },
    { name: '周瑜', hp: 3, skill: '英姿', avatar: '🔥', color: '#e67e22', faction: '吴',
      skillDesc: '摸牌阶段多摸1张牌' },
    { name: '黄盖', hp: 4, skill: '苦肉', avatar: '👴', color: '#c0392b', faction: '吴',
      skillDesc: '出牌阶段，可流失1点体力摸2张牌（每回合限一次）' },
    { name: '孙尚香', hp: 3, skill: '枭姬', avatar: '🏹', color: '#e74c3c', faction: '吴',
      skillDesc: '失去装备区里的一张牌后，可摸2张牌' },
    { name: '甘宁', hp: 4, skill: '奇袭', avatar: '⚫', color: '#2c3e50', faction: '吴',
      skillDesc: '可将黑色牌当【过河拆桥】使用' },
    { name: '陆逊', hp: 3, skill: '连营', avatar: '🔥', color: '#e67e22', faction: '吴',
      skillDesc: '失去最后一张手牌后，可摸1张牌' },
    
    // 群势力
    { name: '吕布', hp: 5, skill: '无双', avatar: '🔥', color: '#e74c3c', faction: '群',
      skillDesc: '使用【杀】需2张【闪】抵消；决斗时对方需出2张【杀】' },
    { name: '华佗', hp: 3, skill: '急救', avatar: '🌿', color: '#27ae60', faction: '群',
      skillDesc: '回合结束时若已受伤，回复1点体力' },
    { name: '貂蝉', hp: 3, skill: '离间', avatar: '💃', color: '#e84393', faction: '群',
      skillDesc: '出牌阶段，可令两名男性角色决斗（每回合限一次）' },
    { name: '甄姬', hp: 3, skill: '洛神', avatar: '💧', color: '#8e44ad', faction: '群',
      skillDesc: '回合开始时判定，若为黑色则摸1张牌' },
    { name: '许褚', hp: 4, skill: '裸衣', avatar: '🛡️', color: '#7f8c8d', faction: '群',
      skillDesc: '摸牌阶段少摸1张，本回合【杀】或【决斗】伤害+1' },
    { name: '张角', hp: 3, skill: '雷击', avatar: '⚡', color: '#9b59b6', faction: '群',
      skillDesc: '使用【闪】后，可令一名角色判定，若为黑桃则受到2点雷电伤害' }
];

// 获取随机武将（排除已选）
function getRandomGenerals(count, exclude = []) {
    const available = GENERALS_DATA.filter(g => !exclude.includes(g.name));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// 根据名称获取武将
function getGeneralByName(name) {
    return GENERALS_DATA.find(g => g.name === name);
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GENERALS_DATA, getRandomGenerals, getGeneralByName };
}