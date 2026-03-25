#!/bin/bash

# 三国杀mini项目管理脚本

PORT=8000
PROJECT_DIR="/Users/leeking001/Claude Code/Sanguosha-mini"

cd "$PROJECT_DIR" || exit 1

case "$1" in
    start)
        echo "🎮 启动三国杀mini游戏服务器..."
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
            echo "⚠️  端口 $PORT 已被占用"
            echo "💡 使用 './manage.sh restart' 重启服务器"
            exit 1
        fi

        python3 -m http.server $PORT > /dev/null 2>&1 &
        SERVER_PID=$!
        echo $SERVER_PID > .server.pid

        sleep 1

        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
            echo "✅ 服务器启动成功！"
            echo "🌐 游戏地址: http://localhost:$PORT"
            echo "📝 进程ID: $SERVER_PID"
            echo ""
            echo "🎯 正在打开浏览器..."
            open "http://localhost:$PORT"
        else
            echo "❌ 服务器启动失败"
            exit 1
        fi
        ;;

    stop)
        echo "⛔ 停止三国杀mini游戏服务器..."

        if [ -f .server.pid ]; then
            PID=$(cat .server.pid)
            if ps -p $PID > /dev/null 2>&1; then
                kill $PID
                echo "✅ 服务器已停止 (PID: $PID)"
            else
                echo "⚠️  进程 $PID 不存在"
            fi
            rm .server.pid
        fi

        # 确保端口被释放
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
            lsof -ti:$PORT | xargs kill -9 2>/dev/null
            echo "✅ 端口 $PORT 已释放"
        fi
        ;;

    restart)
        echo "🔄 重启三国杀mini游戏服务器..."
        $0 stop
        sleep 1
        $0 start
        ;;

    status)
        echo "📊 三国杀mini服务器状态："
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
            PID=$(lsof -ti:$PORT)
            echo "✅ 服务器运行中"
            echo "📝 进程ID: $PID"
            echo "🌐 游戏地址: http://localhost:$PORT"
        else
            echo "⭕ 服务器未运行"
        fi
        ;;

    open)
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
            echo "🌐 打开游戏页面..."
            open "http://localhost:$PORT"
        else
            echo "❌ 服务器未运行，请先启动服务器"
            echo "💡 使用: ./manage.sh start"
        fi
        ;;

    test)
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
            echo "🧪 打开模块测试页面..."
            open "http://localhost:$PORT/test-modules.html"
        else
            echo "❌ 服务器未运行，请先启动服务器"
            echo "💡 使用: ./manage.sh start"
        fi
        ;;

    *)
        echo "三国杀mini - 项目管理工具 🎮"
        echo ""
        echo "用法: ./manage.sh {start|stop|restart|status|open|test}"
        echo ""
        echo "命令说明:"
        echo "  start   - 启动游戏服务器"
        echo "  stop    - 停止游戏服务器"
        echo "  restart - 重启游戏服务器"
        echo "  status  - 查看服务器状态"
        echo "  open    - 在浏览器中打开游戏"
        echo "  test    - 打开模块测试页面"
        echo ""
        exit 1
        ;;
esac
