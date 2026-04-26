import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import MoodCard from "@/components/dashboard/MoodCard";
import StressCard from "@/components/dashboard/StressCard";
import EnergyCard from "@/components/dashboard/EnergyCard";
import HealthScoreCard from "@/components/dashboard/HealthScoreCard";
import MoodJourneyChart from "@/components/dashboard/MoodJourneyChart";
import PlatformActivityChart from "@/components/dashboard/PlatformActivityChart";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { displayNameFromUser } from "@/lib/utils";

const platformColors: Record<string, string> = {
  Facebook: "hsl(180,85%,55%)",
  Instagram: "hsl(330,80%,60%)",
};

const Dashboard = () => {
  const { user, session } = useAuth();
  const name = displayNameFromUser(user);
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary", session?.access_token],
    queryFn: () => api.dashboardSummary(session!.access_token),
    enabled: !!session?.access_token,
    refetchInterval: 30_000,
  });

  const summary = summaryQuery.data;

  const metricMap = useMemo(() => {
    const metrics = summary?.metrics ?? [];
    return {
      mood: metrics.find((metric) => metric.label.toLowerCase() === "mood score"),
      stress: metrics.find((metric) => metric.label.toLowerCase() === "stress risk"),
      readiness: metrics.find((metric) => metric.label.toLowerCase() === "readiness"),
      connected: metrics.find((metric) => metric.label.toLowerCase() === "connected sources"),
    };
  }, [summary?.metrics]);

  const platformData = useMemo(() => {
    if (!summary) {
      return [];
    }

    return summary.platform_breakdown.map((item) => ({
      name: item.platform.charAt(0).toUpperCase() + item.platform.slice(1),
      value: item.connected ? item.activity_count : 0,
      connected: item.connected,
      color: platformColors[item.platform.charAt(0).toUpperCase() + item.platform.slice(1)] || "hsl(220,10%,65%)",
    }));
  }, [summary]);

  const hasRealMoodAnalytics = (summary?.mood_history?.length ?? 0) > 0;
  const hasRealPlatformAnalytics = platformData.some((item) => item.connected && item.value > 0);

  const lastAnalyzed = useMemo(() => {
    const latest = summary?.platform_breakdown
      ?.map((item) => item.last_synced_at)
      .filter(Boolean)
      .sort()
      .at(-1);
    return latest ? new Date(latest).toLocaleString() : "No platform sync yet";
  }, [summary?.platform_breakdown]);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          Hey {name} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here's your mental wellness overview
        </p>
      </div>

      {summaryQuery.isError && (
        <div className="glass-card rounded-2xl p-4 mb-4 text-sm text-destructive">
          Could not load live dashboard data. The original UI is still shown, but check that the backend is running correctly.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <MoodCard
          score={(metricMap.mood?.value ?? 0) / 10}
          detail={metricMap.mood?.detail}
        />
        <StressCard
          percentage={metricMap.stress?.value ?? 0}
          detail={metricMap.stress?.detail}
        />
        <EnergyCard
          energyValue={metricMap.stress ? Math.max(0, Math.min(100, 100 - metricMap.stress.value)) : 0}
          label={metricMap.readiness?.trend === "up" ? "Balanced" : undefined}
        />
        <HealthScoreCard
          score={metricMap.readiness?.value ?? 0}
          label={summary?.recommendations?.[0] || "Connect a source to begin"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 md:gap-4">
        <div className="lg:col-span-3">
          {hasRealMoodAnalytics ? (
            <MoodJourneyChart data={summary?.mood_history ?? []} />
          ) : (
            <div className="glass-card rounded-2xl p-5 md:p-6">
              <h3 className="font-display font-semibold text-foreground text-lg">Your Mood Journey</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No real mood analytics yet. Start short daily check-ins in chat, then 7D/30D trend will appear automatically.
              </p>
            </div>
          )}
        </div>
        <div className="lg:col-span-2">
          {hasRealPlatformAnalytics ? (
            <PlatformActivityChart
              data={platformData}
              totalLabel={metricMap.connected?.display_value || "0"}
              lastAnalyzed={lastAnalyzed}
            />
          ) : (
            <div className="glass-card rounded-2xl p-5 md:p-6">
              <h3 className="font-display font-semibold text-foreground text-lg">Platform Activity</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No real platform analytics yet. Connect Facebook or Instagram to see live activity and sync insights.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
