#!/bin/bash
# Teresa Homeschool 自动部署脚本
# 监听 Git 变化，自动部署到 teresa-homeschool.top

REPO_DIR="$HOME/teresa-homeschool"
WEBHOOK_URL="https://teresa-homeschool.top"
PARENT_OPEN_ID="ou_4696b60c009c37025c8e747ca058048c"

echo "=========================================="
echo "  Teresa Homeschool 自动部署监控已启动"
echo "=========================================="
echo "监听目录: $REPO_DIR"
echo "目标网站: $WEBHOOK_URL"
echo ""

# 记录上次 commit hash
LAST_COMMIT=$(cd $REPO_DIR && git rev-parse HEAD 2>/dev/null)
echo "当前版本: $LAST_COMMIT"

# 通知函数
notify_parent() {
    local message="$1"
    echo "📱 发送飞书通知: $message"
    # 这里调用飞书 API 发送通知
    # 实际部署时会通过服务器端 API 发送
}

# 主循环 - 每30秒检查一次
while true; do
    sleep 30
    
    # 进入目录检查
    cd $REPO_DIR
    
    # 获取最新 commit
    CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null)
    
    if [ "$CURRENT_COMMIT" != "$LAST_COMMIT" ]; then
        echo "🔄 检测到更新: $LAST_COMMIT -> $CURRENT_COMMIT"
        
        # 拉取最新代码
        echo "📥 拉取最新代码..."
        git pull origin main
        
        # 提交更改
        if [ $? -eq 0 ]; then
            # 等待部署
            echo "⏳ 等待部署完成..."
            sleep 30
            
            # 验证部署
            if curl -sk --http1.1 $WEBHOOK_URL > /dev/null 2>&1; then
                echo "✅ 部署成功!"
                notify_parent "Teresa Homeschool 网站已自动更新部署完成"
            else
                echo "⚠️ 部署验证失败"
            fi
        fi
        
        LAST_COMMIT=$CURRENT_COMMIT
        echo "--- 等待下一次检查 ---"
    fi
done
