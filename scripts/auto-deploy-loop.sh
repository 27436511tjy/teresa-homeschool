#!/bin/bash
# Teresa Homeschool 后台自动部署检查脚本
# 替代 crontab 的后台常驻方案（每5分钟检查一次）

LOG_FILE="$HOME/teresa-homeschool/auto-deploy.log"
PID_FILE="$HOME/teresa-homeschool/.autodeploy.pid"

# 如果已有进程在运行，退出
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "[$(date)] 已有进程 $OLD_PID 在运行，退出" >> "$LOG_FILE"
        exit 0
    fi
fi

# 写入当前 PID
echo $$ > "$PID_FILE"
echo "[$(date)] 后台自动部署服务启动 (PID: $$)" >> "$LOG_FILE"

while true; do
    cd "$HOME/teresa-homeschool"
    
    # 获取远程更新
    git fetch origin main 2>/dev/null
    
    LOCAL_COMMIT=$(git rev-parse HEAD 2>/dev/null)
    REMOTE_COMMIT=$(git rev-parse origin/main 2>/dev/null)
    
    if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
        echo "[$(date)] 检测到更新: $LOCAL_COMMIT -> $REMOTE_COMMIT" >> "$LOG_FILE"
        git pull origin main >> "$LOG_FILE" 2>&1
        echo "[$(date)] ✅ 代码已更新" >> "$LOG_FILE"
    fi
    
    sleep 300  # 5分钟
done
