import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, MessageSquareText, RefreshCw, Send } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

const Chat = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const token = session?.access_token ?? "";
  const [draft, setDraft] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const sessionsQuery = useQuery({
    queryKey: ["chat-sessions", token],
    queryFn: () => api.chatSessions(token),
    enabled: !!token,
  });

  useEffect(() => {
    if (!activeSessionId && sessionsQuery.data?.[0]?.id) {
      setActiveSessionId(sessionsQuery.data[0].id);
    }
  }, [activeSessionId, sessionsQuery.data]);

  const sessionDetailQuery = useQuery({
    queryKey: ["chat-session", token, activeSessionId],
    queryFn: () => api.chatSession(token, activeSessionId!),
    enabled: !!token && !!activeSessionId,
  });

  const messageMutation = useMutation({
    mutationFn: (message: string) =>
      api.chatMessage(token, {
        message,
        session_id: activeSessionId,
      }),
    onSuccess: (response) => {
      setActiveSessionId(response.session.id);
      setDraft("");
      queryClient.setQueryData(["chat-session", token, response.session.id], response.session);
      queryClient.invalidateQueries({ queryKey: ["chat-sessions", token] });
    },
  });

  const activeMessages = useMemo(
    () => sessionDetailQuery.data?.messages ?? [],
    [sessionDetailQuery.data?.messages]
  );

  const submit = async () => {
    const message = draft.trim();
    if (!message || messageMutation.isPending) return;
    await messageMutation.mutateAsync(message);
  };

  return (
    <AppLayout>
      <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-4 h-[calc(100vh-7rem)]">
        <aside className="glass-card rounded-2xl p-4 overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display font-semibold text-foreground">Conversations</h2>
              <p className="text-xs text-muted-foreground">
                Available for the current backend session.
              </p>
            </div>
            <button
              onClick={() => setActiveSessionId(null)}
              className="rounded-xl border border-border px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
            >
              New chat
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-13rem)]">
            {sessionsQuery.data?.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSessionId(item.id)}
                className={`w-full text-left rounded-2xl border px-3 py-3 transition-colors ${
                  activeSessionId === item.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background/40 hover:bg-secondary"
                }`}
              >
                <div className="font-medium text-sm text-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(item.updated_at).toLocaleString()}
                </div>
              </button>
            ))}
            {!sessionsQuery.data?.length && (
              <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                No saved chats yet. Start a new conversation.
              </div>
            )}
          </div>
        </aside>

        <section className="glass-card rounded-2xl flex flex-col overflow-hidden">
          <div className="border-b border-border/60 px-5 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display font-semibold text-foreground">Wellness Assistant</h1>
                <p className="text-xs text-muted-foreground">
                  LangChain agent with dashboard and integration tools when configured.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                sessionsQuery.refetch();
                if (activeSessionId) {
                  sessionDetailQuery.refetch();
                }
              }}
              className="rounded-xl border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4 bg-background/30">
            {!activeMessages.length && (
              <div className="h-full flex items-center justify-center">
                <div className="max-w-md text-center">
                  <MessageSquareText className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Start a focused check-in
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Ask how your dashboard looks, whether your platforms are connected, or just talk through what feels difficult today.
                  </p>
                </div>
              </div>
            )}

            {activeMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground"
                  }`}
                >
                  <div>{message.content}</div>
                  <div className="mt-2 text-[10px] opacity-70">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {messageMutation.isPending && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border/60 p-4">
            {messageMutation.isError && (
              <p className="text-sm text-destructive mb-3">
                {messageMutation.error instanceof Error
                  ? messageMutation.error.message
                  : "Could not send message."}
              </p>
            )}
            <div className="flex items-end gap-3">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void submit();
                  }
                }}
                rows={3}
                placeholder="Ask for a dashboard summary, integration status, or share how you're feeling."
                className="min-h-[96px] flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
              />
              <button
                onClick={() => void submit()}
                disabled={!draft.trim() || messageMutation.isPending}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Chat;
