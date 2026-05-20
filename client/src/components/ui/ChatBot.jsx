import { useState, useRef, useEffect } from "react";
import faqData from "../../data/faqData.js";
import chatbotImg from "../../assets/chatbot.webp";

function matchAnswer(input) {
  const words = input.toLowerCase().split(/\s+/).filter(Boolean);
  let best = null;
  let bestScore = 0;

  for (const entry of faqData) {
    let score = 0;
    for (const word of words) {
      if (entry.tags.some((t) => t.includes(word) || word.includes(t))) score += 1;
      if (entry.q.toLowerCase().includes(word)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return bestScore > 0 ? best : null;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm MediBee, your MedFlow assistant. Ask me about orders, accounts, shipping, or anything else." },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((p) => [...p, { from: "user", text }]);

    setTimeout(() => {
      const match = matchAnswer(text);
      if (match) {
        setMessages((p) => [...p, { from: "bot", text: match.a }]);
      } else {
        setMessages((p) => [
          ...p,
          {
            from: "bot",
            text: "I'm not sure about that. Try asking differently or email support@medflow.pk for help.",
          },
        ]);
      }
    }, 300);
  };

  return (
    <>
      {/* Bubble */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-white shadow-xl transition hover:bg-accent active:scale-95 overflow-hidden"
        aria-label="Chat with us"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <img src={chatbotImg} alt="MediBee" className="h-full w-full object-cover" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[360px] flex-col rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-secondary">
              <img src={chatbotImg} alt="MediBee" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">MediBee</p>
              <p className="text-[10px] text-slate-500">Online</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex h-80 flex-col gap-3 overflow-y-auto px-4 py-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.from === "user"
                      ? "bg-secondary text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-slate-800 px-4 py-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a question…"
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-secondary"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-white transition hover:bg-accent disabled:opacity-40"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
