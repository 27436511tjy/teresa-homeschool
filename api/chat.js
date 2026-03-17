const axios = require('axios');

module.exports = async (req, res) => {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, history, isVoice } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // 豆包API配置
    const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY || '12ded337-7298-4ae7-8eff-5b5ebde935e2';
    const DOUBAO_MODEL = 'doubao-seed-2-0-pro-260215';
    const DOUBAO_ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/responses';

    // 构建对话上下文
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
    
    // 添加当前消息
    messages.push({ role: 'user', content: message });

    // 调用豆包API
    const response = await axios.post(
      DOUBAO_ENDPOINT,
      {
        model: DOUBAO_MODEL,
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${DOUBAO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data?.choices?.[0]?.message?.content || "I'm sorry, dear Teresa. Let me think about that... Could you ask me again?";
    
    res.json({ 
      response: aiResponse,
      success: true
    });

  } catch (error) {
    console.error('豆包API调用失败:', error.response?.data || error.message);
    res.json({ 
      response: "I'm having trouble thinking right now, dear. Let's try again in a moment! 🧙‍♂️",
      success: false,
      error: error.message
    });
  }
};
