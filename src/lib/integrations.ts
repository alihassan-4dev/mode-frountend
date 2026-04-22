import { apiFetch } from "./api";

export interface SocialConnection {
  platform: "facebook" | "instagram";
  platform_user_id: string;
  platform_username: string | null;
  platform_name: string | null;
  avatar_url: string | null;
  token_expires_at: string | null;
  scopes: string[] | null;
  connected_at: string;
  last_synced_at: string | null;
}

export interface PlatformData {
  platform: string;
  posts: Record<string, unknown>[];
  stats: Record<string, unknown>;
}

export const integrationsApi = {
  list: (token: string) =>
    apiFetch<SocialConnection[]>("/api/integrations/", { accessToken: token }),

  authorizeUrl: (platform: "facebook" | "instagram", token: string) =>
    apiFetch<{ url: string }>(`/api/integrations/${platform}/authorize`, {
      accessToken: token,
    }),

  disconnect: (platform: "facebook" | "instagram", token: string) =>
    apiFetch<{ success: boolean }>(`/api/integrations/${platform}`, {
      method: "DELETE",
      accessToken: token,
    }),

  data: (platform: "facebook" | "instagram", token: string) =>
    apiFetch<PlatformData>(`/api/integrations/${platform}/data`, {
      accessToken: token,
    }),
};
