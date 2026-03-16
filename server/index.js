const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// 读取数据
const dataPath = path.join(__dirname, '../data/student_data.json');
let studentData = require(dataPath);

// 保存数据
function saveData() {
    fs.writeFileSync(dataPath, JSON.stringify(studentData, null, 2));
}

// API 配置
const API_CONFIG = {
    xfyun: {
        endpoint: process.env.XFYUN_ENDPOINT || 'https://spark-api.xf-yun.com/v4.0/chat',
        model: 'spark-4.0'
    },
    kimi: {
        endpoint: 'https://api.moonshot.cn/v1/chat/completions',
        model: 'moonshot-v1-8k'
    },
    mathgpt: {
        endpoint: process.env.MATHGPT_ENDPOINT || 'https://jiuzhang.istudy.net.cn/api/v1/chat/completions',
        model: 'mathgpt-pro'
    },
    minimax: {
        endpoint: 'https://api.minimax.chat/v1/text/chatcompletion_v2',
        model: 'MiniMax-M2.5'
    }
};

// ==================== API 路由 ====================

// 1. 获取学生信息
app.get('/api/student', (req, res) => {
    res.json(studentData.student);
});

// 2. 获取统计数据
app.get('/api/stats', (req, res) => {
    res.json({
        booksRead: studentData.student.english.books_read?.length || 0,
        wordsLearned: studentData.student.english.vocabulary?.length || 0,
        streakDays: 5 // 模拟连续学习天数
    });
});

// 3. 获取每日计划
app.get('/api/daily-plan', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    if (!studentData.daily_progress[today]) {
        studentData.daily_progress[today] = generateDailyPlan(today);
        saveData();
    }
    res.json(studentData.daily_progress[today]);
});

// 生成每日计划
function generateDailyPlan(date) {
    return {
        date,
        english: {
            reading: { title: '阅读', content: '阅读 Because of Winn-Dixie，30-50页', done: false },
            vocabulary: { title: '好词积累', content: '记录 3 个生词', done: false },
            comprehension: { title: '阅读理解', content: '与 AI 讨论书中内容', done: false },
            speaking: { title: '口语练习', content: '复述故事给 AI 听', done: false }
        },
        math: {
            practice: { title: '课内练习', content: '两位数加减法练习', done: false },
            olympiad: { title: '奥数思维', content: '找规律游戏（10分钟）', done: false },
            wrongNotes: { title: '错题本', content: '复习上周错题', done: false }
        },
        chinese: {
            reading: { title: '阅读', content: '中文桥梁书 20 分钟', done: false },
            diary: { title: '日记', content: '记录今天最开心的事', done: false },
            writing: { title: '写作', content: '用中文写一段话', done: false }
        },
        science: {
            observation: { title: '自然观察', content: '记录身边的科学发现', done: false },
            experiment: { title: '小实验', content: '动手做科学实验', done: false }
        },
        exercise: {
            outdoor: { title: '户外运动', content: '户外活动 30 分钟', done: false },
            eyeBreak: { title: '眼保健', content: '每 20 分钟休息眼睛', done: false }
        }
    };
}

// 4. 获取 PBL 项目列表
app.get('/api/pbl-projects', (req, res) => {
    res.json({
        projects: [
            { id: 1, type: 'World Study', title: '探索日本文化', emoji: '🗾', description: '了解日本的传统节日、美食、动漫文化，学习日语问候语', duration: '5天', skills: ['英语', '研究', '创造力'] },
            { id: 2, type: '跨学科', title: '数学与烹饪', emoji: '🍰', description: '用食谱学习分数、计量和乘法', duration: '3天', skills: ['数学', '生活技能', '实践'] },
            { id: 3, type: '科学探究', title: '植物生长观察', emoji: '🌱', description: '种植豆芽，记录生长过程，绘制图表', duration: '7天', skills: ['科学', '观察', '记录'] },
            { id: 4, type: '社会探索', title: '社区调研', emoji: '🏘️', description: '访谈邻居，绘制社区地图，记录故事', duration: '4天', skills: ['社交', '调研', '表达'] },
            { id: 5, type: '艺术创作', title: '绘本创作', emoji: '🎨', description: '用英语创作自己的绘本故事', duration: '5天', skills: ['英语', '创意', '写作'] }
        ],
        selected: studentData.pbl_projects.active
    });
});

