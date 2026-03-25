#!/bin/bash

# 三国杀mini项目启动脚本

echo "🎮 正在启动三国杀mini游戏..."
echo "📁 项目目录: $(pwd)"

# 检查是否安装了python3
if command -v python3 &> /dev/null; then
    echo "✅ 使用 Python 3 启动HTTP服务器"
    echo "🌐 游戏地址: http://localhost:8000"
    echo "🎯 请在浏览器中打开上述地址"
    echo "⛔ 按 Ctrl+C 可停止服务器"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ 使用 Python 2 启动HTTP服务器"
    echo "🌐 游戏地址: http://localhost:8000"
    echo "🎯 请在浏览器中打开上述地址"
    echo "⛔ 按 Ctrl+C 可停止服务器"
    echo ""
    python -m SimpleHTTPServer 8000
else
    echo "❌ 错误: 未找到 Python，无法启动服务器"
    echo "💡 提示: 请安装 Python 或使用其他HTTP服务器"
    exit 1
fi
