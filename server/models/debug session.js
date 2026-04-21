
const mongoose = require("mongoose");

const debugSchema = new mongoose.Schema({
  error: { type: String, required: true },
  code: { type: String, required: true },
  language: String,

  keywords: [String],

  error_type: String,
  explanation: String,
  possible_causes: [String],
  recommended_fixes: [String],
  confidence: Number,
  fixed_code: String,

  hitCount: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

module.exports = mongoose.model("DebugSession", debugSchema)