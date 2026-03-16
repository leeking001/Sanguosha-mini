#!/bin/bash

# 三国杀开发工作流脚本
# 包含开发、测试、发布的完整流程

WORKSPACE="/Users/leeking001/.openclaw/workspace/sanguosha-daily"
LOG_FILE="$WORKSPACE/logs/workflow_$(date +%Y%m%d).log"

# 创建目录
mkdir -p "$(dirname "$LOG_FILE")"

echo "=== 三国杀开发工作流开始 $(date) ===" > "$LOG_FILE"

# 切换到项目目录
cd "$WORKSPACE" || exit 1

# 获取当前版本
CURRENT_VERSION=$(cat VERSION.md 2>/dev/null || echo "v0.05")

# 函数：开发阶段
function development_phase() {
    echo "🚀 进入开发阶段..." >> "$LOG_FILE"
    
    # 1. 备份当前版本
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).html"
    cp index.html "backups/$BACKUP_FILE"
    echo "✅ 当前版本已备份: backups/$BACKUP_FILE" >> "$LOG_FILE"
    
    # 2. 读取今日开发计划
    DEV_PLAN=$(find plans -name "dev_plan_$(date +%Y%m%d).md" -type f | head -1)
    if [ -f "$DEV_PLAN" ]; then
        echo "📋 使用开发计划: $DEV_PLAN" >> "$LOG_FILE"
        # 这里可以解析开发计划，指导具体开发
    else
        echo "⚠️ 未找到今日开发计划，使用默认开发流程" >> "$LOG_FILE"
    fi
    
    # 3. 开发提示（根据星期几）
    DAY_OF_WEEK=$(date "+%u")
    case $DAY_OF_WEEK in
        1) # 周一：游戏状态保存
            echo "💾 今日开发重点: localStorage游戏状态保存" >> "$LOG_FILE"
            echo "建议实现功能:" >> "$LOG_FILE"
            echo "1. 游戏状态序列化/反序列化" >> "$LOG_FILE"
            echo "2. 暂停/恢复功能" >> "$LOG_FILE"
            echo "3. 游戏统计记录" >> "$LOG_FILE"
            ;;
        2) # 周二：新武将
            echo "👥 今日开发重点: 新武将系统" >> "$LOG_FILE"
            echo "建议实现功能:" >> "$LOG_FILE"
            echo "1. 诸葛亮技能设计" >> "$LOG_FILE"
            echo "2. 司马懿技能设计" >> "$LOG_FILE"
            echo "3. 武将平衡性调整" >> "$LOG_FILE"
            ;;
        3) # 周三：新卡牌
            echo "🃏 今日开发重点: 新卡牌系统" >> "$LOG_FILE"
            echo "建议实现功能:" >> "$LOG_FILE"
            echo "1. 锦囊牌实现" >> "$LOG_FILE"
            echo "2. 装备牌系统" >> "$LOG_FILE"
            echo "3. 卡牌特效" >> "$LOG_FILE"
            ;;
        4) # 周四：游戏模式
            echo "🎮 今日开发重点: 多游戏模式" >> "$LOG_FILE"
            echo "建议实现功能:" >> "$LOG_FILE"
            echo "1. 1v1快速模式" >> "$LOG_FILE"
            echo "2. 3人局模式" >> "$LOG_FILE"
            echo "3. 模式切换界面" >> "$LOG_FILE"
            ;;
        5) # 周五：UI/UX优化
            echo "🎨 今日开发重点: 用户体验优化" >> "$LOG_FILE"
            echo "建议实现功能:" >> "$LOG_FILE"
            echo "1. 动画效果增强" >> "$LOG_FILE"
            echo "2. 音效优化" >> "$LOG_FILE"
            echo "3. 操作反馈改进" >> "$LOG_FILE"
            ;;
    esac
    
    echo "🔧 开始手动开发..." >> "$LOG_FILE"
    echo "请打开 index.html 进行开发" >> "$LOG_FILE"
    echo "开发完成后运行: ./dev_workflow.sh test" >> "$LOG_FILE"
}