// 5. 选择 PBL 项目
app.post('/api/pbl/select', (req, res) => {
    const { projectId } = req.body;
    const projects = [
        { id: 1, type: 'World Study', title: '探索日本文化', emoji: '🗾', description: '了解日本的传统节日、美食、动漫文化', duration: '5天', skills: ['英语', '研究', '创造力'] },
        { id: 2, type: '跨学科', title: '数学与烹饪', emoji: '🍰', description: '用食谱学习分数和测量', duration: '3天', skills: ['数学', '生活技能', '实践'] },
        { id: 3, type: '科学探究', title: '植物生长观察', emoji: '🌱', description: '种植豆芽，记录生长过程', duration: '7天', skills: ['科学', '观察', '记录'] },
        { id: 4, type: '社会探索', title: '社区调研', emoji: '🏘️', description: '访谈邻居，了解社区故事', duration: '4天', skills: ['社交', '调研', '表达'] },
        { id: 5, type: '艺术创作', title: '绘本创作', emoji: '🎨', description: '用英语创作自己的绘本故事', duration: '5天', skills: ['英语', '创意', '写作'] }
    ];
    
    const selected = projects.find(p => p.id === projectId);
    if (selected) {
        studentData.pbl_projects.active = selected;
        if (!studentData.pbl_projects.completed) studentData.pbl_projects.completed = [];
        saveData();
        
        // 通知飞书
        notifyFeishu(`🎉 Teresa 选择了新 PBL 项目！\n\n${selected.emoji} ${selected.title}\n📝 ${selected.description}\n⏱️ 预计 ${selected.duration}`);
    }
    res.json({ success: true, project: selected });
});

// 6. AI 对话接口
app.post('/api/chat', async (req, res) => {
    const { subject, message, context } = req.body;
    
    console.log(`💬 Chat request: ${subject} - ${message.substring(0, 50)}...`);
    
    // 调用 AI 模型
    let response = '';
    let emoji = '🦋';
    
    try {
        response = await callAI(subject, message, context);
        emoji = getSubjectEmoji(subject);
    } catch (e) {
        console.error('AI 调用失败:', e);
        response = getFallbackResponse(subject, message);
    }
    
    res.json({ response, emoji });
});

// 7. 更新学习进度
app.post('/api/progress/update', (req, res) => {
    const { subject, task, done } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    if (!studentData.daily_progress[today]) {
        studentData.daily_progress[today] = generateDailyPlan(today);
    }
    
    if (studentData.daily_progress[today][subject] && studentData.daily_progress[today][subject][task]) {
        studentData.daily_progress[today][subject][task].done = done;
    }
    
    saveData();
    
    // 检查是否完成全部任务
    checkDailyCompletion(today);
    
    res.json({ success: true });
});

// 8. 飞书同步测试
app.get('/api/feishu/test', async (req, res) => {
    const result = await notifyFeishu('🧪 测试消息：Teresa 的 AI 学习系统已升级！');
    res.json({ success: result });
});

// 9. 发送学习报告到家长飞书
app.post('/api/feishu/send', async (req, res) => {
    const { open_id, message } = req.body;
    
    if (!open_id || !message) {
        return res.json({ success: false, error: '缺少必要参数' });
    }
    
    // 使用机器人发送私信消息
    const result = await sendFeishuDM(open_id, message);
    res.json({ success: result });
});

// 10. 提交阅读报告
app.post('/api/reading/report', async (req, res) => {
    const { book, pages, summary, favoritePart, newWords } = req.body;
    
    // 保存阅读记录
    if (!studentData.student.english.books_read) {
        studentData.student.english.books_read = [];
    }
    
    const report = {
        date: new Date().toISOString().split('T')[0],
        book,
        pages,
        summary,
        favoritePart,
        newWords: newWords || []
    };
    
    studentData.student.english.books_read.push(report);
    saveData();
    
    // 通知飞书
    await notifyFeishu(`📚 Teresa 完成了阅读报告！\n\n📖 书名: ${book}\n📄 页数: ${pages} 页\n💡 最喜欢的部分: ${favoritePart}`);
    
    res.json({ success: true, report });
});

