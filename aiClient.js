import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function generateScenario(prompt) {
  const mode = process.env.AI_BACKEND_MODE;

  if (mode === 'openai' || mode === 'both') {
    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );
      return res.data.choices[0].message.content.trim();
    } catch (e) {
      console.warn('[OpenAI失敗]', e.message);
      if (mode === 'openai') throw e;
    }
  }

  return `⚠️ シチュエーション案の生成に失敗しました（${new Date().toLocaleString('ja-JP')}）`;
}
