#!/usr/bin/env python3
"""
Teresa's Homeschool AI Tutor - Backend Service
专属私人 AI 家教网站后端服务
"""

import os
import json
import logging
from datetime import datetime, date
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
import asyncio

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 加载配置 (使用 JSON)
CONFIG_PATH = os.path.join(os.path.dirname(__file__), '../config/system.json')

def load_config():
    with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

try:
    config = load_config()
except:
    # 如果配置文件不存在，使用默认配置
    config = {
        "student": {
            "name": "Teresa",
            "age": 8.5,
            "grade": 3
        },
        "apis": {
            "xfyun": {"model": "spark-4.0"},
            "kimi": {"model": "moonshot-v1-8k"},
            "mathgpt": {"model": "mathgpt-pro"},
            "minimax": {"model": "MiniMax-M2.5"}
        }
    }

@dataclass
class Student:
    name: str = "Teresa"
    age: float = 8.5
    grade: int = 3
    english_ar: float = 6.0
    current_book: str = "Because of Winn-Dixie"
    daily_reading_pages: tuple = (30, 50)

@dataclass
class DailyPlan:
    date: str
    english: Dict
    math: Dict
    chinese: Dict
    exercise: Dict
    pbl: Optional[Dict] = None

class ModelDispatcher:
    """模型调度器 - 根据任务类型选择对应模型"""
    
    def __init__(self, config):
        self.config = config
        self.apis = config.get('apis', {})
    
    async def call_xfyun(self, prompt: str, system_prompt: str = "") -> str:
        """调用讯飞星火 4.0 - 主家教模型"""
        # TODO: 实现讯飞星火 API 调用
        # API配置: self.apis.get('xfyun', {})
        logger.info("📡 调用讯飞星火 4.0 主家教模型")
        
        # 模拟响应
        responses = {
            "reading": f"太棒了！Teresa，{self.config.get('student', {}).get('current_book', '这本书')} 里你觉得最有趣的是什么？",
            "vocabulary": f"Let's learn a new word! 今天我们学习... (准备一个适合8岁孩子的词汇)",
            "speaking": f"Great job! Try to tell me more about... (用美式英语鼓励孩子)"
        }
        return responses.get(prompt[:20], f"好的！让我们一起学习吧！😊")
    
    async def call_kimi(self, prompt: str, system_prompt: str = "") -> str:
        """调用 Kimi K2.5 - 阅读/长文本模型"""
        logger.info("📡 调用 Kimi K2.5 阅读模型")
        return f"让我帮你分析这段阅读内容... 📚 {prompt[:30]}"
    
    async def call_mathgpt(self, prompt: str, system_prompt: str = "") -> str:
        """调用学而思九章 MathGPT - 数学专项"""
        logger.info("📡 调用学而思九章 MathGPT 数学模型")
        
        # 根据题目类型提供不同响应
        if "奥数" in prompt or "olympiad" in prompt.lower():
            return "🔢 找规律游戏：观察数列 2, 4, 6, 8, ... 下一个是什么？答案是 10！因为每次加 2！"
        else:
            return "📝 数学练习：35 + 27 = 62，竖式计算时记得进位哦！"
    
    async def call_minimax(self, prompt: str, system_prompt: str = "") -> str:
        """调用 MiniMax M2.5 - 系统调度与飞书同步"""
        logger.info("📡 调用 MiniMax M2.5 系统调度")
        return f"系统调度响应: {prompt[:30]}..."

