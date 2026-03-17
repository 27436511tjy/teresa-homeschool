#!/bin/bash
# Teresa Homeschool API 启动脚本
# 放在 ~/Library/Application Support/com.teresa.homeschool/ 目录下
# 然后在系统偏好设置中添加为登录项

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$HOME/Library/Logs/teresa-homeschool-api.log"

# 启动Node服务
cd "$SCRIPT_DIR"
nohup node api-server.js >> "$LOG_FILE" 2>&1 &

echo "Teresa Homeschool API 已启动"
echo "日志文件: $LOG_FILE"
echo "访问地址: http://127.0.0.1:3000"
