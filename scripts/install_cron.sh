#!/bin/bash
# Teresa 学习报告定时任务安装脚本
# 安装后会自动执行:
# - 每天 21:00 (晚上9点) 发送日报
# - 每周六 22:00 (晚上10点) 发送周报
# - 每月最后一天 19:00 (晚上7点) 发送月报

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPORT_SCRIPT="$SCRIPT_DIR/send_reports.py"

# 添加 cron 任务
(crontab -l 2>/dev/null | grep -v "send_reports.py"; echo "0 21 * * * /usr/bin/python3 $REPORT_SCRIPT >> ~/teresa-homeschool/reports.log 2>&1") | crontab -
(crontab -l 2>/dev/null | grep -v "send_reports.py"; echo "0 22 * * 6 /usr/bin/python3 $REPORT_SCRIPT weekly >> ~/teresa-homeschool/reports.log 2>&1") | crontab -
(crontab -l 2>/dev/null | grep -v "send_reports.py"; echo "0 19 * * * /usr/bin/python3 $REPORT_SCRIPT monthly >> ~/teresa-homeschool/reports.log 2>&1") | crontab -

echo "✅ 定时任务已安装:"
echo "   - 每天 21:00 发送日报"
echo "   - 每周六 22:00 发送周报"
echo "   - 每月最后一天 19:00 发送月报"

# 显示当前 crontab
echo ""
echo "当前 crontab:"
crontab -l | grep send_reports
