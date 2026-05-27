// Chatbot — OpenAI-compatible (Groq / OpenRouter / 9router local)
const IS_VERCEL = Boolean(process.env.VERCEL);

function parseMaxTokens() {
  const env = parseInt(process.env.CHATBOT_MAX_TOKENS || "0", 10);
  const fallback = IS_VERCEL ? 512 : 768;
  let tokens = Number.isFinite(env) && env > 0 ? env : fallback;
  if (IS_VERCEL) tokens = Math.min(tokens, 768);
  return Math.min(8192, Math.max(64, tokens));
}

function isLocalUrl(url) {
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(String(url || ""));
}

const OPENROUTER_BASE_URL = (
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"
).replace(/\/$/, "");

/** Chọn provider LLM */
function resolveActiveLLM() {
  const groqKey = (process.env.GROQ_API_KEY || "").trim();
  const openRouterKey = (process.env.OPENROUTER_API_KEY || "").trim();
  const openRouterLocal = isLocalUrl(OPENROUTER_BASE_URL);
  const pref = (process.env.CHATBOT_PROVIDER || "").trim().toLowerCase();

  const groqConfig = () => ({
    provider: "groq",
    chatUrl: "https://api.groq.com/openai/v1/chat/completions",
    apiKey: groqKey,
    model:
      process.env.GROQ_MODEL ||
      process.env.AI_MODEL ||
      "llama-3.1-8b-instant",
  });

  const openRouterConfig = (local) => ({
    provider: local ? "openrouter-local" : "openrouter",
    chatUrl: `${OPENROUTER_BASE_URL}/chat/completions`,
    apiKey: openRouterKey,
    model:
      process.env.OPENROUTER_MODEL ||
      (local ? "fdf" : "google/gemma-2-9b-it:free"),
  });

  if (pref === "groq" && groqKey) return groqConfig();
  if (pref === "openrouter" && openRouterKey) {
    return openRouterConfig(openRouterLocal);
  }

  // Local: ưu tiên OpenRouter / 9router (localhost)
  if (openRouterKey && openRouterLocal && !IS_VERCEL) {
    return openRouterConfig(true);
  }

  // OpenRouter cloud (HTTPS)
  if (openRouterKey && !openRouterLocal) {
    return openRouterConfig(false);
  }

  // Vercel + OpenRouter localhost không chạy được → Groq
  if (groqKey && IS_VERCEL) {
    return groqConfig();
  }

  if (groqKey) return groqConfig();

  return null;
}

module.exports = {
  IS_VERCEL,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
  OPENROUTER_BASE_URL,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || "fdf",
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  GROQ_MODEL:
    process.env.GROQ_MODEL ||
    process.env.AI_MODEL ||
    "llama-3.1-8b-instant",
  MAX_TOKENS: parseMaxTokens(),
  LLM_TIMEOUT_MS: IS_VERCEL
    ? Math.min(
        9000,
        Math.max(3000, parseInt(process.env.CHATBOT_LLM_TIMEOUT_MS || "8500", 10) || 8500)
      )
    : Math.min(
        60000,
        Math.max(5000, parseInt(process.env.CHATBOT_LLM_TIMEOUT_MS || "55000", 10) || 55000)
      ),
  TEMPERATURE: (() => {
    const t = parseFloat(process.env.CHATBOT_TEMPERATURE);
    return Number.isFinite(t) ? Math.min(2, Math.max(0, t)) : 0.5;
  })(),
  resolveActiveLLM,
  isLocalUrl,
};
