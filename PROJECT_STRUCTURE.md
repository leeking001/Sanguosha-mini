# 三国杀迷你版 - 项目结构

## 📁 项目目录结构

```
Sanguosha-mini/
│
├── 📄 核心文件（根目录）
│   ├── index.html              # 主游戏界面
│   ├── style.css               # 样式表
│   ├── game.js                 # 游戏核心逻辑
│   ├── ui.js                   # UI 管理
│   ├── ai.js                   # AI 对手逻辑
│   ├── generals.js             # 英雄数据定义
│   ├── cards.js                # 卡牌系统
│   ├── audio.js                # 音效管理
│   ├── effects.js              # 动画效果
│   ├── storage.js              # 本地存储
│   ├── i18n.js                 # 国际化
│   ├── test_mobile_view.html   # 移动端测试页面
│   ├── README.md               # 项目说明（中文）
│   └── .gitignore              # Git 忽略规则
│
├── 📁 images/                  # 图片资源
│   ├── daerbei.png             # 大耳备头像
│   ├── dafengxian.png          # 大奉先头像
│   ├── sunshiwanv.png          # 孙十万头像
│   ├── hualaotou.png           # 华老头头像
│   ├── renqikong.png           # 人妻控头像
│   ├── kongmingliang.png       # 孔明亮头像
│   ├── changshanzhao.png       # 常山赵头像
│   ├── laohuang.png            # 老黄头像
│   └── fanguyen.png            # 反骨延头像
│
├── 📁 docs/                    # 文档目录
│   ├── README_EN.md            # 项目说明（英文）
│   ├── QUICK_REFERENCE.md      # 快速参考
│   │
│   ├── 📁 guides/              # 使用指南
│   │   ├── GAME_GUIDE.md                      # 游戏玩法指南
│   │   ├── SETUP_AND_TEST_GUIDE.md            # 安装和测试指南
│   │   ├── TESTING_GUIDE.md                   # 测试指南
│   │   ├── MOBILE_UI_TEST_GUIDE.md            # 移动端测试指南
│   │   ├── OPTIMIZATION_VISUAL_GUIDE.md       # 优化可视化指南
│   │   ├── AVATAR_REPLACEMENT_GUIDE.md        # 头像替换指南
│   │   └── MOBILE_VIEW_GUIDE.md               # 移动端视图指南
│   │
│   ├── 📁 technical/           # 技术文档
│   │   ├── BUGFIX_AND_FEATURES.md             # 功能和修复
│   │   ├── BUG_FIX_COMPREHENSIVE.md           # 综合修复报告
│   │   ├── AVATAR_DISPLAY_FIX.md              # 头像显示修复
│   │   ├── MOBILE_UI_OPTIMIZATION_FIX.md      # 移动端优化修复
│   │   ├── MOBILE_ASPECT_RATIO_FIX.md         # 宽高比修复
│   │   ├── HERO_SELECTION_OPTIMIZATION.md     # 英雄选择优化
│   │   ├── HERO_CARD_ASPECT_RATIO_OPTIMIZATION.md
│   │   ├── IMAGE_PRELOAD_AND_CARD_ENLARGEMENT.md
│   │   ├── PRELOAD_AND_ENLARGEMENT_COMPLETION.md
│   │   ├── GAMEPLAY_INTRO_FEATURE.md          # 游戏介绍功能
│   │   ├── I18N_IMPLEMENTATION.md             # 国际化实现
│   │   ├── PC_MOBILE_VIEW_FEATURE.md          # PC 移动视图功能
│   │   ├── PC_MOBILE_VIEW_UPDATE.md           # PC 移动视图更新
│   │   ├── FIXES_APPLIED.md                   # 应用的修复
│   │   ├── FIXES_COMPARISON.md                # 修复对比
│   │   ├── README_FIXES.md                    # 修复说明
│   │   ├── USER_FEEDBACK_IMPLEMENTATION.md    # 用户反馈实现
│   │   ├── USER_FEEDBACK_IMPROVEMENTS_20260323.md
│   │   ├── USER_FEEDBACK_SIZE_IMPROVEMENTS.md
│   │   ├── USER_FEEDBACK_CHECKLIST.md         # 用户反馈检查清单
│   │   ├── VERIFICATION_CHECKLIST.md          # 验证检查清单
│   │   ├── WANJIAN_INVESTIGATION.md           # 万箭调查
│   │   ├── V3_1_USER_FEEDBACK_IMPROVEMENTS.md
│   │   └── V3_UPDATE_SUMMARY.md               # V3 更新总结
│   │
│   └── 📁 logs/                # 日志和报告
│       ├── COMPLETION_REPORT.md               # 完成报告
│       ├── CRITICAL_FIXES_REPORT.md           # 关键修复报告
│       ├── TESTING_REPORT.md                  # 测试报告
│       ├── FIX_SUMMARY.md                     # 修复总结
│       ├── FIX_SUMMARY_20260323.md            # 修复总结（日期版）
│       ├── USER_FEEDBACK_SUMMARY_20260323.md  # 用户反馈总结
│       ├── V3_UPDATE_SUMMARY.md               # V3 更新总结
│       ├── USER_FEEDBACK_ROUND2.md            # 用户反馈第2轮
│       ├── USER_FEEDBACK_ROUND3.md            # 用户反馈第3轮
│       ├── USER_FEEDBACK_ROUND4.md            # 用户反馈第4轮
│       ├── USER_FEEDBACK_ROUND5.md            # 用户反馈第5轮
│       └── FIXES_VISUALIZATION.txt            # 修复可视化
│
└── 📁 .git/                    # Git 仓库数据
```

