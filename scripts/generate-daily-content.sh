#!/bin/bash
# Teresa Daily Content Generator
# 每天自动生成数学 + 语文学习内容
# 运行时间: 每天早上 5:30 AM

HOMESCHOOL_DIR="/Users/tongda/.openclaw/workspace/zhiyuan/homeschool"
LOG_DIR="${HOMESCHOOL_DIR}/logs"
DATE=$(date +%Y-%m-%d)
LOG_FILE="${LOG_DIR}/daily-content-${DATE}.log"

mkdir -p ${LOG_DIR}

echo "========================================" >> ${LOG_FILE}
echo "Daily Content Generator Started: $(date)" >> ${LOG_FILE}

cd ${HOMESCHOOL_DIR}

# 生成数学内容
echo "Generating Math Content..." >> ${LOG_FILE}
node teresa-math-generator/index.js >> ${LOG_FILE} 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Math content generated" >> ${LOG_FILE}
else
    echo "⚠️ Math generation failed" >> ${LOG_FILE}
fi

# 生成语文内容
echo "Generating Chinese Content..." >> ${LOG_FILE}
node teresa-chinese-generator/index.js >> ${LOG_FILE} 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Chinese content generated" >> ${LOG_FILE}
else
    echo "⚠️ Chinese generation failed" >> ${LOG_FILE}
fi

echo "Finished: $(date)" >> ${LOG_FILE}
echo "" >> ${LOG_FILE}
