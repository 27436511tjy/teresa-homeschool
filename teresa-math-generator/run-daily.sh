#!/bin/bash
# Teresa Math Daily Generator - Cron Job Script
# 运行时间: 每天早上 5:30 AM

# 配置
HOMESCHOOL_DIR="/Users/tongda/.openclaw/workspace/zhiyuan/homeschool"
LOG_DIR="${HOMESCHOOL_DIR}/logs"
DATE=$(date +%Y-%m-%d)
LOG_FILE="${LOG_DIR}/math-generator-${DATE}.log"

# 创建日志目录
mkdir -p ${LOG_DIR}

# 记录开始
echo "========================================" >> ${LOG_FILE}
echo "Math Generator Started: $(date)" >> ${LOG_FILE}

# 切换到项目目录
cd ${HOMESCHOOL_DIR}

# 检查并安装依赖
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..." >> ${LOG_FILE}
    npm install >> ${LOG_FILE} 2>&1
fi

# 运行生成器
echo "Running math content generator..." >> ${LOG_FILE}
node teresa-math-generator/index.js >> ${LOG_FILE} 2>&1

# 检查结果
if [ $? -eq 0 ]; then
    echo "Math content generated successfully!" >> ${LOG_FILE}
    
    # 可选：发送通知到飞书
    # curl -X POST "YOUR_WEBHOOK" -H "Content-Type: application/json" -d '{"msg_type":"text","content":{"text":"✅ Teresa数学内容已生成: '"${DATE}"'"}}'
else
    echo "ERROR: Math content generation failed!" >> ${LOG_FILE}
fi

echo "Finished: $(date)" >> ${LOG_FILE}
echo "" >> ${LOG_FILE}