class FeishuNotifier:
    """飞书通知服务"""
    
    def __init__(self, config):
        self.config = config
        self.webhook_url = os.environ.get('FEISHU_WEBHOOK_URL', '')
    
    async def send_daily_plan(self, plan: DailyPlan) -> bool:
        """发送每日学习计划给家长"""
        logger.info(f"📱 同步每日学习计划到飞书: {plan.date}")
        # TODO: 实现飞书 webhook 发送
        message = f"""
🎓 **Teresa 每日学习计划** 📅 {plan.date}

📖 **英语**
• 阅读: {plan.english.get('阅读', 'Because of Winn-Dixie')}
• 好词积累: {plan.english.get('好词积累', '3个生词')}
• 口语练习: {plan.english.get('口语练习', '复述故事')}

🔢 **数学**
• 课内: {plan.math.get('课内', '两位数加减法')}
• 奥数: {plan.math.get('奥数思维', '找规律游戏')}
• 错题本: {plan.math.get('错题本', '复习上周错题')}

📝 **中文**
• 阅读: {plan.chinese.get('阅读', '中文桥梁书')}
• 日记: {plan.chinese.get('日记', '记录今天')}
• 写作: {plan.chinese.get('写作', '写一段话')}

🏃 **运动**
• 户外: {plan.exercise.get('运动', '30分钟')}

🌟 今日加油！
"""
        logger.info(f"📱 飞书消息: {message[:100]}...")
        return True
    
    async def send_progress(self, progress: Dict) -> bool:
        """发送学习进度"""
        logger.info("📱 同步学习进度到飞书")
        return True
    
    async def send_pbl_update(self, pbl_info: Dict) -> bool:
        """发送 PBL 项目更新"""
        logger.info("📱 同步 PBL 项目进度到飞书")
        return True

class TeresaTutor:
    """Teresa 专属 AI 家教"""
    
    def __init__(self):
        self.config = config
        self.model_dispatcher = ModelDispatcher(config)
        self.feishu = FeishuNotifier(config)
        self.student = Student()
    
    async def generate_daily_plan(self) -> DailyPlan:
        """生成每日学习计划"""
        today = date.today().strftime("%Y-%m-%d")
        
        # 模拟生成的计划
        plan = DailyPlan(
            date=today,
            english={
                "阅读": f"阅读 {self.student.current_book}，30-50页",
                "阅读理解": "与 AI 讨论书中内容",
                "好词积累": "记录 3 个生词",
                "口语练习": "复述故事给 AI 听"
            },
            math={
                "课内": "两位数加减法练习",
                "奥数思维": "找规律游戏（10分钟）",
                "错题本": "复习上周错题"
            },
            chinese={
                "阅读": "中文桥梁书 20 分钟",
                "日记": "记录今天最开心的事",
                "写作": "用中文写一段话"
            },
            exercise={
                "运动": "户外活动 30 分钟",
                "眼保健": "每 20 分钟休息眼睛"
            },
            pbl={
                "本周项目": "选择 1 个 PBL 项目",
                "今日任务": "完成项目第一步"
            }
        )
        
        # 同步到飞书
        await self.feishu.send_daily_plan(plan)
        
        return plan
    
    async def english_tutor(self, task_type: str, input_data: Dict) -> Dict:
        """英语模块辅导"""
        if task_type == "reading":
            response = await self.model_dispatcher.call_kimi(
                f"Teresa 正在阅读 {self.student.current_book}，帮她理解内容",
                "你是一位耐心的英语家教，用简单有趣的方式与孩子对话"
            )
        elif task_type == "vocabulary":
            response = await self.model_dispatcher.call_xfyun(
                f"帮助 Teresa 积累好词",
                "用适合8岁孩子的方式讲解新单词"
            )
        elif task_type == "speaking":
            response = await self.model_dispatcher.call_xfyun(
                f"与 Teresa 进行英语口语对话",
                "用美式英语，鼓励孩子大胆说，耐心纠错"
            )
        
        return {"status": "success", "response": response, "type": task_type}
    
    async def math_tutor(self, task_type: str, input_data: Dict) -> Dict:
        """数学模块辅导"""
        response = await self.model_dispatcher.call_mathgpt(
            f"Teresa 需要 {task_type}",
            "讲解清晰，课内为主，不超难，用例子帮助理解"
        )
        return {"status": "success", "response": response, "type": task_type}
    
    async def chinese_tutor(self, task_type: str, input_data: Dict) -> Dict:
        """中文模块辅导"""
        response = await self.model_dispatcher.call_xfyun(
            f"Teresa 需要 {task_type}",
            "用适合8岁孩子的方式，耐心鼓励"
        )
        return {"status": "success", "response": response, "type": task_type}
    
    async def generate_weekly_pbl(self) -> List[Dict]:
        """生成每周 PBL 项目推荐"""
        projects = [
            {
                "id": 1,
                "type": "World Study",
                "title": "探索日本文化",
                "title_emoji": "🗾",
                "description": "了解日本的传统节日、美食、动漫文化",
                "duration": "5天",
                "skills": ["英语", "研究", "创造力"]
            },
            {
                "id": 2,
                "type": "跨学科融合",
                "title": "数学与烹饪",
                "title_emoji": "🍰",
                "description": "用食谱学习分数和测量",
                "duration": "3天",
                "skills": ["数学", "生活技能", "实践"]
            },
            {
                "id": 3,
                "type": "科学探究",
                "title": "植物生长观察",
                "title_emoji": "🌱",
                "description": "种植豆芽，记录生长过程",
                "duration": "7天",
                "skills": ["科学", "观察", "记录"]
            },
            {
                "id": 4,
                "type": "社会探索",
                "title": "社区调研",
                "title_emoji": "🏘️",
                "description": "访谈邻居，了解社区故事",
                "duration": "4天",
                "skills": ["社交", "调研", "表达"]
            }
        ]
        
        logger.info(f"📚 生成了 {len(projects)} 个 PBL 项目供选择")
        return projects
    
    async def guide_pbl_step(self, project: Dict, step: int) -> Dict:
        """指导 PBL 项目步骤"""
        response = await self.model_dispatcher.call_minimax(
            f"引导 Teresa 完成项目 {project['title']} 的第 {step} 步",
            "分步骤引导，提问式教学，鼓励动手实践"
        )
        return {"step": step, "guidance": response}

