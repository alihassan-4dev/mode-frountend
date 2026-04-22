/**
 * Central place for all backend HTTP calls.
 *
 * Local development should usually leave `VITE_API_URL` empty so requests stay
 * same-origin (`/api/...`) and flow through the Vite proxy without CORS issues.
 */

import type { AuthSession } from "@/types/auth";

export interface DashboardMetric {
  label: string;
  value: number;
  display_value: string;
  trend: string;
  detail: string;
}

export interface PlatformBreakdownItem {
  platform: "facebook" | "instagram";
  connected: boolean;
  connected_at: string | null;
  last_synced_at: string | null;
  summary: string;
}

export interface DashboardSummary {
  user_id: string;
  generated_at: string;
  metrics: DashboardMetric[];
  platform_breakdown: PlatformBreakdownItem[];
  recommendations: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[];
}

export interface ChatResponse {
  session: ChatSessionDetail;
  reply: ChatMessage;
  provider: string;
  used_tools: string[];
}

function baseUrl(): string {
  return (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
}

function buildUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = baseUrl();
  return base ? `${base}${p}` : p;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit & { accessToken?: string } = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.accessToken) {
    headers.set("Authorization", `Bearer ${init.accessToken}`);
  }
  if (init.body && typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  const data = await parseJson<T & { error?: string; message?: string }>(res);

  if (!res.ok) {
    let detailMsg: string | null = null;
    if (data && typeof data === "object" && "detail" in data) {
      const d = (data as { detail?: unknown }).detail;
      if (typeof d === "string") {
        detailMsg = d;
      } else if (d && typeof d === "object" && "message" in d && typeof d.message === "string") {
        detailMsg = d.message;
      } else if (Array.isArray(d) && d.length > 0 && typeof d[0] === "object" && d[0] !== null && "msg" in d[0]) {
        detailMsg = String((d[0] as { msg: string }).msg);
      }
    }
    const msg =
      detailMsg ||
      (data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : null) ||
      (data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : null) ||
      res.statusText;
    throw new ApiError(msg, res.status, data);
  }

  return data as T;
}

/** Typed API surface — keep every endpoint here. */
export const api = {
  health: () => apiFetch<{ status: string; service: string; time: string }>("/api/health"),
  version: () => apiFetch<{ version: string }>("/api/version"),
  me: (accessToken: string) =>
    apiFetch<{ id: string; email: string | undefined; createdAt: string; metadata: Record<string, unknown> }>(
      "/api/me",
      { accessToken }
    ),
  authRegister: (body: { email: string; password: string; full_name?: string | null }) =>
    apiFetch<AuthSession>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  authLogin: (body: { email: string; password: string }) =>
    apiFetch<AuthSession>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  authUpdatePassword: (accessToken: string, password: string) =>
    apiFetch<AuthSession>("/api/auth/password", {
      method: "PATCH",
      body: JSON.stringify({ password }),
      accessToken,
    }),
  dashboardSummary: (accessToken: string) =>
    apiFetch<DashboardSummary>(
      "/api/dashboard/summary",
      { accessToken }
    ),
  chatSessions: (accessToken: string) =>
    apiFetch<ChatSession[]>("/api/chat/sessions", { accessToken }),
  chatSession: (accessToken: string, sessionId: string) =>
    apiFetch<ChatSessionDetail>(`/api/chat/sessions/${sessionId}`, { accessToken }),
  chatMessage: (accessToken: string, body: { message: string; session_id?: string | null }) =>
    apiFetch<ChatResponse>("/api/chat/message", {
      method: "POST",
      body: JSON.stringify(body),
      accessToken,
    }),
};

// Re-export integration API for convenience
export { integrationsApi } from "./integrations";
