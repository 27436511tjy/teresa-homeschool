const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 端口配置
const FRONTEND_PORT = 8848;
const API_PORT = 3000;

// 豆包API配置
const DOUBAO_DUMBLEDORE = {
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    model: 'doubao-seed-2-0-pro-260215',
    apiKey: '12ded337-7298-4ae7-8eff-5b5ebde935e2'
};

const DOUBAO_MATH = {
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    model: 'doubao-seed-2-0-pro-260215',
    apiKey: '12ded337-7298-4ae7-8eff-5b5ebde935e2'
};

const LOG_FILE = path.join(__dirname, 'data', 'learning_log.json');
if (!fs.existsSync(path.dirname(LOG_FILE))) {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

function loadLearningLog() {
    try {
        return fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8')) : { logs: {}, mathProgress: {} };
    } catch (e) { return { logs: {}, mathProgress: {} }; }
}

function saveLearningLog(data) {
    try { fs.writeFileSync(LOG_FILE, JSON.stringify(data, null, 2)); } catch (e) {}
}

function updateMathProgress(progress) {
    const data = loadLearningLog();
    const today = new Date().toISOString().split('T')[0];
    data.mathProgress[today] = { ...data.mathProgress[today], ...progress };
    saveLearningLog(data);
}

function extractTopics(msg, subject) {
    const l = msg.toLowerCase(), topics = [];
    if (subject === 'math') {
        ['addition','subtraction','multiplication','division','fraction','decimal','word problem','geometry','measurement'].forEach(t => { if (l.includes(t)) topics.push(t.charAt(0).toUpperCase() + t.slice(1)); });
    } else {
        if (l.includes('english')||l.includes('vocabulary')) topics.push('English');
        if (l.includes('math')||l.includes('number')) topics.push('Math');
    }
    return topics;
}

async function callDoubao(msg, history, config) {
    const axios = require('axios');
    let systemPrompt;
    if (config.model.includes('math') || (history && history.mathTeacher)) {
        systemPrompt = `You are Professor Hermione Granger from Harry Potter. You are Teresa's AI Math Tutor.
Expert in Saxon Math curriculum (Grades K-12). Patient, encouraging, methodical.
Use Socratic method - guide students to discover answers themselves.
Teresa: 8 years old, Grade 3, Beginning Grade 3 Saxon Math.
Keep explanations age-appropriate for an 8-year-old.`;
    } else {
        systemPrompt = `You are Professor Dumbledore from Harry Potter. You are Teresa's AI learning guardian.
Wise, kind, encouraging. Use metaphors from wizarding world.
Talk to an 8-year-old girl. Keep responses concise.`;
    }
    const messages = [{ role: 'system', content: systemPrompt }];
    if (history && history.length) history.slice(-10).forEach(m => messages.push({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));
    messages.push({ role: 'user', content: msg });
    try {
        const r = await axios.post(config.endpoint, { model: config.model, messages: messages, max_tokens: 800, temperature: 0.7 }, { headers: { 'Authorization': `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' }, timeout: 30000 });
        return r.data?.choices?.[0]?.message?.content || "Let me think...";
    } catch (e) { throw e; }
}

function logLearning(msg, resp, teacher, isVoice, subject) {
    const data = loadLearningLog();
    const today = new Date().toISOString().split('T')[0];
    if (!data.logs[today]) data.logs[today] = [];
    data.logs[today].push({ timestamp: new Date().toISOString(), teacher: teacher, subject: subject, userMessage: msg, aiResponse: resp, isVoice: isVoice, topics: extractTopics(msg, subject) });
    saveLearningLog(data);
}

// 创建代理服务器 - 处理 /api/* 请求
const proxyServer = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
    if (req.method !== 'POST' || !req.url.startsWith('/api/')) { res.writeHead(404); res.end('Not Found'); return; }
    
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
        try {
            const { message, history, isVoice, teacher, subject, mathProgress } = JSON.parse(body);
            if (!message) { res.writeHead(400); res.end(JSON.stringify({error:'Message required'})); return; }
            
            let config = DOUBAO_DUMBLEDORE;
            if (teacher === 'Hermione' || subject === 'math') config = DOUBAO_MATH;
            
            const start = Date.now();
            const resp = await callDoubao(message, history, config);
            logLearning(message, resp, teacher || 'Dumbledore', isVoice, subject || 'general');
            if (mathProgress) updateMathProgress(mathProgress);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ response: resp, success: true, elapsed: Date.now() - start }));
        } catch (e) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ response: "I'm thinking... 🧙‍♂️", success: false, error: e.message }));
        }
    });
});

// 启动API服务器
proxyServer.listen(API_PORT, '0.0.0.0', () => {
    console.log(`\n🦉 ========================================`);
    console.log(`   Teresa Homeschool API: ${API_PORT}`);
    console.log(`   前端请访问: http://localhost:${FRONTEND_PORT}`);
    console.log(`   Tailscale IP: 100.79.131.95`);
    console.log(`   外部访问: http://100.79.131.95:${FRONTEND_PORT}`);
    console.log(`========================================\n`);
});

// 启动静态文件服务器
const serve = spawn('npx', ['http-server', '.', '-p', FRONTEND_PORT.toString()], { cwd: __dirname, stdio: 'inherit' });

serve.on('error', e => { if (e.code !== 'EADDRINUSE') console.error('前端启动失败:', e); });