## 📝 文件说明

### 核心源代码文件

| 文件 | 说明 |
|------|------|
| `index.html` | 主游戏界面，包含所有 HTML 结构 |
| `style.css` | 全局样式表，包含响应式设计 |
| `game.js` | 游戏核心逻辑（回合制、伤害计算等） |
| `ui.js` | UI 管理（卡牌显示、按钮交互等） |
| `ai.js` | AI 对手的决策逻辑 |
| `generals.js` | 9 名英雄的属性和技能定义 |
| `cards.js` | 卡牌系统（卡牌类型、牌堆管理） |
| `audio.js` | 音效管理系统 |
| `effects.js` | 动画和视觉效果 |
| `storage.js` | 本地存储和数据持久化 |
| `i18n.js` | 国际化支持（多语言） |

### 资源文件

| 目录 | 说明 |
|------|------|
| `images/` | 9 名英雄的头像 PNG 图片 |

### 文档目录

| 目录 | 说明 |
|------|------|
| `docs/guides/` | 使用指南和测试指南 |
| `docs/technical/` | 技术文档和实现细节 |
| `docs/logs/` | 修复日志和报告 |

## 🚀 快速开始

### 1. 开发环境
```bash
# 克隆项目
git clone https://github.com/leeking001/Sanguosha-mini.git
cd Sanguosha-mini

# 使用 Python 启动本地服务器
python3 -m http.server 8000

# 或使用 Node.js 的 http-server
npx http-server
```

### 2. 访问游戏
- 桌面浏览器：http://localhost:8000
- 移动设备：http://[你的IP]:8000

### 3. 查看文档
- 游戏玩法：`docs/guides/GAME_GUIDE.md`
- 开发指南：`docs/guides/SETUP_AND_TEST_GUIDE.md`
- 技术细节：`docs/technical/` 目录

## 📊 项目统计

- **源代码文件**：12 个（.js, .html, .css）
- **图片资源**：9 个（英雄头像）
- **文档文件**：45+ 个（指南、报告、日志）
- **总代码行数**：~3000+ 行

## 🔄 最近更新

### 最新改进（2026-03-23）

1. **UI/内容改进**
   - 增加英雄选择界面高度（70vh → 80vh）
   - 增加 AI 头像显示高度（55% → 60%）
   - 更新游戏说明书（人妻控、老黄头技能）

2. **游戏说明书优化**
   - 更新技能触发描述
   - 优化武将技能排版
   - 完整的锦囊牌列表

3. **项目整理**
   - 创建 `docs/` 目录结构
   - 分类技术文档、指南、日志
   - 保持根目录清晰

## 📚 相关资源

- **GitHub 仓库**：https://github.com/leeking001/Sanguosha-mini
- **游戏规则**：参考 `docs/guides/GAME_GUIDE.md`
- **开发文档**：参考 `docs/technical/` 目录

## 📝 许可证

MIT License

---

**最后更新**：2026-03-23
**维护者**：leeking001
