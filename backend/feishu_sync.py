#!/usr/bin/env python3
"""
飞书同步服务 - 学习进度自动推送给家长
"""

import os
import json
import asyncio
import aiohttp
from datetime import datetime, date
from typing import Dict, List, Optional

DATA_PATH = os.path.join(os.path.dirname(__file__), '../data/student_data.json')

class FeishuSync:
    """飞书同步服务"""
    
    def __init__(self):
        self.webhook_url = os.environ.get('FEISHU_WEBHOOK_URL', '')
        self.parent_chat_id = os.environ.get('FEISHU_PARENT_CHAT_ID', '')
    
    def load_data(self) -> dict:
        """加载学生数据"""
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def save_data(self, data: dict):
        """保存学生数据"""
        with open(DATA_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    async def send_webhook(self, message: str) -> bool:
        """发送飞书 Webhook 消息"""
        if not self.webhook_url:
            print("⚠️ 未配置飞书 Webhook URL")
            return False
        
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "msg_type": "text",
                    "content": {
                        "text": message
                    }
                }
                async with session.post(self.webhook_url, json=payload) as resp:
                    if resp.status == 200:
                        print("✅ 飞书消息发送成功")
                        return True
                    else:
                        print(f"❌ 飞书消息发送失败: {resp.status}")
                        return False
        except Exception as e:
            print(f"❌ 飞书消息发送异常: {e}")
            return False
    
    async def send_daily_plan(self, plan: dict):
        """发送每日学习计划"""
        today = date.today().strftime("%Y-%m-%d")
        
        message = f"""
🎓 **Teresa 每日学习计划** 📅 {today}

📖 **英语**
• 阅读: {plan.get('english', {}).get('reading', 'Because of Winn-Dixie')}
• 好词积累: {plan.get('english', {}).get('vocabulary', '3个生词')}
• 口语练习: {plan.get('english', {}).get('speaking', '复述故事')}

🔢 **数学**
• 课内练习: {plan.get('math', {}).get('practice', '两位数加减法')}
• 奥数思维: {plan.get('math', {}).get('olympiad', '找规律游戏')} (10分钟)
• 错题本: {plan.get('math', {}).get('wrong_notes', '复习上周错题')}

📝 **中文**
• 阅读: {plan.get('chinese', {}).get('reading', '中文桥梁书20分钟')}
• 日记: {plan.get('chinese', {}).get('diary', '记录今天最开心的事')}
• 写作: {plan.get('chinese', {}).get('writing', '用中文写一段话')}

🏃 **运动**
• 户外活动: {plan.get('exercise', {}).get('outdoor', '30分钟')}
• 眼保健: {plan.get('exercise', {}).get('eye_break', '每20分钟休息')}

🌟 今日加油！让学习变得有趣又好玩！
"""
        
        await self.send_webhook(message)
    
    async def send_progress_update(self, progress: dict):
        """发送学习进度更新"""
        today = date.today().strftime("%Y-%m-%d")
        
        # 计算完成百分比
        total_items = 8  # 总学习项目数
        completed = 0
        
        if progress.get('english', {}).get('reading_pages', 0) > 0:
            completed += 1
        if progress.get('english', {}).get('vocabulary_count', 0) > 0:
            completed += 1
        if progress.get('english', {}).get('speaking_done', False):
            completed += 1
        if progress.get('math', {}).get('practice_done', False):
            completed += 1
        if progress.get('math', {}).get('olympiad_done', False):
            completed += 1
        if progress.get('chinese', {}).get('diary_written', False):
            completed += 1
        if progress.get('exercise', {}).get('minutes', 0) >= 30:
            completed += 1
        if progress.get('pbl', {}).get('project_selected'):
            completed += 1
        
        percentage = int(completed / total_items * 100)
        
        emoji = "🌅" if percentage < 50 else "🌤️" if percentage < 100 else "🎉"
        
        message = f"""
{emoji} **Teresa 今日学习进度** ({today})

📊 完成度: **{percentage}%** ({completed}/{total_items})

📖 英语: 阅读 {progress.get('english', {}).get('reading_pages', 0)} 页 | 词汇 {progress.get('english', {}).get('vocabulary_count', 0)} 个
🔢 数学: {'✅ 练习' if progress.get('math', {}).get('practice_done') else '⏳ 练习'} | {'✅ 奥数' if progress.get('math', {}).get('olympiad_done') else '⏳ 奥数'}
📝 中文: {'✅ 日记' if progress.get('chinese', {}).get('diary_written') else '⏳ 日记'}
🏃 运动: {progress.get('exercise', {}).get('minutes', 0)} 分钟

{'🎊 今日学习全部完成！太棒了！' if percentage == 100 else '💪 继续加油！'}
"""
        
        await self.send_webhook(message)
    
    async def send_pbl_update(self, project: dict, step: int = None):
        """发送 PBL 项目更新"""
        if step:
            message = f"""
🔬 **PBL 项目进度更新**

📌 项目: {project.get('title', '未命名')}
📝 今日步骤: {step}
💡 状态: 进行中

加油！你在做一件很棒的事情！ 🌟
"""
        else:
            message = f"""
🎉 **Teresa 选择了新 PBL 项目！**

📌 项目: {project.get('title', '未命名')}
📖 类型: {project.get('type', '未知')}
📝 描述: {project.get('description', '无')}
⏱️ 预计: {project.get('duration', '未知')}
🎯 技能: {', '.join(project.get('skills', []))}

期待看到 Teresa 的成果！ 🌈
"""
        
        await self.send_webhook(message)
    
    async def send_weekly_summary(self, week_data: dict):
        """发送周总结"""
        message = f"""
� **Teresa 本周学习总结**

📖 英语阅读: {week_data.get('english_pages', 0)} 页
🔢 数学练习: {week_data.get('math_sessions', 0)} 次
📝 中文写作: {week_data.get('chinese_entries', 0)} 篇
🏃 运动时间: {week_data.get('exercise_minutes', 0)} 分钟
🔬 PBL项目: {week_data.get('pbl_completed', 0)} 个

🌟 精彩的一周！下周继续加油！
"""
        
        await self.send_webhook(message)


# 测试同步服务
async def test_sync():
    sync = FeishuSync()
    
    # 测试发送每日计划
    print("\n🧪 测试发送每日学习计划...")
    await sync.send_daily_plan({
        'english': {'reading': 'Because of Winn-Dixie', 'vocabulary': '3个生词', 'speaking': '复述故事'},
        'math': {'practice': '两位数加减法', 'olympiad': '找规律游戏', 'wrong_notes': '复习上周错题'},
        'chinese': {'reading': '中文桥梁书20分钟', 'diary': '记录今天最开心的事', 'writing': '用中文写一段话'},
        'exercise': {'outdoor': '30分钟', 'eye_break': '每20分钟休息'}
    })
    
    # 测试发送进度
    print("\n🧪 测试发送学习进度...")
    await sync.send_progress_update({
        'english': {'reading_pages': 25, 'vocabulary_count': 3, 'speaking_done': False},
        'math': {'practice_done': True, 'olympiad_done': False},
        'chinese': {'diary_written': True},
        'exercise': {'minutes': 30},
        'pbl': {'project_selected': '探索日本文化'}
    })
    
    # 测试发送 PBL 更新
    print("\n🧪 测试发送 PBL 项目更新...")
    await sync.send_pbl_update({
        'title': '探索日本文化',
        'type': 'World Study',
        'description': '了解日本的传统节日、美食、动漫文化',
        'duration': '5天',
        'skills': ['英语', '研究', '创造力']
    })


if __name__ == "__main__":
    asyncio.run(test_sync())
