import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function generateScenario(prompt) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const mode = process.env.AI_BACKEND_MODE;
  const fallbackModels = [
    "models/gemini-2.0-pro",
    "models/gemini-2.0-flash",
    "models/gemini-pro",
  ];

  if (mode !== "gemini" && mode !== "both") {
    return "⚠️ Gemini以外のバックエンドは未対応です。";
  }

  const headers = { "Content-Type": "application/json" };

  for (const modelName of fallbackModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
      console.log(`[Gemini] 試行モデル: ${modelName}`);
      const res = await axios.post(
        url,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
        { headers },
      );

      const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    } catch (e) {
      console.warn(
        `[Geminiモデル失敗] ${modelName}`,
        e.response?.data?.error?.message || e.message,
      );
    }
  }

  return `⚠️ すべてのGeminiモデルで生成に失敗しました（${new Date().toLocaleString("ja-JP")}）`;
}
