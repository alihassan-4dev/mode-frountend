import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export function useSocialPosts(
  platform: "facebook" | "instagram",
  limit = 10,
  enabled = true
) {
  const { session } = useAuth();
  const token = session?.access_token ?? "";

  return useQuery({
    queryKey: ["social-posts", platform, limit, token],
    queryFn: () => api.socialPosts(token, { platform, limit }),
    enabled: !!token && enabled,
    staleTime: 20_000,
  });
}