// 10. 提交日记
app.post('/api/diary/write', async (req, res) => {
    const { content, mood } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    if (!studentData.student.chinese.diary_entries) {
        studentData.student.chinese.diary_entries = [];
    }
    
    const entry = {
        date: today,
        content,
        mood: mood || '😊'
    };
    
    studentData.student.chinese.diary_entries.push(entry);
    saveData();
    
    res.json({ success: true, entry });
});

// ==================== AI 调用函数 ====================

async function callAI(subject, message, context) {
    // 这里应该调用真实的 API
    // 由于没有配置密钥，使用智能模拟响应
    
    const lowerMsg = message.toLowerCase();
    
    // 根据科目和消息内容生成个性化响应
    switch(subject) {
        case 'english':
            return getEnglishAIResponse(lowerMsg, message);
        case 'math':
            return getMathAIResponse(lowerMsg, message);
        case 'chinese':
            return getChineseAIResponse(lowerMsg, message);
        case 'science':
            return getScienceAIResponse(lowerMsg, message);
        case 'reading':
            return getReadingAIResponse(lowerMsg, message);
        case 'world':
            return getWorldAIResponse(lowerMsg, message);
        case 'pbl':
            return getPBLAIResponse(lowerMsg, message);
        default:
            return getDefaultAIResponse(message);
    }
}

