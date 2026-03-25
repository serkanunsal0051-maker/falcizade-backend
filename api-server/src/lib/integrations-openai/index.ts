import OpenAI from "openai";

const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1";

if (!apiKey) {
  console.warn("⚠️  WARNING: OpenAI API key not set. Fortune generation will fail.");
  console.warn("Set one of: AI_INTEGRATIONS_OPENAI_API_KEY or OPENAI_API_KEY");
} else {
  console.log("✅ OpenAI initialized with API key");
  console.log("Base URL:", baseURL);
}

export const openai = new OpenAI({
  apiKey: apiKey || "dummy-key-will-fail",
  baseURL,
});
