import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { sendChatbotMessage } from "../../api/chatbotAPI";

const INITIAL_MESSAGE = {
  role: "assistant",
  content: "Hi, I am your AI assistant. Ask me anything about the clinic system.",
};

const getErrorMessage = (error) => {
  const status = error?.response?.status;
  const serverMessage = error?.response?.data?.message;

  if (serverMessage) return serverMessage;
  if (status === 429) return "Too many requests right now. Please wait a moment and try again.";
  if (status === 503) return "AI service is not configured yet. Please check the backend Gemini API key.";
  if (status >= 500) return "AI service is temporarily unavailable. Please try again shortly.";
  if (error?.code === "ECONNABORTED") return "The AI response took too long. Please try again.";
  return "I could not connect to the AI service. Please check your connection and try again.";
};

function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter((message) => message.content && message.role !== "system")
        .map((message) => ({
          role: message.role,
          content: message.content,
        }));

      const response = await sendChatbotMessage({ message: text, history });
      const reply = response?.data?.reply || response?.data?.data?.reply || "I could not generate a response.";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: getErrorMessage(error),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end">
      {open && (
        <section className="mb-3 flex h-[min(620px,calc(100vh-7rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-2xl shadow-primary-900/20">
          <header className="flex items-center justify-between bg-gradient-to-r from-primary-700 via-primary-600 to-emerald-500 px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                <Bot size={21} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-extrabold">Ashu Care AI</h2>
                <p className="truncate text-xs font-medium text-white/75">Gemini powered assistant</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
              aria-label="Close Chatbot"
              title="Close"
            >
              <X size={18} />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-surface-50/80 px-4 py-4">
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div key={`${message.role}-${index}`} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? "rounded-br-md bg-primary-600 text-white"
                        : message.isError
                          ? "rounded-bl-md border border-rose-100 bg-rose-50 text-rose-700"
                          : "rounded-bl-md border border-surface-100 bg-white text-surface-800"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-surface-100 bg-white px-3.5 py-2.5 text-sm text-surface-500 shadow-sm">
                  <Loader2 size={16} className="animate-spin text-primary-600" />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-surface-100 bg-white p-3">
            <div className="flex items-end gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/15">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Type your question..."
                className="max-h-24 min-h-[36px] flex-1 resize-none border-none bg-transparent py-2 text-sm text-surface-900 outline-none placeholder:text-surface-400"
                disabled={loading}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-surface-300"
                aria-label="Send Message"
                title="Send"
              >
                {loading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
              </button>
            </div>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-xl shadow-primary-700/25 ring-1 ring-white/50 transition hover:-translate-y-0.5 hover:bg-primary-700"
        aria-label={open ? "Close Chatbot" : "Open Chatbot"}
        title={open ? "Close Chatbot" : "Open Chatbot"}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && <Sparkles size={13} className="absolute right-3 top-3 text-emerald-100" />}
      </button>
    </div>
  );
}

export default ChatbotWidget;
