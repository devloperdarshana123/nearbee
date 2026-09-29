import { useState, useRef, useEffect } from "react";
import { sendChatMessage, type ChatMessage } from "../services/chatService";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm the NearBee assistant. Ask me anything about finding or booking a local service provider." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const { reply } = await sendChatMessage(nextMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble responding right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] shadow-2xl">
          <div className="flex items-center justify-between bg-[linear-gradient(135deg,var(--lagoon),var(--lagoon-deep))] px-4 py-3 text-white">
            <span className="font-semibold">NearBee Assistant</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-[var(--lagoon)] text-white"
                    : "bg-[color-mix(in_oklab,var(--lagoon)_10%,transparent)] text-[var(--text)]"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="max-w-[60%] rounded-2xl bg-[color-mix(in_oklab,var(--lagoon)_10%,transparent)] px-3 py-2 text-sm text-[var(--text)]">
                Typing…
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-[var(--line)] p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask something…"
              className="flex-1 rounded-full border border-[var(--line)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--lagoon-deep)]"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading}
              className="rounded-full bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--lagoon),var(--lagoon-deep))] text-2xl text-white shadow-[0_8px_20px_rgba(50,143,151,0.42)] transition hover:-translate-y-0.5"
        aria-label="Toggle chat"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
