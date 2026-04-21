const STOPWORDS = [
  "this", "that", "with", "from", "have",
  "cannot", "read", "write", "error",
  "code", "value", "data", "object",
  "undefined", "null", "function", "variable"
];

const extractKeywords = (text) => {
  if (!text) return [];

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(" ");

  const filtered = words.filter(word =>
    word.length > 3 && !STOPWORDS.includes(word)
  );

  return [...new Set(filtered)];
};

module.exports = extractKeywords;