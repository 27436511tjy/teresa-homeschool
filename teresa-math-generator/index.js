/**
 * Teresa Daily Math Content Generator
 * 自动生成每日数学内容：基础数学(Saxon) + 思维数学(袋鼠数学+AMC8)
 * 
 * 使用讯飞星火大模型生成内容
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ============ 配置 ============
const CONFIG = {
  student: {
    name: 'Teresa',
    age: 8.5,
    grade: 3,
    level: 'US Grade 3-4'
  },
  // 优先使用豆包API（已配置好）
  doubao: {
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    model: 'doubao-seed-2-0-pro-260215',
    apiKey: '12ded337-7298-4ae7-8eff-5b5ebde935e2'
  },
  // 讯飞星火API - 星火Ultra版本
  xfyun: {
    appId: '9ffd8156',
    apiKey: 'f8ce27c9356d2544c2d0e2304fecd6ba',
    apiSecret: 'MmZkODM5Mzg2MWUyODViMzcxMzFkZDlj',
    endpoint: 'spark-api.xf-yun.com',
    path: '/v4.0/chat'  // Ultra版本使用v4.0
  },
  // 当前使用的AI服务商 - 优先使用豆包（稳定）
  currentProvider: 'doubao', // 'doubao' 或 'xfyun'
  paths: {
    dataDir: path.join(__dirname, 'data', 'math'),
    progressFile: path.join(__dirname, 'data', 'math_progress.json'),
    outputDir: path.join(__dirname, 'data', 'daily_math')
  }
};

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ============ 学习进度管理 ============
function loadProgress() {
  const file = CONFIG.paths.progressFile;
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return {
    saxon: {
      currentLesson: 1,
      currentUnit: 1,
      completedLessons: []
    },
   思维: {
      currentLevel: 1,
      completedTopics: []
    },
    lastUpdate: null
  };
}

function saveProgress(progress) {
  progress.lastUpdate = new Date().toISOString();
  fs.writeFileSync(CONFIG.paths.progressFile, JSON.stringify(progress, null, 2));
}

// ============ 豆包API调用 ============
const crypto = require('crypto');

async function callDoubaoAPI(messages, temperature = 0.7) {
  return new Promise((resolve, reject) => {
    const requestBody = {
      model: CONFIG.doubao.model,
      messages: messages,
      temperature: temperature,
      max_tokens: 4096
    };

    const data = JSON.stringify(requestBody);
    const url = new URL(CONFIG.doubao.endpoint);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': `Bearer ${CONFIG.doubao.apiKey}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.choices && result.choices.length > 0) {
            const content = result.choices[0].message.content;
            resolve(content);
          } else if (result.error) {
            reject(new Error(`API Error: ${result.error.message}`));
          } else {
            reject(new Error(`Unexpected response: ${body}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ============ 讯飞星火API调用 ============
function getAuthUrl() {
  const host = CONFIG.xfyun.endpoint;
  const path = CONFIG.xfyun.path;
  
  // 讯飞要求的日期格式: RFC 7231
  const date = new Date().toUTCString();
  const algorithm = 'hmac-sha256';
  
  // 构建签名原字符串
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  
  // 使用API Secret进行HMAC-SHA256签名
  const signatureSha = crypto.createHmac('sha256', CONFIG.xfyun.apiSecret)
    .update(signatureOrigin)
    .digest('base64');
  
  // 构建Authorization头
  const authorizationOrigin = `algorithm="${algorithm}", headers="host date request-line", signature="${signatureSha}"`;
  const authorization = Buffer.from(authorizationOrigin).toString('base64');
  
  return `https://${host}${path}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`;
}

async function callSparkAPI(messages, temperature = 0.7) {
  return new Promise((resolve, reject) => {
    const requestBody = {
      model: 'generalv3.5',
      messages: messages,
      temperature: temperature,
      max_tokens: 4096
    };

    const data = JSON.stringify(requestBody);
    const authUrl = getAuthUrl();
    const url = new URL(authUrl);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.choices && result.choices.messages && result.choices.messages.length > 0) {
            const content = result.choices.messages[result.choices.messages.length - 1].content;
            resolve(content);
          } else if (result.code) {
            reject(new Error(`API Error (code ${result.code}): ${result.message || JSON.stringify(result)}`));
          } else {
            reject(new Error(`Unexpected response: ${body}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 统一的API调用接口
async function callAIAPI(messages, temperature = 0.7) {
  if (CONFIG.currentProvider === 'doubao') {
    return callDoubaoAPI(messages, temperature);
  } else {
    return callSparkAPI(messages, temperature);
  }
}

// 简化版API调用 - 减少超时
async function callAIAPIFast(messages) {
  return callAIAPI(messages, 0.8);
}

// ============ 内容生成 Prompts ============

// Saxon Math 基础数学 - 课件生成 (简化版)
function generateSaxonLessonPrompt(lessonNum, topic) {
  return {
    role: 'user',
    content: `Generate a simple Saxon Math lesson for a 3rd grade student (8 years old).

LESSON ${lessonNum}: ${topic}

Create a SHORT lesson with:
1. 2-sentence intro
2. One simple example
3. 3 practice problems with answers
4. 3 homework problems with answers

Output JSON: {"title":"...","introduction":"...","practice_problems":[{"question":"...","answer":"..."}],"homework_problems":[{"question":"...","answer":"..."}]}`
  };
}

// Saxon Math 复习题生成 (简化版)
function generateSaxonReviewPrompt(unitNum, lessonsCovered) {
  return {
    role: 'user',
    content: `Generate 5 mixed review math problems for 3rd grade. 

Output JSON: {"title":"Unit ${unitNum} Review","problems":[{"question":"...","answer":"..."}]}`
  };
}

// 袋鼠数学思维题生成 (简化版)
function generateKangarooPrompt(level, topic) {
  return {
    role: 'user',
    content: `Generate 3 fun math puzzles for an 8-year-old (Grade 3). Topic: ${topic}.

Output JSON: {"title":"${topic}","problems":[{"question":"...","hint":"...","answer":"..."}]}`
  };
}

// AMC8 入门题生成 (简化版)
function generateAMCPrompt(difficulty) {
  return {
    role: 'user',
    content: `Generate 3 easy AMC8-style multiple choice math problems for Grade 3 student.

Output JSON: {"title":"AMC8 Practice","problems":[{"question":"...","options":["A","B","C","D"],"answer":"A"}]}`
  };
}

// ============ 主生成器 ============
class TeresaMathGenerator {
  constructor(date = null) {
    this.date = date || new Date().toISOString().split('T')[0];
    this.progress = loadProgress();
    this.outputDir = path.join(CONFIG.paths.outputDir, this.date);
    ensureDir(this.outputDir);
  }

  // 获取今天的Saxon主题
  getSaxonTopic(lessonNum) {
    const topics = [
      'Skip Counting', 'Adding Numbers', 'Subtracting Numbers', 
      'Multiplication Basics', 'Division Basics', 'Fractions',
      'Time and Money', 'Geometry Basics', 'Measurement',
      'Word Problems', 'Number Patterns', 'Place Value'
    ];
    return topics[(lessonNum - 1) % topics.length];
  }

  // 获取今天的思维数学主题
  get思维Topic() {
    const topics = [
      'Logical Reasoning', 'Pattern Recognition', 'Spatial Thinking',
      'Counting Strategies', 'Math Puzzles', 'Number Games'
    ];
    const idx = Math.floor(Math.random() * topics.length);
    return topics[idx];
  }

  async generateBasicMath() {
    console.log('📐 Generating Basic Math (Saxon Math)...');
    
    const lessonNum = this.progress.saxon.currentLesson;
    const topic = this.getSaxonTopic(lessonNum);
    
    // 确定是否需要复习
    const isReviewLesson = lessonNum % 5 === 0;
    
    let content = {};
    
    if (isReviewLesson && lessonNum > 5) {
      // 生成复习题
      const lessons = [];
      for (let i = Math.max(1, lessonNum - 4); i <= lessonNum; i++) {
        lessons.push(i);
      }
      console.log(`  Generating review for lessons: ${lessons.join(', ')}`);
      const prompt = generateSaxonReviewPrompt(
        Math.ceil(lessonNum / 5),
        lessons
      );
      content = await this.callAPI(prompt);
      content.type = 'review';
    } else {
      // 生成新课
      console.log(`  Generating Lesson ${lessonNum}: ${topic}`);
      const prompt = generateSaxonLessonPrompt(lessonNum, topic);
      content = await this.callAPI(prompt);
      content.type = 'lesson';
      content.lessonNum = lessonNum;
      content.topic = topic;
    }
    
    return content;
  }

  async generate思维Math() {
    console.log('🧠 Generating Math Thinking (Kangaroo + AMC8)...');
    
    const topic = this.get思维Topic();
    const level = Math.min(2, Math.ceil(this.progress.思维.currentLevel / 3));
    
    // 生成袋鼠数学
    console.log(`  Kangaroo Math - Level ${level}: ${topic}`);
    const kangarooPrompt = generateKangarooPrompt(level, topic);
    const kangarooContent = await this.callAPI(kangarooPrompt);
    
    // 生成AMC8入门
    const amcDifficulty = level === 1 ? 'easy' : 'medium';
    console.log(`  AMC8 - Difficulty: ${amcDifficulty}`);
    const amcPrompt = generateAMCPrompt(amcDifficulty);
    const amcContent = await this.callAPI(amcPrompt);
    
    return {
      type: 'thinking',
      topic: topic,
      kangaroo: kangarooContent,
      amc: amcContent
    };
  }

  async callAPI(prompt) {
    try {
      // 调用AI API（豆包或讯飞）
      const response = await callAIAPI([prompt]);
      return this.parseJSON(response);
    } catch (error) {
      console.error(`  ⚠️ API call failed: ${error.message}`);
      // 返回示例内容
      return this.getSampleContent(prompt.role === 'user' && prompt.content.includes('Saxon') ? 'saxon' : 'thinking');
    }
  }

  parseJSON(text) {
    try {
      // 尝试提取JSON
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error('No JSON found');
    } catch (e) {
      console.error('  ⚠️ JSON parse error, using sample');
      return {};
    }
  }

  getSampleContent(type) {
    if (type === 'saxon') {
      return {
        title: `Lesson ${this.progress.saxon.currentLesson}`,
        introduction: `Today we learn about ${this.getSaxonTopic(this.progress.saxon.currentLesson)}!`,
        practice_problems: [
          { question: '2 + 3 = ?', answer: '5' },
          { question: '5 + 4 = ?', answer: '9' },
          { question: '7 + 2 = ?', answer: '9' },
          { question: '6 + 3 = ?', answer: '9' },
          { question: '8 + 1 = ?', answer: '9' }
        ],
        homework_problems: [
          { question: '4 + 5 = ?', answer: '9' },
          { question: '3 + 6 = ?', answer: '9' },
          { question: '9 + 1 = ?', answer: '10' },
          { question: '2 + 7 = ?', answer: '9' },
          { question: '5 + 3 = ?', answer: '8' }
        ]
      };
    } else {
      return {
        title: 'Math Thinking Practice',
        problems: [
          { question: 'What number comes next: 2, 4, 6, 8, ?', hint: 'Look at the pattern', answer: '10', explanation: 'Each number adds 2' },
          { question: 'If you have 3 apples and get 2 more, how many do you have?', hint: 'Use addition', answer: '5', explanation: '3 + 2 = 5' }
        ]
      };
    }
  }

  async generate() {
    console.log(`\n🎓 Teresa Math Generator - ${this.date}`);
    console.log('='.repeat(50));
    
    // 生成基础数学
    const basicMath = await this.generateBasicMath();
    
    // 生成思维数学
    const thinkingMath = await this.generate思维Math();
    
    // 组装完整内容
    const dailyContent = {
      date: this.date,
      student: CONFIG.student,
      generatedAt: new Date().toISOString(),
      basicMath: basicMath,
      thinkingMath: thinkingMath,
      progress: {
        saxonLesson: this.progress.saxon.currentLesson,
       思维Level: this.progress.思维.currentLevel
      }
    };
    
    // 保存内容
    const outputFile = path.join(this.outputDir, 'content.json');
    fs.writeFileSync(outputFile, JSON.stringify(dailyContent, null, 2));
    console.log(`\n✅ Content saved to: ${outputFile}`);
    
    // 生成Markdown版本（更易读）
    const markdownFile = path.join(this.outputDir, 'content.md');
    fs.writeFileSync(markdownFile, this.generateMarkdown(dailyContent));
    console.log(`✅ Markdown saved to: ${markdownFile}`);
    
    // 更新进度
    this.progress.saxon.currentLesson++;
    this.progress.思维.currentLevel = Math.min(6, this.progress.思维.currentLevel + 0.5);
    saveProgress(this.progress);
    
    return dailyContent;
  }

  generateMarkdown(content) {
    let md = `# Teresa Daily Math - ${content.date}\n\n`;
    md += `**Student:** ${content.student.name} | **Grade:** ${content.student.grade} | **Age:** ${content.student.age}\n\n`;
    md += `---\n\n`;
    
    // 基础数学
    md += `## 📐 Basic Math (Saxon Math)\n\n`;
    if (content.basicMath.type === 'lesson') {
      md += `### Lesson ${content.basicMath.lessonNum}: ${content.basicMath.topic}\n\n`;
      md += `${content.basicMath.introduction || ''}\n\n`;
      md += `### Practice Problems\n\n`;
      if (content.basicMath.practice_problems) {
        content.basicMath.practice_problems.forEach((p, i) => {
          md += `${i + 1}. ${p.question}\n`;
        });
      }
      md += `\n### Homework\n\n`;
      if (content.basicMath.homework_problems) {
        content.basicMath.homework_problems.forEach((p, i) => {
          md += `${i + 1}. ${p.question}\n`;
        });
      }
    } else {
      md += `### Mixed Review (Unit ${content.basicMath.unit || 1})\n\n`;
      if (content.basicMath.problems) {
        content.basicMath.problems.forEach((p, i) => {
          md += `${i + 1}. ${p.question}\n`;
        });
      }
    }
    md += `\n---\n\n`;
    
    // 思维数学
    md += `## 🧠 Math Thinking (Kangaroo + AMC8)\n\n`;
    md += `### Topic: ${content.thinkingMath.topic}\n\n`;
    
    // 袋鼠数学
    md += `#### Kangaroo Math\n\n`;
    if (content.thinkingMath.kangaroo && content.thinkingMath.kangaroo.problems) {
      content.thinkingMath.kangaroo.problems.forEach((p, i) => {
        md += `**Problem ${i + 1}:** ${p.question}\n`;
        if (p.hint) md += `*Hint: ${p.hint}*\n`;
        md += `\n`;
      });
    }
    
    // AMC8
    md += `\n#### AMC8 Practice\n\n`;
    if (content.thinkingMath.amc && content.thinkingMath.amc.problems) {
      content.thinkingMath.amc.problems.forEach((p, i) => {
        md += `**Problem ${i + 1}:** ${p.question}\n`;
        if (p.options) {
          p.options.forEach((opt, j) => {
            md += `  ${j + 1}. ${opt}\n`;
          });
        }
        md += `\n`;
      });
    }
    
    md += `\n---\n*Generated at ${content.generatedAt}*\n`;
    
    return md;
  }
}

// ============ 主程序 ============
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    console.log('Testing API connection...');
    console.log('Config:', CONFIG.xfyun.appId ? 'AppId configured' : 'Missing AppId');
    console.log('API Key:', CONFIG.xfyun.apiKey ? 'Configured' : 'Missing API Key');
    process.exit(0);
  }
  
  const date = args[0] || null;
  const generator = new TeresaMathGenerator(date);
  
  try {
    await generator.generate();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

module.exports = TeresaMathGenerator;

if (require.main === module) {
  main();
}
