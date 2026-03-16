#!/usr/bin/env python3
"""
Teresa 学习报告定时发送脚本
- 每天晚上 9 点发送日报
- 每周六晚上 10 点发送周报
- 每月最后一天晚上 7 点发送月报
"""

import os
import json
import asyncio
import aiohttp
from datetime import datetime, date, timedelta
from pathlib import Path

# 配置
DATA_FILE = "/var/www/teresa-homeschool/data/student_data.json"
OPENCLAW_DATA_FILE = os.path.expanduser("~/.openclaw/workspace/zhiyuan/homeschool/data/student_data.json")

# 飞书配置 (使用 OpenClaw 的应用)
APP_ID = "cli_a9389539ceb81bd8"
APP_SECRET = "TEwNXahmqhSyTuetR4kYvetLptinIBgg"
PARENT_OPEN_ID = "ou_4696b60c009c37025c8e747ca058048c"


async def get_tenant_token():
    """获取飞书 tenant_access_token"""
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json={"app_id": APP_ID, "app_secret": APP_SECRET}) as resp:
            data = await resp.json()
            return data.get("tenant_access_token")


async def send_feishu_message(token: str, open_id: str, message: str) -> bool:
    """发送飞书消息"""
    url = f"https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=open_id"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "receive_id": open_id,
        "msg_type": "text",
        "content": json.dumps({"text": message})
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, headers=headers) as resp:
            return resp.status == 200


def load_data() -> dict:
    """加载学习数据"""
    # 尝试多个可能的路径
    for path in [DATA_FILE, OPENCLAW_DATA_FILE]:
        if os.path.exists(path):
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                pass
    
    # 返回默认数据
    return {
        "student": {"name": "Teresa"},
        "daily_progress": {},
        "english": {"books_read": []},
        "tennis": []
    }


def generate_daily_report(data: dict) -> str:
    """生成日报"""
    today = date.today()
    date_str = today.strftime("%Y年%m月%d日")
    
    progress = data.get("daily_progress", {}).get(today.isoformat(), {})
    
    # 统计任务完成情况
    tasks = {
        "english-reading": "📚 英语阅读",
        "english-writing": "📝 英语写作",
        "math-practice": "🔢 数学练习",
        "math-quiz": "🧮 数学测验",
        "chinese-history": "🇨🇳 语文历史",
        "chinese-writing": "✏️ 语文写作",
        "pbl-project": "🦎 PBL项目"
    }
    
    completed = []
    for task_id, task_name in tasks.items():
        if progress.get(task_id, False):
            completed.append(f"✅ {task_name}")
    
    completed_text = "\n".join(completed) if completed else "暂无完成的任务"
    
    message = f"""📊 Teresa 每日学习报告 ({date_str})

🎯 今日完成情况:
{completed_text}

📈 学习数据:
• 阅读书籍: {len(data.get('english', {}).get('books_read', []))} 本
• 网球训练: {len(data.get('tennis', []))} 次

🌟 继续加油！"""
    
    return message


def generate_weekly_report(data: dict) -> str:
    """生成周报"""
    today = date.today()
    week_start = today - timedelta(days=today.weekday() + 1)  # 上周六
    week_end = week_start + timedelta(days=6)
    
    # 统计本周数据
    week_progress = {}
    for i in range(7):
        day = week_start + timedelta(days=i)
        day_str = day.isoformat()
        if day_str in data.get("daily_progress", {}):
            week_progress[day_str] = data["daily_progress"][day_str]
    
    total_tasks = len(week_progress) * 7
    completed_tasks = sum(
        sum(1 for v in day.values() if v)
        for day in week_progress.values()
    )
    
    message = f"""📊 Teresa 本周学习报告 ({week_start.strftime('%m/%d')}-{week_end.strftime('%m/%d')})

🎯 本周完成:
• 学习天数: {len(week_progress)}/7 天
• 完成任务: {completed_tasks}/{total_tasks}
• 完成率: {int(completed_tasks/total_tasks*100) if total_tasks > 0 else 0}%

📚 阅读书籍: {len(data.get('english', {}).get('books_read', []))} 本
🎾 网球训练: {len(data.get('tennis', []))} 次

🌟 下周继续努力！"""
    
    return message


