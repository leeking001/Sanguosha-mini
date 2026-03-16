#!/bin/bash
# 晨间简报中的三国杀开发部分

WORKSPACE="/Users/leeking001/.openclaw/workspace/sanguosha-daily"
REPORT_FILE="$WORKSPACE/reports/morning_sanguosha_$(date +%Y%m%d).md"

cd "$WORKSPACE" || exit 1

# 获取昨日版本信息
YESTERDAY=$(date -v-1d +%Y%m%d)
YESTERDAY_VERSION=$(find . -name "release_report_${YESTERDAY}.md" -type f | head -1)

# 获取今日计划
TODAY_PLAN=$(find plans -name "dev_plan_$(date +%Y%m%d).md" -type f | head -1)

cat > "$REPORT_FILE" << REPORT
# 🎮 三国杀开发晨间简报 - $(date "+%Y-%m-%d")

## 📊 昨日成果
$(if [ -f "$YESTERDAY_VERSION" ]; then
    echo "✅ 成功发布新版本"
    grep -h "版本号:" "$YESTERDAY_VERSION" | head -1
    echo ""
    echo "**新增功能:**"
    grep -h "### 新增功能" -A5 "$YESTERDAY_VERSION" | tail -n +2 | head -5
else
    echo "📝 昨日为开发准备日，今日开始正式每日迭代"
fi)

## 🎯 今日目标
$(if [ -f "$TODAY_PLAN" ]; then
    grep -h "## 🎯 今日开发主题" -A2 "$TODAY_PLAN" | tail -n +2
    echo ""
    echo "**具体任务:**"
    grep -h "### 具体功能" -A6 "$TODAY_PLAN" | tail -n +2 | head -5
else
    echo "⏳ 今日开发计划生成中..."
fi)

## ⏰ 开发时间安排
**上午 (09:00-12:00):** 需求分析与设计
**下午 (14:00-18:00):** 编码实现与测试
**晚上 (20:00-22:00):** 集成测试与发布

## 💡 开发建议
1. **保持专注**：一次只实现一个核心功能
2. **充分测试**：每个功能都要经过测试
3. **代码简洁**：保持单文件架构的清晰性
4. **用户体验**：始终以玩家体验为中心

## 🚀 立即行动
1. 查看详细开发计划: plans/dev_plan_$(date +%Y%m%d).md
2. 开始今日开发: 打开 index.html 进行编辑
3. 测试与发布: 使用 ./dev_workflow.sh 脚本

## 🌟 开发理念
"每天进步一点点，30天后拥有一个出色的游戏"

---
*三国杀每日迭代开发 - 第 $(($(date +%d) - 12 + 1)) 天*
REPORT

echo "晨间三国杀报告已生成: $REPORT_FILE"
