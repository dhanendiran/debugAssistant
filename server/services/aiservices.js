const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
async function generateWithRetry(prompt, retries = 3, delay = 1000) {
  try {
    return await model.generateContent(prompt);
  } catch (err) {
    if (retries === 0) throw err;

    if (err.message.includes("503")) {
      console.log(`Retrying Gemini... attempts left: ${retries}`);
      await sleep(delay);
      return generateWithRetry(prompt, retries - 1, delay * 2)
    }

    throw err;
  }
}

const analyzeError = async ({ error, code, language }) => {
  try {
    const prompt = `
You are an expert debugging assistant.

Return ONLY valid JSON. No explanation outside JSON.

{
  "error_type": "",
  "explanation": "",
  "possible_causes": [],
  "recommended_fixes": [],
  "confidence": 0,
  "fixed_code": "",
  "keywords": []
}

Error: ${error}
Code: ${code}
Language: ${language}
`;

    const result = await generateWithRetry(prompt);

    const text = result.response.text();

    let cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    let parsed;
    try {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

      if (!jsonMatch) throw new Error("No JSON found");

      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Parse failed. Raw output:", cleaned);

      return fallbackResponse("AI response parsing failed");
    }
    return {
      error_type: parsed.error_type || "Unknown",
      explanation: parsed.explanation || "",
      possible_causes: Array.isArray(parsed.possible_causes)
        ? parsed.possible_causes
        : [],
      recommended_fixes: Array.isArray(parsed.recommended_fixes)
        ? parsed.recommended_fixes
        : [],
        fixed_code: parsed.fixed_code || "",
      confidence: Math.min(Math.max(parsed.confidence || 0, 0), 1),
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : []
    };

  } catch (err) {
    console.error("Gemini Error:", err.message);

    return fallbackResponse("AI service unavailable");
  }
};

function fallbackResponse(reason) {
  return {
    error_type: "Unknown",
    explanation: reason,
    possible_causes: [
      "Undefined or null variable usage",
      "Incorrect function call",
      "Syntax or logical error"
    ],
    recommended_fixes: [
      "Use console.log to inspect values",
      "Validate inputs before usage",
      "Check stack trace for exact failure line"
    ],fixed_code: "",
    confidence: 0.2,
    keywords: []
  };
}

module.exports = { analyzeError };

