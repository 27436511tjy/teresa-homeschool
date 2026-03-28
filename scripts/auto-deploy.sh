#!/bin/bash
# Teresa Homeschool 自动检查并部署脚本
# 由 crontab 每5分钟调用一次

REPO_DIR="$HOME/teresa-homeschool"
LOG_FILE="$HOME/teresa-homeschool/auto-deploy.log"

# 进入项目目录
cd $REPO_DIR

# 记录日志
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 检查更新..." >> $LOG_FILE

# 获取远程更新
git fetch origin main

# 获取当前本地和远程的 commit hash
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/main)

# 如果本地与远程不一致，说明有更新
if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 检测到更新: $LOCAL_COMMIT -> $REMOTE_COMMIT" >> $LOG_FILE
    
    # 拉取最新代码
    git pull origin main >> $LOG_FILE 2>&1
    
    # 等待部署
    sleep 30
    
    # 验证网站
    if curl -skI http://42.193.19.146:8888 > /dev/null 2>&1; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 部署成功!" >> $LOG_FILE
        
        # 发送飞书通知
        curl -s -X POST "https://open.feishu.cn/open-apis/bot/v2/hook/$(echo $FEISHU_WEBHOOK_URL | rev | cut -d'/' -f1 | rev)" \
            -H "Content-Type: application/json" \
            -d '{
                "msg_type": "text",
                "content": {
                    "text": "🎓 Teresa\\n\\nTeresa Homeschool 网站已自动更新部署完成\\n\\n访问: http://42.193.19.146:8888"
                }
            }' 2>/dev/null || echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📱 飞书通知跳过 (未配置)" >> $LOG_FILE
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ 部署验证失败" >> $LOG_FILE
    fi
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 无更新" >> $LOG_FILE
fi
