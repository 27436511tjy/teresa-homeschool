/**
 * Teresa Chinese Learning Content Generator
 * 语文学习内容生成器 - 18周课程计划
 * 
 * 主题：我与我的家乡 → 二十四节气 → 神话启蒙 → 汉字故事 → 丝绸之路 → 四大发明 → 唐诗 → 中国地图 → 成长总结
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ============ 配置 ============
const CONFIG = {
  student: {
    name: 'Teresa',
    age: 8.5,
    grade: 3,
    level: 'US Grade 3-4'
  },
  // 优先使用豆包API
  doubao: {
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    model: 'doubao-seed-2-0-pro-260215',
    apiKey: '12ded337-7298-4ae7-8eff-5b5ebde935e2'
  },
  paths: {
    outputDir: path.join(__dirname, 'data', 'daily_chinese'),
    progressFile: path.join(__dirname, 'data', 'chinese_progress.json'),
    planFile: path.join(__dirname, 'chinese_18week_plan.json')
  }
};

// ============ 18周课程计划 ============
const WEEKLY_PLAN = [
  // 第1-2周: 我与我的家乡
  {
    week: 1,
    theme: "我与我的家乡",
    days: [
      { day: 1, subject: "语文", type: "字词", content: "家乡、城市、街道3个核心词" },
      { day: 1, subject: "阅读", type: "短文", content: "《我的家乡》" },
      { day: 1, subject: "历史", type: "故事", content: "家乡名字的由来" },
      { day: 1, subject: "地理", type: "认知", content: "家乡在地图上的位置" },
      { day: 1, subject: "人文", type: "口语", content: "礼貌表达、自我介绍" },
      { day: 2, subject: "语文", type: "字词", content: "建筑、风景、公园3个核心词" },
      { day: 2, subject: "阅读", type: "短文", content: "《我爱我家》" },
      { day: 2, subject: "历史", type: "故事", content: "过去与现在的变化" },
      { day: 2, subject: "地理", type: "动手", content: "画简易家庭到学校地图" },
      { day: 2, subject: "人文", type: "美食", content: "家乡美食介绍" },
      { day: 3, subject: "语文", type: "字词", content: "社区、邻居、朋友3个核心词" },
      { day: 3, subject: "阅读", type: "短文", content: "短文阅读理解" },
      { day: 3, subject: "历史", type: "故事", content: "本地历史小故事1" },
      { day: 3, subject: "地理", type: "认知", content: "家乡气候、河流" },
      { day: 3, subject: "人文", type: "习俗", content: "家乡习俗" },
      { day: 4, subject: "语文", type: "字词", content: "复习前6个核心词" },
      { day: 4, subject: "阅读", type: "短文", content: "阅读理解练习" },
      { day: 4, subject: "历史", type: "故事", content: "本地历史小故事2" },
      { day: 4, subject: "地理", type: "认知", content: "家乡地形" },
      { day: 4, subject: "人文", type: "口语", content: "介绍自己的家乡" },
      { day: 5, subject: "语文", type: "写作", content: "日记《我最喜欢的地方》（100-150字）" },
      { day: 5, subject: "阅读", type: "朗读", content: "每日3分钟朗读训练" },
      { day: 5, subject: "历史", type: "复习", content: "本周历史知识复习" },
      { day: 5, subject: "地理", type: "复习", content: "本周地理知识复习" },
      { day: 5, subject: "人文", type: "创作", content: "我的家乡小海报" }
    ]
  },
  // 第3-4周: 二十四节气——春
  {
    week: 3,
    theme: "二十四节气——春",
    days: [
      { day: 1, subject: "语文", type: "古诗", content: "《春晓》" },
      { day: 1, subject: "历史", type: "知识", content: "节气怎么来的（古人观察自然）" },
      { day: 1, subject: "地理", type: "自然", content: "春天温度、降水变化" },
      { day: 1, subject: "人文", type: "观察", content: "找春天" },
      { day: 2, subject: "语文", type: "古诗", content: "《清明》" },
      { day: 2, subject: "语文", type: "词语", content: "节气谚语、物候词语" },
      { day: 2, subject: "历史", type: "知识", content: "农耕文化小知识" },
      { day: 2, subject: "地理", type: "比较", content: "南北春天差异" },
      { day: 2, subject: "人文", type: "习俗", content: "清明习俗、踏青" },
      { day: 3, subject: "语文", type: "写作", content: "小写作《我找到的春天》" },
      { day: 3, subject: "阅读", type: "朗读", content: "朗读古诗" },
      { day: 3, subject: "地理", type: "自然", content: "春天植物变化" },
      { day: 3, subject: "人文", type: "感恩", content: "感恩自然" },
      { day: 4, subject: "语文", type: "字词", content: "春季相关词汇" },
      { day: 4, subject: "阅读", type: "阅读", content: "春天主题短文" },
      { day: 4, subject: "历史", type: "复习", content: "节气知识复习" },
      { day: 4, subject: "地理", type: "复习", content: "春季地理知识" },
      { day: 5, subject: "语文", type: "测试", content: "第3-4周小测试" },
      { day: 5, subject: "人文", type: "创作", content: "春天观察日记" }
    ]
  },
  // 第5-6周: 中国神话启蒙
  {
    week: 5,
    theme: "中国神话启蒙",
    days: [
      { day: 1, subject: "语文", type: "故事", content: "《盘古开天》" },
      { day: 1, subject: "历史", type: "认知", content: "神话不是真历史，但反映古人智慧" },
      { day: 1, subject: "地理", type: "概念", content: "天地、日月星辰基本概念" },
      { day: 1, subject: "人文", type: "品格", content: "勇敢、善良" },
      { day: 2, subject: "语文", type: "故事", content: "《女娲造人》" },
      { day: 2, subject: "语文", type: "成语", content: "开天辟地" },
      { day: 2, subject: "历史", type: "认知", content: "上古时代简单认知" },
      { day: 2, subject: "人文", type: "品格", content: "责任感" },
      { day: 3, subject: "语文", type: "故事", content: "《后羿射日》" },
      { day: 3, subject: "语文", type: "成语", content: "夸父追日" },
      { day: 3, subject: "地理", type: "认知", content: "神话里的太阳" },
      { day: 3, subject: "人文", content: "画神话人物" },
      { day: 4, subject: "语文", type: "复述", content: "复述故事训练" },
      { day: 4, subject: "阅读", type: "理解", content: "神话阅读理解" },
      { day: 4, subject: "人文", type: "复习", content: "本周品格总结" },
      { day: 5, subject: "语文", type: "写作", content: "神话故事新编" },
      { day: 5, subject: "测试", content: "第5-6周小测试" }
    ]
  },
  // 第7-8周: 我们的文字——汉字故事
  {
    week: 7,
    theme: "汉字故事",
    days: [
      { day: 1, subject: "语文", type: "起源", content: "汉字起源：象形字" },
      { day: 1, subject: "历史", type: "故事", content: "仓颉造字故事" },
      { day: 1, subject: "人文", type: "态度", content: "认真写字" },
      { day: 2, subject: "语文", type: "字源", content: "基础字源：日、月、山、水" },
      { day: 2, subject: "历史", type: "知识", content: "甲骨文小知识" },
      { day: 2, subject: "地理", type: "认知", content: "汉字在中国各地的统一作用" },
      { day: 3, subject: "语文", type: "字源", content: "基础字源：人、手、口" },
      { day: 3, subject: "语文", type: "书写", content: "笔顺训练" },
      { day: 3, subject: "地理", type: "语言", content: "方言与普通话" },
      { day: 4, subject: "语文", type: "指事", content: "指事字认知" },
      { day: 4, subject: "阅读", content: "汉字故事阅读" },
      { day: 4, subject: "人文", content: "尊重文化" },
      { day: 5, subject: "语文", type: "创作", content: "我的汉字卡片" },
      { day: 5, subject: "测试", content: "第7-8周小测试" }
    ]
  },
  // 第9-10周: 丝绸之路小使者
  {
    week: 9,
    theme: "丝绸之路小使者",
    days: [
      { day: 1, subject: "语文", type: "阅读", content: "丝绸之路简单短文" },
      { day: 1, subject: "语文", type: "词语", content: "沙漠、骆驼、商人、丝绸" },
      { day: 1, subject: "历史", content: "张骞出使西域" },
      { day: 2, subject: "语文", type: "阅读", content: "丝绸之路短文2" },
      { day: 2, subject: "历史", content: "古代中外交流" },
      { day: 2, subject: "地理", content: "丝绸之路路线（简单版）" },
      { day: 3, subject: "语文", type: "词语", content: "相关词汇复习" },
      { day: 3, subject: "地理", content: "沙漠、绿洲、城市概念" },
      { day: 3, subject: "人文", content: "友好交流、包容不同文化" },
      { day: 4, subject: "语文", type: "写作", content: "《假如我是小商人》" },
      { day: 4, subject: "人文", content: "手工：丝绸之路路线图" },
      { day: 5, subject: "阅读", type: "复习", content: "本周阅读复习" },
      { day: 5, subject: "测试", content: "第9-10周小测试" }
    ]
  },
  // 第11-12周: 伟大的中国古代发明
  {
    week: 11,
    theme: "四大发明",
    days: [
      { day: 1, subject: "语文", type: "阅读", content: "四大发明阅读材料" },
      { day: 1, subject: "历史", content: "造纸术历史" },
      { day: 1, subject: "地理", content: "造纸与树木、自然" },
      { day: 2, subject: "语文", type: "说明", content: "说明性小短文" },
      { day: 2, subject: "历史", content: "印刷术历史" },
      { day: 2, subject: "人文", content: "创新、观察、思考的重要性" },
      { day: 3, subject: "语文", type: "复述", content: "复述：我最感兴趣的发明" },
      { day: 3, subject: "历史", content: "指南针、火药历史" },
      { day: 3, subject: "地理", content: "指南针与方向" },
      { day: 4, subject: "阅读", type: "理解", content: "阅读理解练习" },
      { day: 4, subject: "人文", content: "小实验：方向辨别" },
      { day: 5, subject: "语文", type: "写作", content: "我的发明小论文" },
      { day: 5, subject: "测试", content: "第11-12周小测试" }
    ]
  },
  // 第13-14周: 唐诗里的中国
  {
    week: 13,
    theme: "唐诗里的中国",
    days: [
      { day: 1, subject: "语文", type: "古诗", content: "《静夜思》《望庐山瀑布》" },
      { day: 1, subject: "历史", content: "唐朝是什么朝代" },
      { day: 1, subject: "地理", content: "庐山、黄河地理位置" },
      { day: 2, subject: "语文", type: "古诗", content: "《登鹳雀楼》《咏柳》" },
      { day: 2, subject: "语文", type: "理解", content: "诗意理解、画面想象" },
      { day: 2, subject: "历史", content: "李白、杜甫小故事" },
      { day: 3, subject: "语文", type: "创作", content: "仿写一句小诗" },
      { day: 3, subject: "地理", content: "长江、山水风光与诗句" },
      { day: 3, subject: "人文", content: "欣赏美、表达情感" },
      { day: 4, subject: "语文", type: "朗读", content: "古诗朗读训练" },
      { day: 4, subject: "阅读", content: "唐诗阅读理解" },
      { day: 4, subject: "人文", content: "诗配画创作" },
      { day: 5, subject: "语文", type: "复习", content: "本周古诗复习" },
      { day: 5, subject: "测试", content: "第13-14周小测试" }
    ]
  },
  // 第15-16周: 中国地图小探险家
  {
    week: 15,
    theme: "中国地图小探险家",
    days: [
      { day: 1, subject: "语文", type: "阅读", content: "省级行政区名称、简称" },
      { day: 1, subject: "地理", content: "34个省级行政区基础认知" },
      { day: 1, subject: "历史", content: "首都北京简单历史" },
      { day: 2, subject: "语文", type: "说话", content: "看图说话：我想去的城市" },
      { day: 2, subject: "地理", content: "长江、黄河、五岳概念" },
      { day: 2, subject: "历史", content: "各地不同文化" },
      { day: 3, subject: "地理", content: "中国位置、邻国" },
      { day: 3, subject: "人文", content: "民族大家庭" },
      { day: 3, subject: "人文", content: "尊重不同习俗" },
      { day: 4, subject: "阅读", type: "理解", content: "中国地理阅读理解" },
      { day: 4, subject: "地理", content: "地形总复习" },
      { day: 5, subject: "语文", type: "写作", content: "我想去的城市" },
      { day: 5, subject: "测试", content: "第15-16周小测试" }
    ]
  },
  // 第17-18周: 我的成长与中华文明
  {
    week: 17,
    theme: "我的成长与中华文明",
    days: [
      { day: 1, subject: "语文", type: "阅读", content: "中华美德小故事" },
      { day: 1, subject: "历史", content: "朝代时间轴总复习" },
      { day: 1, subject: "人文", content: "自信、礼貌、感恩" },
      { day: 2, subject: "语文", type: "写作", content: "《我学到的中国文化》" },
      { day: 2, subject: "历史", content: "夏商周→秦汉→唐宋→明清" },
      { day: 2, subject: "地理", content: "中国位置总复习" },
      { day: 3, subject: "语文", type: "口语", content: "演讲：3分钟分享" },
      { day: 3, subject: "人文", content: "责任品格" },
      { day: 3, subject: "地理", content: "复习测试" },
      { day: 4, subject: "阅读", type: "综合", content: "综合阅读理解" },
      { day: 4, subject: "人文", content: "成长反思" },
      { day: 5, subject: "语文", type: "总结", content: "期末小作文" },
      { day: 5, subject: "人文", type: "作品", content: "我的18周成长手册" }
    ]
  }
];

// ============ 确保目录存在 ============
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ============ 进度管理 ============
function loadProgress() {
  const file = CONFIG.paths.progressFile;
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return {
    currentWeek: 1,
    currentDay: 1,
    completedDays: []
  };
}

function saveProgress(progress) {
  fs.writeFileSync(CONFIG.paths.progressFile, JSON.stringify(progress, null, 2));
}

// ============ 豆包API调用 ============
async function callDoubaoAPI(messages, temperature = 0.7) {
  return new Promise((resolve, reject) => {
    const requestBody = {
      model: CONFIG.doubao.model,
      messages: messages,
      temperature: temperature,
      max_tokens: 2000
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
            resolve(result.choices[0].message.content);
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

// ============ 内容生成 ============
class ChineseContentGenerator {
  constructor(date = null) {
    this.date = date || new Date().toISOString().split('T')[0];
    this.progress = loadProgress();
    this.outputDir = path.join(CONFIG.paths.outputDir, this.date);
    ensureDir(this.outputDir);
  }

  getCurrentPlan() {
    const weekIndex = Math.ceil(this.progress.currentDay / 5) - 1;
    const week = WEEKLY_PLAN[Math.min(weekIndex, WEEKLY_PLAN.length - 1)];
    const dayInWeek = ((this.progress.currentDay - 1) % 5) + 1;
    return { week, dayInWeek };
  }

  async generateDailyContent() {
    console.log(`\n📚 Teresa Chinese Generator - ${this.date}`);
    console.log(`Week ${this.progress.currentWeek}, Day ${this.progress.currentDay}`);
    
    const { week, dayInWeek } = this.getCurrentPlan();
    console.log(`Theme: ${week.theme}`);
    
    // 获取当天任务
    const dayTasks = week.days.filter(d => d.day === dayInWeek);
    
    // 生成核心任务（语文为主）
    const mainTask = dayTasks.find(t => t.subject === '语文') || dayTasks[0];
    console.log(`  Main task: ${mainTask.subject} - ${mainTask.type || mainTask.content}`);
    
    const content = {
      date: this.date,
      week: this.progress.currentWeek,
      day: this.progress.currentDay,
      theme: week.theme,
      tasks: dayTasks,
      mainTask: { ...mainTask, details: await this.generateTaskContent(mainTask) }
    };
    
    // 生成综合练习
    content.practice = await this.generatePractice(dayTasks);
    
    // 保存
    const outputFile = path.join(this.outputDir, 'content.json');
    fs.writeFileSync(outputFile, JSON.stringify(content, null, 2));
    console.log(`\n✅ Content saved to: ${outputFile}`);
    
    // 生成Markdown
    const markdownFile = path.join(this.outputDir, 'content.md');
    fs.writeFileSync(markdownFile, this.generateMarkdown(content));
    
    // 更新进度
    this.progress.currentDay++;
    if (this.progress.currentDay > 90) { // 18周 * 5天
      this.progress.currentDay = 1;
      this.progress.currentWeek++;
    }
    saveProgress(this.progress);
    
    return content;
  }

  async generateTaskContent(task) {
    const prompt = this.buildPrompt(task);
    try {
      const response = await callDoubaoAPI([prompt]);
      return this.parseContent(response, task.type);
    } catch (error) {
      console.error(`  ⚠️ Error: ${error.message}`);
      return { error: error.message };
    }
  }

  buildPrompt(task) {
    // 极简版prompt
    if (task.subject === '语文' && task.type === '字词') {
      return { role: 'user', content: `为8岁孩子生成3个中文词汇学习内容：${task.content}。JSON格式：{"words":[{"word":"词","pinyin":"ci","meaning":"意思"}]}` };
    }
    if (task.subject === '阅读') {
      return { role: 'user', content: `为8岁孩子生成阅读理解：${task.content}。JSON：{"title":"标题","content":"短文","questions":[{"q":"问题","a":"答案"}]}` };
    }
    if (task.subject === '历史') {
      return { role: 'user', content: `为8岁孩子讲历史故事：${task.content}。JSON：{"story":"故事50字","question":"问题"}` };
    }
    if (task.subject === '地理') {
      return { role: 'user', content: `为8岁孩子讲地理知识：${task.content}。JSON：{"knowledge":"知识30字","question":"问题"}` };
    }
    if (task.subject === '人文') {
      return { role: 'user', content: `为8岁孩子讲人文：${task.content}。JSON：{"content":"内容","activity":"活动"}` };
    }
    return { role: 'user', content: `生成学习内容：${task.subject} ${task.content}` };
  }

  parseContent(response, type) {
    try {
      const match = response.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch (e) {}
    return { raw: response };
  }

  async generatePractice(dayTasks) {
    // 简化：生成3道题
    const prompt = {
      role: 'user',
      content: `为8岁孩子生成2道简单选择题。主题：${dayTasks[0]?.content || '本周主题'}。JSON: {"questions":[{"q":"问题","options":["A","B"],"a":"答案"}]}`
    };
    
    try {
      const response = await callDoubaoAPI([prompt]);
      return this.parseContent(response, 'practice');
    } catch (error) {
      return { error: error.message };
    }
  }

  generateMarkdown(content) {
    let md = `# Teresa 语文学习 - ${content.date}\n\n`;
    md += `**周次**: 第${content.week}周 | **主题**: ${content.theme}\n\n`;
    md += `---\n\n`;
    
    for (const task of content.tasks) {
      md += `## ${task.subject}: ${task.type || task.content}\n\n`;
      if (task.details) {
        if (task.details.words) {
          task.details.words.forEach(w => {
            md += `### ${w.word} (${w.pinyin})\n`;
            md += `- 组词: ${w.words.join(', ')}\n`;
            md += `- 造句: ${w.sentence}\n\n`;
          });
        }
        if (task.details.story) md += `${task.details.story}\n\n`;
        if (task.details.knowledge) md += `${task.details.knowledge}\n\n`;
        if (task.details.content) md += `${task.details.content}\n\n`;
      }
    }
    
    if (content.practice && content.practice.questions) {
      md += `## 综合练习\n\n`;
      content.practice.questions.forEach((q, i) => {
        md += `**${i+1}.** ${q.question}\n`;
        if (q.options) md += `   ${q.options.join(' | ')}\n`;
        md += `\n`;
      });
    }
    
    return md;
  }
}

// ============ 主程序 ============
async function main() {
  const args = process.argv.slice(2);
  const date = args[0] || null;
  const generator = new ChineseContentGenerator(date);
  
  try {
    await generator.generateDailyContent();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

module.exports = ChineseContentGenerator;

if (require.main === module) {
  main();
}