def generate_monthly_report(data: dict) -> str:
    """生成月报"""
    today = date.today()
    month_start = today.replace(day=1)
    
    # 统计本月数据
    month_progress = {}
    for day_str, progress in data.get("daily_progress", {}).items():
        try:
            day = datetime.strptime(day_str, "%Y-%m-%d").date()
            if day.month == today.month and day.year == today.year:
                month_progress[day_str] = progress
        except:
            pass
    
    message = f"""📊 Teresa {today.year}年{today.month}月 学习报告

🎯 本月完成:
• 学习天数: {len(month_progress)} 天

📚 阅读书籍: {len(data.get('english', {}).get('books_read', []))} 本
🎾 网球训练: {len(data.get('tennis', []))} 次

🌟 精彩的一个月！下月继续加油！"""
    
    return message


async def main():
    now = datetime.now()
    today = now.date()
    weekday = now.weekday()  # 0=周一, 5=周六, 6=周日
    
    # 检查是否是报告发送时间
    report_type = None
    
    # 每天晚上 9 点 - 日报
    if now.hour == 21:
        report_type = "daily"
    
    # 每周六晚上 10 点 - 周报
    if weekday == 5 and now.hour == 22:
        report_type = "weekly"
    
    # 每月最后一天晚上 7 点 - 月报
    if today.day == calendar.monthrange(today.year, today.month)[1] and now.hour == 19:
        report_type = "monthly"
    
    if not report_type:
        print(f"⏰ {now.strftime('%Y-%m-%d %H:%M:%S')} - 不是报告发送时间 (使用命令行参数强制发送)")
        # 允许通过命令行参数强制发送
        if len(sys.argv) > 1 and sys.argv[1] in ["daily", "weekly", "monthly"]:
            report_type = sys.argv[1]
            print(f"🔧 强制发送 {report_type} 报告...")
        else:
            print("用法: python3 send_reports.py [daily|weekly|monthly]")
            sys.exit(0)
    
    print(f"📤 开始发送 {report_type} 报告...")
    
    # 加载数据
    data = load_data()
    
    # 生成报告
    if report_type == "daily":
        message = generate_daily_report(data)
    elif report_type == "weekly":
        message = generate_weekly_report(data)
    else:
        message = generate_monthly_report(data)
    
    # 发送飞书消息
    token = await get_tenant_token()
    if token:
        success = await send_feishu_message(token, PARENT_OPEN_ID, message)
        if success:
            print(f"✅ {report_type} 报告发送成功!")
        else:
            print(f"❌ {report_type} 报告发送失败!")
    else:
        print("❌ 获取飞书 token 失败!")


if __name__ == "__main__":
    import calendar
    import sys
    
    # 支持命令行参数用于测试
    # python3 send_reports.py daily - 发送日报
    # python3 send_reports.py weekly - 发送周报
    # python3 send_reports.py monthly - 发送月报
    
    report_type = None
    if len(sys.argv) > 1:
        report_type = sys.argv[1]
    else:
        # 检查是否是报告发送时间
        now = datetime.now()
        today = now.date()
        weekday = now.weekday()  # 0=周一, 5=周六, 6=周日
        
        # 每天晚上 9 点 - 日报
        if now.hour == 21:
            report_type = "daily"
        
        # 每周六晚上 10 点 - 周报
        if weekday == 5 and now.hour == 22:
            report_type = "weekly"
        
        # 每月最后一天晚上 7 点 - 月报
        if today.day == calendar.monthrange(today.year, today.month)[1] and now.hour == 19:
            report_type = "monthly"
    
    if not report_type:
        print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - 不是报告发送时间")
        print("用法: python3 send_reports.py [daily|weekly|monthly]")
        sys.exit(0)
    
    asyncio.run(main())
