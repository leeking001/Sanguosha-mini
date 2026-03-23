// 国际化 (i18n) 模块 - 支持中文和英文

const I18N = {
    // 当前语言
    currentLang: localStorage.getItem('sanguosha_lang') || 'zh',

    // 语言配置
    translations: {
        zh: {
            // UI 文本
            'title': '迷你杀·英雄对决',
            'welcome_title': '迷你杀',
            'welcome_subtitle': '英雄对决·战火连天',
            'welcome_lang': '语言',
            'welcome_guide': '游戏规则',
            'welcome_intro_1': '4人身份局 · 主公忠臣反贼内奸',
            'welcome_intro_2': '9位英雄 · 独特技能策略对决',
            'welcome_intro_3': '经典卡牌 · 杀闪桃酒锦囊齐全',
            'welcome_intro_4': '智能AI · 真实对战体验',
            'welcome_footer': 'HTML5 单机版 · 无需联网 · 开源免费',
            'btn_start_game': '开始游戏',
            'btn_skill': '【技能】',
            'btn_confirm': '出牌',
            'btn_cancel': '取消',
            'btn_end': '结束',
            'btn_help': '?',

            // 身份选择
            'step_role': '第一步：选择你的身份',
            'role_lord': '主公',
            'role_loyalist': '忠臣',
            'role_rebel': '反贼',
            'role_spy': '内奸',

            // 将领选择
            'step_general': '第二步：选择你的英雄',

            // 游戏日志
            'welcome_message': '欢迎来到迷你杀...',
            'game_start': '游戏开始！',
            'round_start': '%s开始回合',
            'draw_phase': '%s进入摸牌阶段，摸了%d张牌',
            'play_phase': '%s进入出牌阶段',
            'discard_phase': '%s需要弃牌',
            'turn_end': '%s的回合结束',

            // 操作反馈
            'select_card': '已选中：',
            'select_target': '请选择目标',
            'invalid_target': '无效的目标',
            'skill_used': '技能已使用',
            'card_played': '出牌成功',

            // 卡牌名称
            'card_sha': '杀',
            'card_shan': '闪',
            'card_tao': '桃',
            'card_jiu': '酒',
            'card_wanjian': '万箭齐发',
            'card_nanman': '南蛮入侵',
            'card_wuzhong': '无中生有',
            'card_wugu': '五谷丰登',
            'card_shun': '顺手牵羊',
            'card_guohe': '过河拆桥',
            'card_jueou': '决斗',
            'card_huogong': '火攻',
            'card_tiesuo': '铁索连环',
            'card_lexiang': '乐不思蜀',
            'card_bingliang': '兵粮寸断',
            'card_shan_dian': '闪电',
            'card_wuxie': '无懈可击',
            'card_jiedao': '借刀杀人',
            'card_taoyuan': '桃园结义',

            // 英雄名称
            'hero_daerbei': '大耳备',
            'hero_dafeixian': '大奉先',
            'hero_sunwanyi': '孙十万',
            'hero_hualaotou': '华老头',
            'hero_renwuqi': '人妻控',
            'hero_kongmingliang': '孔明亮',
            'hero_changshanzhao': '常山赵',
            'hero_laohuang': '老黄头',
            'hero_fangueyan': '反骨延',

            // 英雄技能
            'skill_rende': '仁德',
            'skill_wushuang': '无双',
            'skill_zhiheng': '制衡',
            'skill_shenyi': '神医',
            'skill_seyou': '色诱',
            'skill_fanjiji': '反击',
            'skill_longdan': '龙胆',
            'skill_yingjiuye': '营救',
            'skill_kuangbao': '狂暴',

            // 技能描述
            'skill_desc_rende': '摸1张牌',
            'skill_desc_wushuang': '【杀】无限制',
            'skill_desc_zhiheng': '弃牌摸等量',
            'skill_desc_shenyi': '回复1血',
            'skill_desc_seyou': '敌方手牌上限-1',
            'skill_desc_fanjiji': '令敌弃1张牌',
            'skill_desc_longdan': '杀闪互换',
            'skill_desc_yingjiuye': '指定角色摸1张',
            'skill_desc_kuangbao': '【杀】伤害+1',

            // 身份描述
            'role_desc_lord': '身份：主公\n要求：消灭所有反贼和内奸',
            'role_desc_loyalist': '身份：忠臣\n要求：帮助主公消灭反贼和内奸',
            'role_desc_rebel': '身份：反贼\n要求：消灭主公',
            'role_desc_spy': '身份：内奸\n要求：消灭所有其他玩家',

            // 游戏状态
            'health': '体力',
            'cards': '手牌',
            'chain': '连环',
            'sleep': '入梦',
            'starve': '断粮',
            'lightning': '闪电',

            // 游戏结束
            'game_over': '游戏结束！',
            'winner': '胜方：',
            'game_result': '%s胜利！',

            // 帮助
            'help_title': '游戏说明',
            'help_rules': '游戏规则',
            'help_cards': '卡牌说明',
            'help_heroes': '英雄介绍',
            'help_close': '关闭',
        },

        en: {
            // UI text
            'title': 'Mini Sha - Legendary Duel',
            'welcome_title': 'Mini Sha',
            'welcome_subtitle': 'Legendary Duel',
            'welcome_lang': 'Language',
            'welcome_guide': 'How to Play',
            'welcome_intro_1': '4-Player Identity Game · Lord, Loyalist, Rebel, Spy',
            'welcome_intro_2': '9 Heroes · Unique Skill & Strategy',
            'welcome_intro_3': 'Classic Cards · Sha, Shan, Tao, Jiu & Tricks',
            'welcome_intro_4': 'Smart AI · Real Combat Experience',
            'welcome_footer': 'HTML5 Standalone · No Internet Required · Open Source & Free',
            'btn_start_game': 'Start Game',
            'btn_skill': '【Skill】',
            'btn_confirm': 'Play Card',
            'btn_cancel': 'Cancel',
            'btn_end': 'End Turn',
            'btn_help': '?',

            // Role selection
            'step_role': 'Step 1: Choose Your Role',
            'role_lord': 'Lord',
            'role_loyalist': 'Loyalist',
            'role_rebel': 'Rebel',
            'role_spy': 'Spy',

            // Hero selection
            'step_general': 'Step 2: Choose Your Hero',

            // Game log
            'welcome_message': 'Welcome to Mini Sha...',
            'game_start': 'Game Started!',
            'round_start': '%s starts their turn',
            'draw_phase': '%s enters draw phase, drew %d cards',
            'play_phase': '%s enters play phase',
            'discard_phase': '%s needs to discard cards',
            'turn_end': '%s\'s turn ended',

            // Action feedback
            'select_card': 'Selected:',
            'select_target': 'Please select a target',
            'invalid_target': 'Invalid target',
            'skill_used': 'Skill used',
            'card_played': 'Card played successfully',

            // Card names
            'card_sha': 'Sha',
            'card_shan': 'Shan',
            'card_tao': 'Tao',
            'card_jiu': 'Jiu',
            'card_wanjian': 'Barrage',
            'card_nanman': 'Southern Invasion',
            'card_wuzhong': 'Windfall',
            'card_wugu': 'Harvest',
            'card_shun': 'Take',
            'card_guohe': 'Dismantlement',
            'card_jueou': 'Duel',
            'card_huogong': 'Fire Attack',
            'card_tiesuo': 'Chain',
            'card_lexiang': 'Dreaming',
            'card_bingliang': 'Starvation',
            'card_shan_dian': 'Lightning',
            'card_wuxie': 'Negate',
            'card_jiedao': 'Borrow Sword',
            'card_taoyuan': 'Peach Garden',

            // Hero names
            'hero_daerbei': 'Big Ear',
            'hero_dafeixian': 'Great Flyer',
            'hero_sunwanyi': 'Sun Tens',
            'hero_hualaotou': 'Doctor Hua',
            'hero_renwuqi': 'Fair Lady',
            'hero_kongmingliang': 'Bright Mind',
            'hero_changshanzhao': 'Cloud Chaser',
            'hero_laohuang': 'Old Yellow',
            'hero_fangueyan': 'Wild Rebel',

            // Hero skills
            'skill_rende': 'Benevolence',
            'skill_wushuang': 'Unmatched',
            'skill_zhiheng': 'Balance',
            'skill_shenyi': 'Divine Physician',
            'skill_seyou': 'Seduction',
            'skill_fanjiji': 'Counter',
            'skill_longdan': 'Dragon Daring',
            'skill_yingjiuye': 'Rescue',
            'skill_kuangbao': 'Berserk',

            // Skill descriptions
            'skill_desc_rende': 'Draw 1 card',
            'skill_desc_wushuang': 'Unlimited Sha usage',
            'skill_desc_zhiheng': 'Discard any cards to draw same amount',
            'skill_desc_shenyi': 'Heal 1 HP',
            'skill_desc_seyou': 'Enemy hand limit -1',
            'skill_desc_fanjiji': 'Enemy discard 1 card',
            'skill_desc_longdan': 'Sha and Shan interchangeable',
            'skill_desc_yingjiuye': 'Target draws 1 card',
            'skill_desc_kuangbao': 'Sha damage +1',

            // Role descriptions
            'role_desc_lord': 'Role: Lord\nObjective: Eliminate all Rebels and Spies',
            'role_desc_loyalist': 'Role: Loyalist\nObjective: Help Lord eliminate Rebels and Spies',
            'role_desc_rebel': 'Role: Rebel\nObjective: Eliminate the Lord',
            'role_desc_spy': 'Role: Spy\nObjective: Eliminate all other players',

            // Game status
            'health': 'Health',
            'cards': 'Cards',
            'chain': 'Chain',
            'sleep': 'Sleep',
            'starve': 'Starve',
            'lightning': 'Lightning',

            // Game end
            'game_over': 'Game Over!',
            'winner': 'Winners:',
            'game_result': '%s Victory!',

            // Help
            'help_title': 'Game Guide',
            'help_rules': 'Game Rules',
            'help_cards': 'Card Guide',
            'help_heroes': 'Heroes',
            'help_close': 'Close',
        }
    },

    // 获取翻译文本
    t(key, ...args) {
        let text = this.translations[this.currentLang][key] || this.translations['zh'][key] || key;
        // 支持简单的参数替换 %s -> 字符串, %d -> 数字
        args.forEach((arg, index) => {
            if (typeof arg === 'string') {
                text = text.replace('%s', arg);
            } else if (typeof arg === 'number') {
                text = text.replace('%d', arg);
            }
        });
        return text;
    },

    // 设置语言
    setLanguage(lang) {
        if (lang === 'zh' || lang === 'en') {
            this.currentLang = lang;
            localStorage.setItem('sanguosha_lang', lang);
            // 触发语言变更事件
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
        }
    },

    // 获取当前语言
    getLanguage() {
        return this.currentLang;
    },

    // 切换语言
    toggleLanguage() {
        this.setLanguage(this.currentLang === 'zh' ? 'en' : 'zh');
    }
};

// ES6 导出
export { I18N };
