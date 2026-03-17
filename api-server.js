#!/usr/bin/env node
/**
 * Teresa Homeschool - 豆包API本地转发服务
 * 端口: 3000
 * 功能: 接收前端消息 -> 调用豆包API -> 返回回答 -> 记录日志
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// 豆包API配置 - 邓布利多（通用对话）
const DOUBAO_DUMBLEDORE = {
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    model: 'doubao-seed-2-0-pro-260215',  // 可调整为C2 Pro
    apiKey: '12ded337-7298-4ae7-8eff-5b5ebde935e2'
};

// 豆包API配置 - 数学老师（Hermione，使用C2 Pro）
const DOUBAO_MATH = {
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    model: 'doubao-seed-2-0-pro-260215',  // 调整为 C2 Pro: doubao-c2-pro-xxxx
    apiKey: '12ded337-7298-4ae7-8eff-5b5ebde935e2'
};

// 学习日志文件
const LOG_FILE = path.join(__dirname, 'data', 'learning_log.json');

// 确保日志目录存在
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// 加载学习日志
function loadLearningLog() {
    try {
        if (fs.existsSync(LOG_FILE)) {
            return JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
        }
    } catch (e) {
        console.error('加载日志失败:', e);
    }
    return { logs: {}, mathProgress: {} };
}

// 保存学习日志
function saveLearningLog(logData) {
    try {
        fs.writeFileSync(LOG_FILE, JSON.stringify(logData, null, 2));
    } catch (e) {
        console.error('保存日志失败:', e);
    }
}

// 更新数学进度
function updateMathProgress(progress) {
    const logData = loadLearningLog();
    const today = new Date().toISOString().split('T')[0];
    
    if (!logData.mathProgress[today]) {
        logData.mathProgress[today] = {
            lesson: '',
            pages: '',
            exercises: [],
            timeSpent: 0,
            topics: [],
            difficulties: [],
            notes: ''
        };
    }
    
    logData.mathProgress[today] = { ...logData.mathProgress[today], ...progress };
    saveLearningLog(logData);
    console.log(`📊 已更新数学进度: ${today}`);
}

// 提取学习话题
function extractTopics(message, subject) {
    const topics = [];
    const lower = message.toLowerCase();
    
    if (subject === 'math') {
        // 数学相关话题
        if (lower.includes('addition') || lower.includes('加法')) topics.push('Addition');
        if (lower.includes('subtraction') || lower.includes('减法')) topics.push('Subtraction');
        if (lower.includes('multiplication') || lower.includes('乘法')) topics.push('Multiplication');
        if (lower.includes('division') || lower.includes('除法')) topics.push('Division');
        if (lower.includes('fraction') || lower.includes('分数')) topics.push('Fractions');
        if (lower.includes('decimal') || lower.includes('小数')) topics.push('Decimals');
        if (lower.includes('word problem') || lower.includes('应用题')) topics.push('Word Problems');
        if (lower.includes('geometry') || lower.includes('几何')) topics.push('Geometry');
        if (lower.includes('measurement') || lower.includes('测量')) topics.push('Measurement');
        if (lower.includes('saxon')) topics.push('Saxon Math');
    } else {
        // 其他话题
        if (lower.includes('english') || lower.includes('vocabulary') || lower.includes('reading')) topics.push('English');
        if (lower.includes('math') || lower.includes('number') || lower.includes('calculate')) topics.push('Math');
        if (lower.includes('chinese') || lower.includes('中文')) topics.push('Chinese');
        if (lower.includes('science') || lower.includes('experiment')) topics.push('Science');
        if (lower.includes('homework') || lower.includes('practice')) topics.push('Practice');
        if (lower.includes('tired') || lower.includes('hard') || lower.includes('difficult')) topics.push('Emotion');
    }
    
    return topics;
}

// 调用豆包API
async function callDoubao(message, history = [], config = DOUBAO_DUMBLEDORE) {
    const axios = require('axios');
    
    let systemPrompt;
    let model = config.model;
    
    if (config.model.includes('math') || history.mathTeacher) {
        // 数学老师 - Hermione风格
        systemPrompt = `You are Professor Hermione Granger from Harry Potter. You are Teresa's AI Math Tutor.

Your role and characteristics:
- Expert in Saxon Math curriculum (Grades K-12)
- Patient, encouraging, and methodical
- Use the Socratic method - guide students to discover answers themselves
- Break down complex problems into smaller, manageable steps
- Always verify understanding before moving on
- Use concrete examples and manipulatives in explanations
- Celebrate effort and progress, not just correct answers

Saxon Math Approach:
- Incremental development: new concepts are introduced in small steps
- Continuous review: every lesson includes review of previously learned material
- Emphasis on mastery: students must demonstrate understanding before advancing

Teresa's profile:
- Age: 8.5 years old (Grade 3)
- Current level: Beginning Grade 3 Saxon Math
- Learning style: Visual and hands-on learner
- Goals: Build strong foundation in arithmetic, prepare for advanced math

Communication guidelines:
- Keep explanations age-appropriate for an 8-year-old
- Use examples from everyday life
- Check understanding frequently with questions
- When explaining a concept, always start with "Let's think about..." or "Imagine..."
- If Teresa makes a mistake, guide her to find the correct answer without directly saying "wrong"

Remember: You are helping build mathematical thinking, not just getting right answers!`;
    } else {
        // 邓布利多 - 通用对话
        systemPrompt = `You are Professor Dumbledore from Harry Potter. You are the headmaster of Hogwarts and Teresa's AI learning guardian. 

Your characteristics:
- Wise, kind, and encouraging
- Use metaphors and wisdom from the wizarding world
- Speak in a warm, mentoring tone
- Help Teresa with her learning journey
- Always encourage her to try her best
- Keep responses concise but meaningful (2-3 paragraphs max)

Remember: You are talking to an 8-year-old girl. Use simple language suitable for a child.`;
    }

    const messages = [
        { role: 'system', content: systemPrompt }
    ];
    
    // 添加历史对话
    if (history && history.length > 0) {
        history.slice(-10).forEach(msg => {
            messages.push({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text });
        });
    }
    
    messages.push({ role: 'user', content: message });

    try {
        const response = await axios.post(
            config.endpoint,
            {
                model: model,
                messages: messages,
                max_tokens: 800,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        return response.data?.choices?.[0]?.message?.content || "I'm sorry, dear. Let me think about that again...";
    } catch (error) {
        console.error('豆包API调用失败:', error.response?.data || error.message);
        throw error;
    }
}

// 记录学习日志
function logLearning(message, response, teacher = 'Dumbledore', isVoice = false, subject = 'general') {
    const logData = loadLearningLog();
    const today = new Date().toISOString().split('T')[0];
    
    if (!logData.logs[today]) {
        logData.logs[today] = [];
    }
    
    logData.logs[today].push({
        timestamp: new Date().toISOString(),
        teacher: teacher,
        subject: subject,
        userMessage: message,
        aiResponse: response,
        isVoice: isVoice,
        topics: extractTopics(message, subject)
    });
    
    saveLearningLog(logData);
    console.log(`📝 已记录学习日志 [${teacher}]: ${today} - ${message.substring(0, 20)}...`);
}

// 创建HTTP服务器
const server = http.createServer(async (req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 只处理POST请求
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        return;
    }

    // 解析请求体
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const { message, history, isVoice, teacher, subject, mathProgress } = JSON.parse(body);
            
            if (!message) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Message is required' }));
                return;
            }

            console.log(`💬 收到${teacher || 'Dumbledore'}消息: ${message.substring(0, 50)}...`);
            
            // 选择API配置
            let apiConfig = DOUBAO_DUMBLEDORE;
            if (teacher === 'Hermione' || subject === 'math') {
                apiConfig = DOUBAO_MATH;
            }
            
            // 调用豆包API
            const startTime = Date.now();
            const aiResponse = await callDoubao(message, history, apiConfig);
            const elapsed = Date.now() - startTime;
            
            console.log(`✅ ${teacher || 'Dumbledore'}响应 (${elapsed}ms): ${aiResponse.substring(0, 50)}...`);
            
            // 记录日志
            logLearning(message, aiResponse, teacher || 'Dumbledore', isVoice, subject || 'general');
            
            // 更新数学进度
            if (mathProgress) {
                updateMathProgress(mathProgress);
            }
            
            // 返回结果
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                response: aiResponse,
                success: true,
                elapsed: elapsed
            }));
            
        } catch (error) {
            console.error('❌ 处理请求失败:', error.message);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                response: "I'm having trouble thinking right now, dear. Let's try again in a moment! 🧙‍♂️",
                success: false,
                error: error.message
            }));
        }
    });
});

// 启动服务器
server.listen(PORT, '0.0.0.0', () => {
    console.log(`
🦉 ========================================
   Teresa Homeschool API 服务已启动
   端口: ${PORT}
   地址: http://localhost:${PORT}
   地址: http://127.0.0.1:${PORT}
   ========================================
   
   可用端点:
   - POST /api/chat (邓布利多)
   - POST /api/math (数学老师Hermione)
   
   按 Ctrl+C 停止服务
`);
});

// 错误处理
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${PORT} 已被占用`);
    } else {
        console.error('❌ 服务器错误:', err);
    }
    process.exit(1);
});
