#!/bin/bash
# 同时启动前端和API服务

echo "启动 Teresa Homeschool 服务..."

# 启动API服务 (端口3000)
cd "$(dirname "$0")"
node api-server.js &
API_PID=$!

# 启动前端服务 (端口8080)
npx serve -l 8080 &
FRONTEND_PID=$!

echo "==================================="
echo "服务已启动:"
echo "  前端: http://127.0.0.1:8080"
echo "  API:  http://127.0.0.1:3000"
echo "==================================="
echo "按 Ctrl+C 停止所有服务"

# 等待
wait
