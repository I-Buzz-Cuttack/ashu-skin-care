import { asyncHandler } from "../utils/asyncHandler.js";
import { generateChatReply } from "../services/geminiChat.service.js";

const friendlyError = (err) => {
  const message = String(err?.message || "").toLowerCase();
  if (err?.status === 400) return "Please enter a message.";
  if (
    message.includes("api key") ||
    message.includes("api_key") ||
    message.includes("permission") ||
    message.includes("api_key_invalid") ||
    message.includes("invalid api") ||
    message.includes("not configured")
  ) {
    return "The AI assistant is not configured correctly. Please contact the administrator.";
  }
  if (message.includes("rate") || err?.status === 429) {
    return "The AI assistant is busy right now. Please try again in a moment.";
  }
  if (message.includes("timeout")) {
    return "The AI assistant took too long to respond. Please try again.";
  }
  return "The AI assistant is unavailable right now. Please try again later.";
};

export const chat = asyncHandler(async (req, res) => {
  try {
    const reply = await generateChatReply({
      message: req.body?.message,
      history: req.body?.history,
    });

    return res.json({ success: true, reply });
  } catch (err) {
    console.error("[chatbot] Gemini request failed", {
      status: err?.status || err?.code,
      message: err?.message,
    });

    const status = err.status && err.status < 500 ? err.status : 502;
    return res.status(status).json({
      success: false,
      message: friendlyError(err),
    });
  }
});
