"use client";

import { useMemo, useRef, useState } from "react";
import { Bot, Loader2, MessageSquare, Send, Sparkles, X } from "lucide-react";

import { chatApi } from "../../lib/api";
import type { ChatResponse } from "../../lib/types";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  payload?: ChatResponse;
};

const STARTER_PROMPTS = [
  "I need 1 BHK in Dubai Marina under 80k",
  "Studio rent in JVC",
  "Buy villa in Palm Jumeirah",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "assistant-welcome",
      role: "assistant",
      content:
        "I’m Aurevia’s leasing advisor. Share your budget, location, and property type, and I’ll shortlist options, answer market questions, and capture your brief for follow-up.",
    },
  ]);
  const viewportRef = useRef<HTMLDivElement>(null);

  const latestAssistantPayload = useMemo(
    () => [...messages].reverse().find((message) => message.payload)?.payload ?? null,
    [messages],
  );

  async function handleSend(messageText?: string) {
    const trimmed = (messageText ?? input).trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatApi.send({ message: trimmed, user_id: "portfolio-user" });
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.reply,
        payload: response,
      };
      setMessages((current) => [...current, assistantMessage]);
      requestAnimationFrame(() => {
        viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: "smooth" });
      });
    } catch (error) {
      const fallbackMessage: ChatMessage = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "I couldn't reach the advisor service just now. Please try again in a moment.",
      };
      setMessages((current) => [...current, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-3">
      {open ? (
        <div className="glass w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-[28px] border border-white/10 shadow-[0_30px_120px_rgba(0,0,0,0.5)]">
          <div className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(201,168,76,0.12),rgba(255,255,255,0.03))] px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/12 text-brand-gold">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-gold/85">
                    AI Advisor
                  </p>
                  <h3 className="mt-1 text-base font-semibold tracking-[-0.03em] text-content-primary">
                    Aurevia Real Estate Chat
                  </h3>
                  <p className="mt-1 text-xs text-content-secondary">
                    Leasing, buying, qualification, and premium lead capture.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-content-secondary transition hover:text-content-primary"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={viewportRef} className="max-h-[460px] space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.role === "user" ? "ml-auto max-w-[88%]" : "max-w-[92%]"}
              >
                <div
                  className={
                    message.role === "user"
                      ? "rounded-[20px] rounded-br-md border border-brand-gold/20 bg-brand-gold/12 px-4 py-3 text-sm text-content-primary"
                      : "rounded-[20px] rounded-bl-md border border-white/8 bg-white/[0.035] px-4 py-3 text-sm text-content-secondary"
                  }
                >
                  {message.content}
                </div>

                {message.payload ? (
                  <div className="mt-3 space-y-3 rounded-[22px] border border-white/8 bg-black/22 p-3">
                    {message.payload.suggestions.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-gold/80">
                          Suggested Properties
                        </p>
                        {message.payload.suggestions.map((suggestion) => (
                          <div
                            key={suggestion.id}
                            className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-content-primary">{suggestion.title}</p>
                                <p className="mt-1 text-xs text-content-secondary">
                                  {suggestion.location} · {suggestion.property_type} · {suggestion.transaction_type}
                                </p>
                              </div>
                              <span className="text-sm font-semibold text-brand-gold">
                                AED {suggestion.price_aed.toLocaleString()}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-content-secondary">{suggestion.match_reason}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {message.payload.market_insight ? (
                      <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-gold/80">
                          Market Insight
                        </p>
                        <p className="mt-2 text-sm text-content-secondary">
                          {message.payload.market_insight.insight}
                        </p>
                      </div>
                    ) : null}

                    {message.payload.lead_created ? (
                      <div className="rounded-[18px] border border-emerald-500/18 bg-emerald-500/8 px-3 py-3 text-xs text-emerald-300">
                        Lead captured successfully
                        {message.payload.high_priority ? " and marked high priority." : "."}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}

            {loading ? (
              <div className="max-w-[92%] rounded-[20px] rounded-bl-md border border-white/8 bg-white/[0.035] px-4 py-3 text-sm text-content-secondary">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-gold" />
                  Aurevia is preparing your shortlist...
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/8 px-4 py-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void handleSend(prompt)}
                  className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-content-secondary transition hover:border-brand-gold/20 hover:text-content-primary"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleSend();
              }}
              className="flex items-end gap-3"
            >
              <label className="glass flex min-h-[56px] flex-1 items-end gap-3 rounded-[20px] px-4 py-3">
                <Sparkles className="mb-1 h-4 w-4 shrink-0 text-brand-gold" />
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Tell me what you need: area, budget, property type..."
                  className="max-h-28 min-h-[24px] w-full resize-none bg-transparent text-sm text-content-primary outline-none placeholder:text-content-muted"
                  rows={1}
                />
              </label>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-brand-gold/20 bg-[linear-gradient(180deg,#e0bf67_0%,#c9a84c_100%)] text-surface-base transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="glass flex items-center gap-3 rounded-full border border-brand-gold/16 px-4 py-3 text-content-primary shadow-[0_20px_60px_rgba(0,0,0,0.42)] transition hover:border-brand-gold/28 hover:-translate-y-0.5"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-gold/18 bg-brand-gold/12 text-brand-gold">
          <MessageSquare className="h-4.5 w-4.5" />
        </div>
        <div className="text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold/80">AI Advisor</p>
          <p className="text-sm text-content-primary">Talk to Aurevia</p>
        </div>
      </button>

      {latestAssistantPayload?.high_priority ? (
        <div className="rounded-full border border-brand-gold/18 bg-brand-gold/10 px-3 py-1.5 text-xs text-brand-gold">
          High-priority lead ready for handoff
        </div>
      ) : null}
    </div>
  );
}
