import OpenAI from "openai";

const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1";

if (!apiKey) {
  console.warn("Warning: OpenAI API key not set. Fortune generation will not work.");
}

export const openai = new OpenAI({
  apiKey: apiKey || "dummy-key",
  baseURL,
});
