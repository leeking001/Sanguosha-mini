// 英雄数据模块 - 迷你杀英雄定义

const GENERALS_DATA = [
    { name: '大耳备', hp: 4, skill: '仁德', avatar: 'images/daerbei.png', avatarEmoji: '🐉', color: '#2ecc71',
      skillDesc: '摸1张牌',
      skillType: 'active', canUse: true },

    { name: '大奉先', hp: 4, skill: '无双', avatar: 'images/dafengxian.png', avatarEmoji: '⚔️', color: '#c0392b',
      skillDesc: '【杀】无限制',
      skillType: 'active', canUse: true },

    { name: '孙十万', hp: 4, skill: '制衡', avatar: 'images/sunshiwanv.png', avatarEmoji: '👑', color: '#3498db',
      skillDesc: '弃牌摸等量',
      skillType: 'active', canUse: true },

    { name: '华老头', hp: 4, skill: '神医', avatar: 'images/hualaotou.png', avatarEmoji: '⚕️', color: '#f39c12',
      skillDesc: '回复1血',
      skillType: 'active', canUse: true },

    { name: '人妻控', hp: 4, skill: '色诱', avatar: 'images/renqikong.png', avatarEmoji: '🔥', color: '#e74c3c',
      skillDesc: '敌方手牌上限-1',
      skillType: 'active', canUse: true },

    { name: '孔明亮', hp: 3, skill: '反击', avatar: 'images/kongmingliang.png', avatarEmoji: '🌙', color: '#2c3e50',
      skillDesc: '令敌弃1张牌',
      skillType: 'active', canUse: true },

    { name: '常山赵', hp: 4, skill: '龙胆', avatar: 'images/changshanzhao.png', avatarEmoji: '🏹', color: '#d35400',
      skillDesc: '杀闪互换',
      skillType: 'active', canUse: true },

    { name: '老黄', hp: 4, skill: '营救', avatar: 'images/laohuang.png', avatarEmoji: '💂', color: '#e8860f',
      skillDesc: '指定角色摸1张',
      skillType: 'active', canUse: true },

    { name: '反骨延', hp: 5, skill: '狂暴', avatar: 'images/fanguyen.png', avatarEmoji: '💥', color: '#e67e22',
      skillDesc: '【杀】伤害+1',
      skillType: 'passive', canUse: true }
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