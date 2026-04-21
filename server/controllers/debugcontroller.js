const DebugSession = require("../models/debug session");
const { analyzeError } = require("../services/aiservices");
const extractKeywords = require("../utils/extractKeywords");

const detectErrorType = (error) => {
  if (!error) return "Unknown";

  const e = error.toLowerCase();

  if (e.includes("typeerror")) return "TypeError";
  if (e.includes("referenceerror")) return "ReferenceError";
  if (e.includes("syntaxerror")) return "SyntaxError";

  return "Unknown";
};

const calculateScore = (input, stored) => {
  if (!input.length) return 0;

  const storedSet = new Set(stored);
  let match = 0;

  for (let word of input) {
    if (storedSet.has(word)) match++;
  }

  return match / input.length;
};

const createDebug = async (req, res) => {
  try {
    const { error, code, language } = req.body;

    if (!error || !code) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const keywords = extractKeywords(error);

    if (keywords.length === 0) {
      return res.status(400).json({
        message: "No meaningful keywords"
      });
    }
    const existing = await DebugSession.findOne({ error });

    if (existing) {
      existing.hitCount = (existing.hitCount || 0) + 1;
      await existing.save();

      return res.status(200).json({
        source: "cache",
        score: 1,
        matched_keywords: existing.keywords,
        hitCount: existing.hitCount,
        data: existing
      });
    }
    const candidates = await DebugSession.find({
      keywords: { $in: keywords }
    }).limit(20);

    let bestMatch = null;
    let bestScore = 0;
    let bestMatchedWords = [];

    for (let doc of candidates) {
      const storedSet = new Set(doc.keywords);

      let matchedWords = [];
      let matchCount = 0;

      for (let word of keywords) {
        if (storedSet.has(word)) {
          matchCount++;
          matchedWords.push(word);
        }
      }

      const score = matchCount / keywords.length;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = doc;
        bestMatchedWords = matchedWords;
      }
    }
    if (bestMatch && bestScore > 0.4) {
      bestMatch.hitCount = (bestMatch.hitCount || 0) + 1;
      await bestMatch.save();

      return res.status(200).json({
        source: "cache",
        score: bestScore,
        matched_keywords: bestMatchedWords,
        hitCount: bestMatch.hitCount,
        data: bestMatch
      });
    }
    const aiResult = await analyzeError({ error, code, language });

    const session = new DebugSession({
      error,
      code,
      language,
      keywords, 

      error_type:
        aiResult?.error_type || detectErrorType(error),

      explanation: aiResult?.explanation || "Basic analysis",
      possible_causes:
        aiResult?.possible_causes || [
          "Undefined or null value",
          "Incorrect data structure"
        ],
      recommended_fixes:
        aiResult?.recommended_fixes || [
          "Check variable initialization",
          "Use console.log debugging"
        ],
      confidence: aiResult?.confidence || 0.3,
      fixed_code: aiResult?.fixed_code || "",

      hitCount: 0
    });

    await session.save();

    return res.status(201).json({
      source: "ai",
      data: session
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

const history = async (req, res) => {
  try {
    const sessions = await DebugSession
      .find()
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(sessions);

  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};
const getDebugById = async (req, res) => {
  try {
    const session = await DebugSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(session);
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};
const deleteHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await DebugSession.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};
const clearAllHistory = async (req, res) => {
  try {
    await DebugSession.deleteMany({});
    res.status(200).json({ message: "All history cleared" });
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};
module.exports = {
  createDebug,
  history,
  getDebugById,
  deleteHistoryItem,
  clearAllHistory
};

