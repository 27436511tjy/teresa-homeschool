#!/bin/bash
# Teresa Homeschool 完整本地服务启动脚本
# 端口: 8848

echo "🦋 ========================================"
echo "   Teresa Homeschool 启动中..."
echo "========================================"

# 1. 启动API服务（豆包AI转发）
echo "[1/2] 启动 API 服务 (端口 8848)..."
cd "$(dirname "$0")"
node api-server.js &
API_PID=$!

sleep 2

# 2. 启动前端服务
echo "[2/2] 启动前端服务 (端口 8848)..."
npx serve -l 8848 . &
FRONTEND_PID=$!

sleep 2

echo ""
echo "========================================"
echo "✅ Teresa Homeschool 启动完成！"
echo ""
echo "访问地址:"
echo "  本地: http://127.0.0.1:8848"
echo "  局域网: http://$(ipconfig getifaddr en0):8848"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo "========================================"

# 保持脚本运行
wait
