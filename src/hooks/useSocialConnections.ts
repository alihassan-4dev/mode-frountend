import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { integrationsApi, type SocialConnection } from "@/lib/integrations";

const QUERY_KEY = ["social-connections"] as const;

export function useSocialConnections() {
  const { session } = useAuth();
  const token = session?.access_token ?? "";
  const qc = useQueryClient();

  const connectionsQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => integrationsApi.list(token),
    enabled: !!token,
    staleTime: 30_000,
  });

  const connect = async (platform: "facebook" | "instagram") => {
    const { url } = await integrationsApi.authorizeUrl(platform, token);
    window.location.href = url;
  };

  const disconnectMutation = useMutation({
    mutationFn: (platform: "facebook" | "instagram") =>
      integrationsApi.disconnect(platform, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const syncMutation = useMutation({
    mutationFn: (platform: "facebook" | "instagram") =>
      integrationsApi.data(platform, token),
    onSuccess: (_data, platform) => {
      const syncedAtIso = new Date().toISOString();
      qc.setQueryData<SocialConnection[]>(QUERY_KEY, (current) =>
        (current ?? []).map((connection) =>
          connection.platform === platform
            ? { ...connection, last_synced_at: syncedAtIso }
            : connection
        )
      );
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const getConnection = (
    platform: "facebook" | "instagram"
  ): SocialConnection | undefined =>
    connectionsQuery.data?.find((c) => c.platform === platform);

  return {
    connections: connectionsQuery.data ?? [],
    isLoading: connectionsQuery.isLoading,
    isError: connectionsQuery.isError,
    isRefreshing: connectionsQuery.isRefetching,
    refetch: connectionsQuery.refetch,
    connect,
    disconnect: disconnectMutation,
    sync: syncMutation,
    getConnection,
  };
}