function getEnglishAIResponse(lowerMsg, originalMsg) {
    const responses = [
        "Great job! 🌟 Try to say that in a complete sentence! Remember to use proper grammar.",
        "Excellent work! 📖 Can you tell me more about the story? What do you think will happen next?",
        "That's a wonderful idea! 🎨 Let's use some descriptive words to make it more interesting!",
        "Perfect pronunciation! 🗣️ Try reading that sentence again with more confidence!",
        "I love how you're thinking! 🤔 Can you explain why you think that?"
    ];
    
    if (lowerMsg.includes('winn-dixie') || lowerMsg.includes('book')) {
        return "📚 Winn-Dixie is such a sweet dog! 🐕 What do you think makes him special? Do you have a pet? Tell me about your favorite character in the book!";
    }
    
    if (lowerMsg.includes('word') || lowerMsg.includes('vocabulary')) {
        return "📝 Great! Let's learn a new word! Today's word is 'wander' (漫步/游荡). It means to walk around without a specific direction. Example: 'The dog liked to wander around the neighborhood.' Can you use it in a sentence?";
    }
    
    if (lowerMsg.includes('speak') || lowerMsg.includes('say')) {
        return "🗣️ Perfect! Your American accent is getting better! Try this: 'The sunshine made me feel warm and happy.' Great job! Keep practicing!";
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
}

function getMathAIResponse(lowerMsg, originalMsg) {
    if (lowerMsg.includes('规律') || lowerMsg.includes('pattern') || lowerMsg.includes('找规律')) {
        return `🔢 找规律游戏！<br><br>观察数列：2, 4, 6, 8, __?<br><br>答案是 10！<br><br>因为每次增加 2！<br><br>🤔 下一题：1, 3, 5, 7, __?<br>答案是什么？`;
    }
    
    if (lowerMsg.includes('难') || lowerMsg.includes('hard') || lowerMsg.includes('不会')) {
        return "没关系！我们一起来想。💪 把大问题拆成小问题，一步一步来。比如：35 + 27 = ？<br><br>先算 35 + 20 = 55<br>再算 55 + 7 = 62<br><br>这样是不是容易多了？";
    }
    
    if (lowerMsg.includes('加法') || lowerMsg.includes('add') || lowerMsg.includes('减法') || lowerMsg.includes('subtract')) {
        return "🧮 数学练习时间！<br><br>竖式计算小技巧：<br>1. 从右边开始（个位）<br>2. 满十要进位，借位要记住<br>3. 对齐位数很重要<br><br>来，试试这道：<br>47 + 38 = ?";
    }
    
    return "🔢 太好了！你对数学越来越感兴趣了！🧮<br><br>记住：数学就像玩游戏，每一道题都是一个关卡!<br><br>Ready for a challenge? 来试试今天的奥数题!";
}

function getChineseAIResponse(lowerMsg, originalMsg) {
    if (lowerMsg.includes('日记') || lowerMsg.includes('写')) {
        return "📝 日记时间！💡<br><br>试着从这几个方面来写：<br>1. 今天发生了什么特别的事？<br>2. 你有什么感受？<br>3. 明天你期待什么？<br><br>加油！写得好不好不重要，重要的是写出真实的想法！✍️";
    }
    
    if (lowerMsg.includes('作文') || lowerMsg.includes('写作')) {
        return "✍️ 写作小技巧：<br><br>1. 先想清楚要写什么<br>2. 用上好词好句<br>3. 把事情写具体<br>4. 开头要吸引人<br>5. 结尾要总结<br><br>比如写春天：<br>「春天来了，花儿开了，柳树绿了，鸟儿在枝头唱歌...」<br><br>你能试试吗？";
    }
    
    return "📝 很好！继续写吧！💪<br><br>写作文就像搭积木，一句一句搭起来，就能变成一篇好文章！<br><br>有什么想法都可以写下来，不用担心对错！";
}

function getScienceAIResponse(lowerMsg, originalMsg) {
    if (lowerMsg.includes('植物') || lowerMsg.includes('生长') || lowerMsg.includes('seed')) {
        return "🌱 植物生长真奇妙！<br><br>植物生长的三要素：<br>1. ☀️ 阳光 - 植物需要光来进行光合作用<br>2. 💧 水 - 植物需要水分<br>3. 🌡️ 温度 - 适宜的温度让植物舒服<br><br>你可以种一颗豆子，每天观察记录它的高度！📊";
    }
    
    if (lowerMsg.includes('实验') || lowerMsg.includes('experiment')) {
        return "🔬 小实验时间！🧪<br><br>简单有趣的实验：<br><br>🥚 鸡蛋浮沉实验：<br>在水中加盐，鸡蛋会浮起来！<br><br>🥛 牛奶动画：<br>在牛奶中滴颜料，加洗洁精会变色！<br><br>想试试哪个？";
    }
    
    return "🔬 科学真有趣！🌍<br><br>记住：科学家就是那些喜欢问「为什么」的人！<br><br>你今天观察到什么有趣的现象了吗？";
}

function getReadingAIResponse(lowerMsg, originalMsg) {
    return `📚 关于《Because of Winn-Dixie》：<br><br>这是一个关于友谊和爱的故事！🐕<br><br>故事里的小女孩 India Opale Buloni 在宠物收容所找到了一只叫 Winn-Dixie 的狗，从此她的生活发生了变化...<br><br>📖 你现在读到哪一章了？<br>🤔 你觉得 Winn-Dixie 是一只怎样的狗狗？<br>💕 你有没有养过宠物？`;
}

function getWorldAIResponse(lowerMsg, originalMsg) {
    const japanTopics = [
        { topic: '樱花', desc: '🌸 樱花是日本的象征！每年春天，日本各地都会举办樱花祭，人们在樱花树下野餐、赏花。' },
        { topic: '富士山', desc: '🗻 富士山是日本最高的山，是一座活火山！它经常出现在日本的艺术作品中。' },
        { topic: '寿司', desc: '🍣 寿司是日本的经典美食！最早的寿司是用盐腌制的鱼配上米饭做成的。' },
        { topic: '动漫', desc: '🎌 日本被称为「动漫之国」！hello kitty、哆啦A梦、龙猫都是著名的日本动漫角色！' },
        { topic: '和服', desc: '👘 和服是日本的传统服饰，非常美丽！现在人们在节日时会穿和服。' },
        { topic: '日语', desc: '🗾 日语有三种文字：平假名、片假名和汉字。日语中「你好」是「こんにちは」(Kon-ni-chi-wa)！' }
    ];
    
    for (const t of japanTopics) {
        if (lowerMsg.includes(t.topic)) {
            return t.desc + '<br><br>🌟 你还知道日本的什么？';
        }
    }
    
    return `🌍 欢迎来到世界探索！本周我们学习日本！<br><br>日本是一个美丽的岛国！🇯🇵<br><br>你可以了解：<br>🗻 富士山<br>🌸 樱花<br>🍣 寿司<br>🎌 动漫文化<br><br>你对哪个最感兴趣？`;
}

function getPBLAIResponse(lowerMsg, originalMsg) {
    const project = studentData.pbl_projects.active;
    
    if (!project) {
        return "🚀 PBL 时间！<br><br>选择一个你喜欢的项目开始吧！<br><br>1. 🗾 探索日本文化<br>2. 🍰 数学与烹饪<br>3. 🌱 植物生长观察<br>4. 🏘️ 社区调研<br><br>你想做哪个？";
    }
    
    return `🔬 项目进行中：${project.emoji} ${project.title}<br><br>${project.description}<br><br>💡 今日任务：<br>1. 收集相关信息<br>2. 记录你的发现<br>3. 和家人分享<br><br>你今天有什么新发现吗？`;
}

function getDefaultAIResponse(message) {
    return "🌟 你说得真好！<br><br>告诉我更多关于你的想法吧！<br><br>记得：学习是一件快乐的事情！💪";
}

function getFallbackResponse(subject, message) {
    return getEnglishAIResponse('', message);
}

function getSubjectEmoji(subject) {
    const emojis = {
        english: '📖',
        math: '🧮',
        chinese: '📝',
        science: '🔬',
        reading: '📚',
        world: '🌍',
        pbl: '🚀'
    };
    return emojis[subject] || '🦋';
}

// ==================== 飞书通知 ====================

async function notifyFeishu(message) {
    const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
    if (!webhookUrl) {
        console.log('📱 飞书 Webhook 未配置，消息跳过');
        return false;
    }
    
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                msg_type: 'text',
                content: { text: `🎓 Teresa's AI Tutor\n\n${message}` }
            })
        });
        return response.ok;
    } catch (e) {
        console.error('📱 飞书通知失败:', e);
        return false;
    }
}

