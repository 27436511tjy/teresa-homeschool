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

// 豆包API配置
const DOUBAO_CONFIG = {
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/responses',
    model: 'doubao-seed-2-0-pro-260215',
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
    return { logs: {} };
}

// 保存学习日志
function saveLearningLog(logData) {
    try {
        fs.writeFileSync(LOG_FILE, JSON.stringify(logData, null, 2));
    } catch (e) {
        console.error('保存日志失败:', e);
    }
}

// 提取学习话题
function extractTopics(message) {
    const topics = [];
    const lower = message.toLowerCase();
    
    if (lower.includes('english') || lower.includes('vocabulary') || lower.includes('reading')) topics.push('English');
    if (lower.includes('math') || lower.includes('number') || lower.includes('calculate')) topics.push('Math');
    if (lower.includes('chinese') || lower.includes('中文')) topics.push('Chinese');
    if (lower.includes('science') || lower.includes('experiment')) topics.push('Science');
    if (lower.includes('homework') || lower.includes('practice')) topics.push('Practice');
    if (lower.includes('tired') || lower.includes('hard') || lower.includes('difficult')) topics.push('Emotion');
    
    return topics;
}

// 调用豆包API
async function callDoubao(message, history = []) {
    const axios = require('axios');
    
    const systemPrompt = `You are Professor Dumbledore from Harry Potter. You are the headmaster of Hogwarts and Teresa's AI learning guardian. 

Your characteristics:
- Wise, kind, and encouraging
- Use metaphors and wisdom from the wizarding world
- Speak in a warm, mentoring tone
- Help Teresa with her learning journey
- Always encourage her to try her best
- Keep responses concise but meaningful (2-3 paragraphs max)

Remember: You are talking to an 8-year-old girl. Use simple language suitable for a child.`;

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
            DOUBAO_CONFIG.endpoint,
            {
                model: DOUBAO_CONFIG.model,
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${DOUBAO_CONFIG.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        return response.data?.choices?.[0]?.message?.content || "I'm sorry, dear Teresa. Let me think about that...";
    } catch (error) {
        console.error('豆包API调用失败:', error.response?.data || error.message);
        throw error;
    }
}

// 记录学习日志
function logLearning(message, response, isVoice = false) {
    const logData = loadLearningLog();
    const today = new Date().toISOString().split('T')[0];
    
    if (!logData.logs[today]) {
        logData.logs[today] = [];
    }
    
    logData.logs[today].push({
        timestamp: new Date().toISOString(),
        teacher: 'Dumbledore',
        userMessage: message,
        aiResponse: response,
        isVoice: isVoice,
        topics: extractTopics(message)
    });
    
    saveLearningLog(logData);
    console.log(`📝 已记录学习日志: ${today} - ${message.substring(0, 20)}...`);
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
            const { message, history, isVoice } = JSON.parse(body);
            
            if (!message) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Message is required' }));
                return;
            }

            console.log(`💬 收到消息: ${message.substring(0, 50)}...`);
            
            // 调用豆包API
            const startTime = Date.now();
            const aiResponse = await callDoubao(message, history);
            const elapsed = Date.now() - startTime;
            
            console.log(`✅ 豆包响应 (${elapsed}ms): ${aiResponse.substring(0, 50)}...`);
            
            // 记录日志
            logLearning(message, aiResponse, isVoice);
            
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
   
   前端对接方式:
   fetch('http://127.0.0.1:${PORT}', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({
           message: 'Hello',
           history: [],
           isVoice: false
       })
   })
   
   按 Ctrl+C 停止服务
`);
});

// 错误处理
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${PORT} 已被占用，请使用其他端口:`);
        console.error(`   PORT=3001 node api-server.js`);
    } else {
        console.error('❌ 服务器错误:', err);
    }
    process.exit(1);
});
