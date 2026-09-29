import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMessages, sendMessage, type ChatMessage } from "../services/messageService";
import { useMarketplaceAuth } from "../hooks/useMarketplaceAuth";
import { getSocket } from "../lib/socket";

export default function BookingChat({ bookingId }: { bookingId: string }) {
  const { user } = useMarketplaceAuth();
  const [text, setText] = useState("");
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["messages", bookingId],
    queryFn: () => getMessages(bookingId),
  });

  const mutation = useMutation({
    mutationFn: (value: string) => sendMessage(bookingId, value),
    onSuccess: (result) => {
      queryClient.setQueryData<{ messages: ChatMessage[] }>(["messages", bookingId], (prev) =>
        prev ? { messages: [...prev.messages, result.message] } : { messages: [result.message] },
      );
      setText("");
    },
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (payload: { bookingId: string; message: ChatMessage }) => {
      if (payload.bookingId !== bookingId) return;
      queryClient.setQueryData<{ messages: ChatMessage[] }>(["messages", bookingId], (prev) => {
        if (!prev) return { messages: [payload.message] };
        if (prev.messages.some((m) => m._id === payload.message._id)) return prev;
        return { messages: [...prev.messages, payload.message] };
      });
    };
    socket.on("chat:message", handler);
    return () => {
      socket.off("chat:message", handler);
    };
  }, [bookingId, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [data?.messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || mutation.isPending) return;
    mutation.mutate(text.trim());
  };

  return (
    <div className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">
      <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
        {isLoading && <p className="text-sm text-[var(--sea-ink-soft)]">Loading messages...</p>}
        {!isLoading && data?.messages.length === 0 && (
          <p className="text-sm text-[var(--sea-ink-soft)]">No messages yet. Say hello!</p>
        )}
        {data?.messages.map((m) => {
          const isMine = m.senderId?._id === user?.id;
          return (
            <div key={m._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-xl px-3 py-1.5 text-sm ${
                  isMine
                    ? "bg-[linear-gradient(135deg,var(--lagoon),var(--lagoon-deep))] text-white"
                    : "bg-[var(--surface)] text-[var(--sea-ink)]"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-full bg-[var(--lagoon-deep)] px-4 py-1.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