// 发送飞书私信给家长
async function sendFeishuDM(openId, message) {
    // 使用 OpenClaw 飞书应用配置
    const appId = process.env.FEISHU_APP_ID || 'cli_a9389539ceb81bd8';
    const appSecret = process.env.FEISHU_APP_SECRET || 'TEwNXahmqhSyTuetR4kYvetLptinIBgg';
    const chatId = process.env.FEISHU_CHAT_ID;
    }
    
    try {
        // 1. 获取 tenant_access_token
        const tokenRes = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ app_id: appId, app_secret: appSecret })
        });
        const tokenData = await tokenRes.json();
        const tenantToken = tokenData.tenant_access_token;
        
        if (!tenantToken) {
            console.error('📱 获取 tenant_token 失败');
            return false;
        }
        
        // 2. 创建或获取 chat_id (用户与机器人对话)
        // 这里简化为发送群消息或使用 known chat_id
        const chatId = process.env.FEISHU_CHAT_ID;
        
        if (chatId) {
            // 发送到已知群组
            const sendRes = await fetch(`https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tenantToken}`
                },
                body: JSON.stringify({
                    receive_id: chatId,
                    msg_type: 'text',
                    content: JSON.stringify({ text: `🎓 Teresa's AI Tutor\n\n${message}` })
                })
            });
            return sendRes.ok;
        } else {
            // 尝试发送到用户 ID (需要 open_id 权限)
            const sendRes = await fetch(`https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=open_id`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tenantToken}`
                },
                body: JSON.stringify({
                    receive_id: openId,
                    msg_type: 'text',
                    content: JSON.stringify({ text: `🎓 Teresa's AI Tutor\n\n${message}` })
                })
            });
            return sendRes.ok;
        }
    } catch (e) {
        console.error('📱 发送飞书消息失败:', e);
        return false;
    }
}

// 检查每日完成情况
function checkDailyCompletion(today) {
    const progress = studentData.daily_progress[today];
    if (!progress) return;
    
    let completed = 0;
    let total = 0;
    
    const subjects = ['english', 'math', 'chinese', 'science', 'exercise'];
    for (const subject of subjects) {
        if (progress[subject]) {
            for (const task of Object.values(progress[subject])) {
                total++;
                if (task.done) completed++;
            }
        }
    }
    
    const percentage = Math.round(completed / total * 100);
    
    if (percentage === 100) {
        notifyFeishincomplete('🎉🎉🎉\n\nTeresa 今日学习任务全部完成！\n\n太棒了！继续加油！💪');
    } else if (percentage === 50) {
        notifyFeishu(`📊 今日进度：${percentage}% (${completed}/${total})\n\n继续加油！💪`);
    }
}

// 启动服务器
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🎓 Teresa's AI Learning Hub - Server                   ║
║   本地访问: http://localhost:${PORT}                       ║
║   AI 模型: 讯飞星火 | Kimi | 学而思九章 | MiniMax         ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
