// Chatbot — API OpenAI-compatible (9router tunnel / OpenRouter)
module.exports = {
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
  OPENROUTER_BASE_URL:
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || "fdf",

  MAX_TOKENS: Math.min(
    8192,
    Math.max(64, parseInt(process.env.CHATBOT_MAX_TOKENS || "1536", 10) || 1536)
  ),
  TEMPERATURE: (() => {
    const t = parseFloat(process.env.CHATBOT_TEMPERATURE);
    return Number.isFinite(t) ? Math.min(2, Math.max(0, t)) : 0.7;
  })(),
};