# 主程序入口
async def main():
    tutor = TeresaTutor()
    
    # 1. 生成每日计划
    print("\n" + "="*50)
    print("🎓 Teresa's Homeschool AI Tutor")
    print("="*50)
    
    plan = await tutor.generate_daily_plan()
    print(f"\n📅 {plan.date} 每日学习计划")
    print(f"\n📖 英语:")
    for k, v in plan.english.items():
        print(f"   • {k}: {v}")
    print(f"\n🔢 数学:")
    for k, v in plan.math.items():
        print(f"   • {k}: {v}")
    print(f"\n📝 中文:")
    for k, v in plan.chinese.items():
        print(f"   • {k}: {v}")
    print(f"\n🏃 运动:")
    for k, v in plan.exercise.items():
        print(f"   • {k}: {v}")
    
    # 2. 生成 PBL 项目
    print("\n" + "="*50)
    print("📚 本周 PBL 项目推荐")
    print("="*50)
    
    projects = await tutor.generate_weekly_pbl()
    for p in projects:
        print(f"\n{p['title_emoji']} {p['title']} ({p['type']})")
        print(f"   {p['description']}")
        print(f"   ⏱️ {p['duration']} | 🎯 {', '.join(p['skills'])}")
    
    # 3. 测试英语辅导
    print("\n" + "="*50)
    print("🗣️ 英语口语练习测试")
    print("="*50)
    result = await tutor.english_tutor("speaking", {})
    print(f"AI 老师: {result['response']}")
    
    # 4. 测试数学辅导
    print("\n" + "="*50)
    print("🧮 数学奥数测试")
    print("="*50)
    result = await tutor.math_tutor("奥数思维", {})
    print(f"AI 老师: {result['response']}")
    
    print("\n" + "="*50)
    print("✅ 系统初始化完成！")
    print("="*50)
    print("\n📁 项目结构:")
    print("   /workspace/homeschool/")
    print("   ├── config/system.json  (配置文件)")
    print("   ├── backend/tutor.py    (后端服务)")
    print("   ├── backend/feishu_sync.py (飞书同步)")
    print("   ├── data/student_data.json (学习数据)")
    print("   └── frontend/index.html  (前端界面)")
    print("\n🌐 打开 frontend/index.html 即可开始使用！")

if __name__ == "__main__":
    asyncio.run(main())
