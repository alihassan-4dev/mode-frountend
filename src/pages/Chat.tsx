import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bot,
  MessageSquareText,
  RefreshCw,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, api, type ChatMessage } from "@/lib/api";

const CHAT_SESSION_STORAGE_KEY = "mode-active-chat-session";

function createSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function AssistantMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ inline, children }) =>
          inline ? (
            <code className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
              {children}
            </code>
          ) : (
            <code className="block overflow-x-auto rounded-2xl bg-secondary/80 p-3 font-mono text-[0.85em] text-foreground">
              {children}
            </code>
          ),
        pre: ({ children }) => <pre className="mb-3 last:mb-0">{children}</pre>,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary underline decoration-primary/40 underline-offset-4"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mb-3 border-l-2 border-primary/40 pl-4 italic text-muted-foreground last:mb-0">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

const Chat = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const token = session?.access_token ?? "";
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [draft, setDraft] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    if (typeof window === "undefined") {
      return createSessionId();
    }
    return window.localStorage.getItem(CHAT_SESSION_STORAGE_KEY) || createSessionId();
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingReply, setStreamingReply] = useState<ChatMessage | null>(null);
  const [streamingText, setStreamingText] = useState("");

  const sessionDetailQuery = useQuery({
    queryKey: ["chat-session", token, activeSessionId],
    queryFn: async () => {
      try {
        return await api.chatSession(token, activeSessionId);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!token,
    staleTime: 30_000,
  });

  const messageMutation = useMutation({
    mutationFn: (message: string) =>
      api.chatMessage(token, {
        message,
        session_id: activeSessionId,
      }),
    onSuccess: (response) => {
      setActiveSessionId(response.session.id);
      setMessages(response.session.messages.filter((item) => item.id !== response.reply.id));
      setStreamingReply(response.reply);
      setStreamingText("");
      queryClient.setQueryData(["chat-session", token, response.session.id], response.session);
    },
    onError: () => {
      void sessionDetailQuery.refetch();
    },
  });

  const isBusy = messageMutation.isPending || !!streamingReply;

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CHAT_SESSION_STORAGE_KEY, activeSessionId);
    }
  }, [activeSessionId]);

  useEffect(() => {
    if (messageMutation.isPending || streamingReply) {
      return;
    }
    setMessages(sessionDetailQuery.data?.messages ?? []);
  }, [messageMutation.isPending, sessionDetailQuery.data, streamingReply]);

  useEffect(() => {
    if (!streamingReply) {
      return;
    }

    const fullText = streamingReply.content;
    if (!fullText) {
      setMessages((current) => [...current, streamingReply]);
      setStreamingReply(null);
      setStreamingText("");
      return;
    }

    let index = 0;
    const step = Math.max(1, Math.ceil(fullText.length / 48));
    const timer = window.setInterval(() => {
      index = Math.min(fullText.length, index + step);
      setStreamingText(fullText.slice(0, index));

      if (index >= fullText.length) {
        window.clearInterval(timer);
        setMessages((current) => [...current, streamingReply]);
        setStreamingReply(null);
        setStreamingText("");
      }
    }, 24);

    return () => window.clearInterval(timer);
  }, [streamingReply]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, messageMutation.isPending, streamingText]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [draft]);

  const resetChat = () => {
    const previousSessionId = activeSessionId;
    const nextSessionId = createSessionId();
    setActiveSessionId(nextSessionId);
    setMessages([]);
    setStreamingReply(null);
    setStreamingText("");
    setDraft("");
    queryClient.removeQueries({ queryKey: ["chat-session", token, previousSessionId] });
  };

  const submit = async () => {
    const message = draft.trim();
    if (!message || isBusy) return;

    const optimisticMessage: ChatMessage = {
      id: `pending-${Date.now()}`,
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimisticMessage]);
    setDraft("");
    try {
      await messageMutation.mutateAsync(message);
    } catch {
      // Error UI is handled by the mutation state and refetch path.
    }
  };

  return (
    <AppLayout contentClassName="h-[calc(100dvh-3.5rem)] p-0 md:h-dvh md:p-6 lg:p-8 md:max-w-7xl md:mx-auto">
      <section className="glass-card relative flex h-full min-h-0 flex-col overflow-hidden rounded-none border-x-0 border-b-0 border-white/50 md:rounded-[28px] md:border md:border-white/50">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-primary/16 via-accent/12 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-white/60 opacity-80" />

        <div className="relative border-b border-border/60 bg-background/72 px-4 py-3.5 backdrop-blur md:px-6 md:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm shadow-primary/10 ring-1 ring-primary/10">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                    <Sparkles className="h-3 w-3" />
                    Mobile-first chat
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    Session {activeSessionId.slice(0, 8)}
                  </span>
                </div>
                <h1 className="font-display text-lg font-semibold text-foreground md:text-xl">
                  Wellness Assistant
                </h1>
                <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-muted-foreground">
                  Smooth, single-session chat tuned for mobile with clean Markdown replies.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <button
                onClick={() => void sessionDetailQuery.refetch()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/85 px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
                aria-label="Refresh chat"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sm:hidden">Refresh</span>
              </button>
              <button
                onClick={resetChat}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/85 px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
              >
                <RotateCcw className="h-4 w-4" />
                New chat
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="chat-scroll relative flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-3 py-4 md:gap-4 md:px-6 md:py-5"
        >
          {!messages.length && !messageMutation.isPending && !streamingReply && (
            <div className="flex min-h-[45dvh] items-center justify-center py-6 md:min-h-[50dvh]">
              <div className="mx-auto max-w-xl rounded-[28px] border border-border/70 bg-background/80 px-4 py-5 text-center shadow-sm backdrop-blur md:px-8 md:py-8">
                <MessageSquareText className="mx-auto mb-3 h-10 w-10 text-primary" />
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Start a focused check-in
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Ask for a dashboard summary, check your integrations, or talk
                  through what feels difficult today. The screen stays clean on
                  mobile and does not show old session history.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {[
                    "Give me a quick dashboard summary",
                    "Check my connected platforms",
                    "Help me organize my day",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setDraft(prompt)}
                      className="rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-secondary"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[89%] rounded-[24px] px-4 py-3 text-sm leading-7 shadow-sm md:max-w-[78%] ${
                  message.role === "user"
                    ? "rounded-br-md bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "rounded-bl-md border border-border bg-card text-foreground shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
                }`}
              >
                <div className="mb-2 flex items-center gap-2 text-[11px] font-medium tracking-[0.12em] opacity-70">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                    message.role === "user"
                      ? "bg-white/12 text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  }`}>
                    {message.role === "user" ? "Y" : <Bot className="h-3.5 w-3.5" />}
                  </span>
                  {message.role === "user" ? "You" : "Assistant"}
                </div>
                {message.role === "assistant" ? (
                  <div className="chat-markdown">
                    <AssistantMessage content={message.content} />
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                )}
                <div className="mt-2 text-[10px] uppercase tracking-[0.14em] opacity-65">
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}

          {messageMutation.isPending && (
            <div className="flex justify-start">
              <div className="max-w-[89%] rounded-[24px] rounded-bl-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-[0_12px_30px_rgba(15,23,42,0.06)] md:max-w-[78%]">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-medium tracking-[0.12em] opacity-70">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-3.5 w-3.5" />
                  </span>
                  Assistant
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary/80 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" />
                  </span>
                  Thinking...
                </div>
              </div>
            </div>
          )}

          {streamingReply && (
            <div className="flex justify-start">
              <div className="max-w-[89%] rounded-[24px] rounded-bl-md border border-border bg-card px-4 py-3 text-sm leading-7 text-foreground shadow-[0_12px_30px_rgba(15,23,42,0.06)] md:max-w-[78%]">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-medium tracking-[0.12em] opacity-70">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-3.5 w-3.5" />
                  </span>
                  Assistant
                </div>
                <div className="chat-markdown">
                  <AssistantMessage content={streamingText} />
                  <span className="ml-0.5 inline-block h-4 w-2 animate-pulse rounded-sm bg-primary/60 align-[-2px]" />
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.14em] opacity-65">
                  {new Date(streamingReply.created_at).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border/60 bg-background/88 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:px-5 md:pb-5 md:pt-4">
          {messageMutation.isError && (
            <p className="mb-3 text-sm text-destructive">
              {messageMutation.error instanceof Error
                ? messageMutation.error.message
                : "Could not send message."}
            </p>
          )}

          <div className="rounded-[26px] border border-border bg-card/95 p-2 shadow-[0_-8px_30px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void submit();
                  }
                }}
                rows={1}
                placeholder="Type your message..."
                className="max-h-40 min-h-[52px] w-full resize-none rounded-[20px] bg-transparent px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => void submit()}
                disabled={!draft.trim() || isBusy}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[20px] bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-transform disabled:opacity-50 sm:w-auto sm:min-w-[112px]"
              >
                <Send className="h-4 w-4" />
                {isBusy ? "Working..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default Chat;