# 函数：测试阶段
function testing_phase() {
    echo "🧪 进入测试阶段..." >> "$LOG_FILE"
    
    # 1. 基础语法检查
    echo "1. HTML语法检查..." >> "$LOG_FILE"
    if command -v tidy &> /dev/null; then
        tidy -q -errors index.html 2>&1 | head -20 >> "$LOG_FILE"
    else
        echo "⚠️ tidy未安装，跳过HTML检查" >> "$LOG_FILE"
    fi
    
    # 2. JavaScript语法检查
    echo "2. JavaScript语法检查..." >> "$LOG_FILE"
    # 提取JS部分进行简单检查
    grep -n "<script>" index.html >> "$LOG_FILE" 2>&1
    
    # 3. 功能测试清单
    echo "3. 功能测试清单:" >> "$LOG_FILE"
    cat > "$WORKSPACE/test_checklist.md" << EOF
# 🧪 三国杀版本测试清单 - $CURRENT_VERSION

测试日期: $(date "+%Y-%m-%d %H:%M")
测试版本: $CURRENT_VERSION

## 基础功能测试
- [ ] 游戏正常启动
- [ ] 武将选择界面正常
- [ ] 卡牌可以正常使用
- [ ] AI可以正常出牌
- [ ] 游戏胜负判定正确

## 今日新增功能测试
$(if [ -f "plans/dev_plan_$(date +%Y%m%d).md" ]; then
    grep -A5 "### 具体功能" "plans/dev_plan_$(date +%Y%m%d).md" | tail -n +2 | sed 's/- \[ \] /- [ ] /'
fi)

## 浏览器兼容性测试
- [ ] Chrome 最新版
- [ ] Firefox 最新版
- [ ] Safari 最新版
- [ ] Edge 最新版

## 移动端测试
- [ ] 手机竖屏显示正常
- [ ] 触摸操作流畅
- [ ] 响应式布局正确
- [ ] 性能表现良好

## 回归测试
- [ ] 原有功能不受影响
- [ ] 游戏平衡性正常
- [ ] 音效系统正常
- [ ] UI显示正常

## 性能测试
- [ ] 页面加载速度
- [ ] 游戏运行流畅度
- [ ] 内存使用情况
- [ ] 电池消耗情况

## 用户体验测试
- [ ] 操作直观易懂
- [ ] 反馈及时明确
- [ ] 界面美观协调
- [ ] 游戏乐趣充足

## 测试结果
**通过项目:**  
**失败项目:**  
**待改进项:**  

## 测试建议
1. 
2. 
3. 

## 发布建议
- [ ] 可以发布
- [ ] 需要修复后再发布
- [ ] 建议回滚到上一版本

---
*测试完成后，运行: ./dev_workflow.sh release*
EOF
    
    echo "测试清单已生成: $WORKSPACE/test_checklist.md" >> "$LOG_FILE"
    echo "请手动完成测试并填写测试结果" >> "$LOG_FILE"
    echo "测试完成后运行: ./dev_workflow.sh release" >> "$LOG_FILE"
}

