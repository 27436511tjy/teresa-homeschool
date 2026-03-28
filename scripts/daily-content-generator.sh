#!/bin/bash
# Teresa Daily Learning Content Generator
# 每天早上6点自动生成数学和语文学习内容
# 运行环境: 龙虾机 (Mac mini)

HOMESCHOOL_DIR="/Users/tongda/.openclaw/workspace/zhiyuan/homeschool"
LOG_DIR="${HOMESCHOOL_DIR}/logs"
DATE=$(date +%Y-%m-%d)
LOG_FILE="${LOG_DIR}/daily-content-${DATE}.log"

# 创建日志目录
mkdir -p ${LOG_DIR}

echo "========================================" >> ${LOG_FILE}
echo "Daily Content Generator Started: $(date)" >> ${LOG_FILE}

cd ${HOMESCHOOL_DIR}

# 1. 生成数学内容
echo "[$(date '+%H:%M:%S')] Generating Math Content..." >> ${LOG_FILE}
node teresa-math-generator/index.js >> ${LOG_FILE} 2>&1
if [ $? -eq 0 ]; then
    echo "[$(date '+%H:%M:%S')] ✅ Math content generated successfully" >> ${LOG_FILE}
else
    echo "[$(date '+%H:%M:%S')] ⚠️ Math generation failed" >> ${LOG_FILE}
fi

# 2. 生成语文内容
echo "[$(date '+%H:%M:%S')] Generating Chinese Content..." >> ${LOG_FILE}
node teresa-chinese-generator/index.js >> ${LOG_FILE} 2>&1
if [ $? -eq 0 ]; then
    echo "[$(date '+%H:%M:%S')] ✅ Chinese content generated successfully" >> ${LOG_FILE}
else
    echo "[$(date '+%H:%M:%S')] ⚠️ Chinese generation failed" >> ${LOG_FILE}
fi

echo "========================================" >> ${LOG_FILE}
echo "Finished: $(date)" >> ${LOG_FILE}
echo "" >> ${LOG_FILE}