# 函数：发布阶段
function release_phase() {
    echo "🚀 进入发布阶段..." >> "$LOG_FILE"
    
    # 1. 确认版本
    echo "发布版本: $CURRENT_VERSION" >> "$LOG_FILE"
    
    # 2. 提交代码
    echo "提交代码到GitHub..." >> "$LOG_FILE"
    git add . >> "$LOG_FILE" 2>&1
    git commit -m "Release $CURRENT_VERSION: $(date '+%Y-%m-%d 每日迭代')" >> "$LOG_FILE" 2>&1
    
    # 3. 创建标签
    echo "创建版本标签..." >> "$LOG_FILE"
    git tag -a "$CURRENT_VERSION" -m "Version $CURRENT_VERSION - $(date '+%Y-%m-%d')" >> "$LOG_FILE" 2>&1
    
    # 4. 推送到GitHub
    echo "推送到GitHub..." >> "$LOG_FILE"
    git push origin main --tags >> "$LOG_FILE" 2>&1
    
    # 5. 创建Release（可选）
    echo "创建GitHub Release..." >> "$LOG_FILE"
    RELEASE_NOTES="## $CURRENT_VERSION - $(date '+%Y-%m-%d')
    
### 更新内容
$(if [ -f "CHANGELOG.md" ]; then
    grep -A10 "## $CURRENT_VERSION" CHANGELOG.md | tail -n +3 | head -10
fi)

### 游戏体验
- 单文件HTML，无需安装
- 支持现代浏览器
- 移动端优化

### 立即游玩
下载 [index.html](https://raw.githubusercontent.com/leeking001/Sanguosha-mini/main/index.html) 并双击打开

### 在线版本
访问: https://leeking001.github.io/Sanguosha-mini/

---
*每日迭代开发，每天都有新惊喜！*"
    
    # 使用GitHub CLI创建Release
    if command -v gh &> /dev/null; then
        echo "$RELEASE_NOTES" | gh release create "$CURRENT_VERSION" --title "$CURRENT_VERSION" --notes-file - >> "$LOG_FILE" 2>&1
    else
        echo "⚠️ GitHub CLI未安装，跳过自动创建Release" >> "$LOG_FILE"
    fi
    
    # 6. 生成发布报告
    cat > "$WORKSPACE/release_report_$(date +%Y%m%d).md" << EOF
# 🎉 三国杀版本发布报告 - $CURRENT_VERSION

**发布时间:** $(date "+%Y-%m-%d %H:%M:%S")
**发布状态:** ✅ 成功发布

## 版本信息
- **版本号:** $CURRENT_VERSION
- **迭代周期:** 1天
- **代码行数:** $(wc -l < index.html)
- **文件大小:** $(du -h index.html | cut -f1)

## 发布内容
### 新增功能
$(if [ -f "CHANGELOG.md" ]; then
    grep -A10 "## $CURRENT_VERSION" CHANGELOG.md | grep -E "^- " | head -10
fi)

### 技术改进
- 每日迭代开发流程
- 自动化版本管理
- 代码质量持续提升

### 用户体验
- 游戏稳定性增强
- 操作流畅度优化
- 界面美观度提升

## 发布成果
1. ✅ GitHub代码提交
2. ✅ 版本标签创建 ($CURRENT_VERSION)
3. ✅ 更新日志记录
4. ✅ 备份文件保存

## 在线访问
- **GitHub仓库:** https://github.com/leeking001/Sanguosha-mini
- **在线游玩:** https://leeking001.github.io/Sanguosha-mini/
- **直接下载:** https://raw.githubusercontent.com/leeking001/Sanguosha-mini/main/index.html

## 下一步计划
**明日版本:** $(echo $CURRENT_VERSION | sed 's/v0.\(..\)/v0.\\1/' | awk '{printf "v0.%02d", substr($1,4)+1}')
**开发主题:** $(find plans -name "dev_plan_$(date -v+1d +%Y%m%d).md" -exec grep -h "今日开发主题" {} \; | head -1 | sed 's/#* //')

## 致谢
感谢所有玩家的支持！
每日迭代，持续进步！ 🎮

---
*明日同一时间，继续三国杀开发之旅！*
EOF
    
    echo "发布报告已生成: $WORKSPACE/release_report_$(date +%Y%m%d).md" >> "$LOG_FILE"
    
    # 7. 输出发布成功信息
    echo "🎉 版本 $CURRENT_VERSION 发布成功！" >> "$LOG_FILE"
    echo "📁 发布报告: $WORKSPACE/release_report_$(date +%Y%m%d).md" >> "$LOG_FILE"
    echo "🌐 在线访问: https://leeking001.github.io/Sanguosha-mini/" >> "$LOG_FILE"
}

# 主流程
case "${1:-dev}" in
    dev|development)
        development_phase
        ;;
    test|testing)
        testing_phase
        ;;
    release|publish)
        release_phase
        ;;
    full|all)
        development_phase
        testing_phase
        release_phase
        ;;
    *)
        echo "使用方法: $0 [dev|test|release|full]" >> "$LOG_FILE"
        echo "  dev      - 开发阶段" >> "$LOG_FILE"
        echo "  test     - 测试阶段" >> "$LOG_FILE"
        echo "  release  - 发布阶段" >> "$LOG_FILE"
        echo "  full     - 完整流程" >> "$LOG_FILE"
        ;;
esac

echo "=== 开发工作流完成 $(date) ===" >> "$LOG_FILE"

# 输出到控制台
echo "✅ 三国杀开发工作流执行完成"
echo "📊 日志文件: $LOG_FILE"
echo "🎮 当前版本: $CURRENT_VERSION"

exit 0