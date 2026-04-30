import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, ExternalLink, Sparkles } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { api, type PostReport } from "@/lib/api";

type Platform = "facebook" | "instagram";

function sentimentVariant(label: string | null): "default" | "secondary" | "destructive" | "outline" {
  if (label === "positive") return "default";
  if (label === "negative") return "destructive";
  return "secondary";
}

function PostReportCard({ report }: { report: PostReport }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base capitalize">{report.platform} post</CardTitle>
          <div className="text-xs text-muted-foreground">
            {report.post_created_at ? new Date(report.post_created_at).toLocaleString() : "Unknown time"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground/90 whitespace-pre-wrap">
          {report.post_text?.trim() || "No caption/message available for this post."}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {report.media_type && <Badge variant="outline">{report.media_type}</Badge>}
          {typeof report.likes_count === "number" && (
            <Badge variant="secondary">Likes: {report.likes_count}</Badge>
          )}
          {typeof report.comments_count === "number" && (
            <Badge variant="secondary">Comments: {report.comments_count}</Badge>
          )}
          {report.permalink && (
            <a
              href={report.permalink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Open post <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        <div className="rounded-xl border bg-secondary/35 p-3 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" /> AI report
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={sentimentVariant(report.sentiment_label)}>
              {report.sentiment_label ?? "neutral"}
            </Badge>
            <Badge variant="outline">Engagement: {report.engagement_quality ?? "—"}</Badge>
            {report.tone && <Badge variant="outline">Tone: {report.tone}</Badge>}
            <span className="text-xs text-muted-foreground">
              Score: {(report.sentiment_score ?? 0).toFixed(2)}
            </span>
          </div>

          {report.summary && (
            <p className="text-sm text-foreground/90">
              <span className="font-medium">Summary: </span>
              {report.summary}
            </p>
          )}

          {report.recommendation && (
            <p className="text-sm text-foreground/90">
              <span className="font-medium">Recommendation: </span>
              {report.recommendation}
            </p>
          )}

          {report.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {report.topics.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          {(report.strengths.length > 0 || report.weaknesses.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {report.strengths.length > 0 && (
                <div>
                  <div className="font-medium text-emerald-500">Strengths</div>
                  <ul className="list-disc pl-4 text-muted-foreground">
                    {report.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {report.weaknesses.length > 0 && (
                <div>
                  <div className="font-medium text-amber-500">Weaknesses</div>
                  <ul className="list-disc pl-4 text-muted-foreground">
                    {report.weaknesses.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const Reports = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [platform, setPlatform] = useState<Platform>("facebook");

  const reportsQuery = useQuery({
    queryKey: ["reports", session?.access_token],
    queryFn: () => api.reports(session!.access_token),
    enabled: !!session?.access_token,
    refetchInterval: 60_000,
  });

  const refreshMutation = useMutation({
    mutationFn: () => api.reportsRefresh(session!.access_token),
    onSuccess: (data) => {
      queryClient.setQueryData(["reports", session?.access_token], data);
    },
  });

  const reports = reportsQuery.data;
  const list = platform === "facebook" ? reports?.facebook ?? [] : reports?.instagram ?? [];

  const overallChartData = useMemo(() => {
    if (!reports) return [];
    return reports.overall.map((row) => ({
      platform: row.platform.charAt(0).toUpperCase() + row.platform.slice(1),
      Positive: row.positive,
      Neutral: row.neutral,
      Negative: row.negative,
    }));
  }, [reports]);

  const hasData = (reports?.facebook.length ?? 0) + (reports?.instagram.length ?? 0) > 0;
  const nextRefreshLabel = useMemo(() => {
    if (!reports?.next_refresh_at) return null;
    return new Date(reports.next_refresh_at).toLocaleTimeString();
  }, [reports?.next_refresh_at]);

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-generated reports for each Facebook and Instagram post, refreshed automatically every{" "}
            {reports?.refresh_interval_minutes ?? 5} minutes.
            {nextRefreshLabel && <> Next refresh ~{nextRefreshLabel}.</>}
          </p>
        </div>
        <Button
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending || !session}
          variant="outline"
        >
          {refreshMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh now
        </Button>
      </div>

      {reportsQuery.isLoading && (
        <div className="glass-card rounded-2xl p-5 text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Building your AI reports...
        </div>
      )}

      {reportsQuery.isError && (
        <div className="glass-card rounded-2xl p-5 text-sm text-destructive">
          Could not load reports. Please retry in a moment.
        </div>
      )}

      {reports && (
        <Card className="mb-5 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Overall analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-64">
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overallChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="platform" stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Positive" stackId="a" fill="hsl(142,72%,45%)" />
                    <Bar dataKey="Neutral" stackId="a" fill="hsl(220,10%,55%)" />
                    <Bar dataKey="Negative" stackId="a" fill="hsl(0,72%,55%)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Connect Facebook or Instagram from Integrations to start collecting AI reports.
                </div>
              )}
            </div>

            {reports.overall_recommendation && (
              <p className="text-sm text-foreground/90">
                <span className="font-medium">AI take: </span>
                {reports.overall_recommendation}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reports.overall.map((row) => (
                <div key={row.platform} className="rounded-xl border p-3 text-sm">
                  <div className="font-medium capitalize">{row.platform}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {row.total_posts} posts · {row.total_likes} likes · {row.total_comments} comments
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg sentiment: {row.avg_sentiment.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-5">
        <CardContent className="pt-6">
          <Tabs value={platform} onValueChange={(value) => setPlatform(value as Platform)}>
            <TabsList>
              <TabsTrigger value="facebook">
                Facebook ({reports?.facebook.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="instagram">
                Instagram ({reports?.instagram.length ?? 0})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {reports && list.length === 0 && (
        <div className="glass-card rounded-2xl p-5 text-sm text-muted-foreground">
          No {platform} reports yet. Connect {platform} from Integrations or use “Refresh now”.
        </div>
      )}

      {list.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {list.map((report) => (
            <PostReportCard key={`${report.platform}:${report.post_id}`} report={report} />
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default Reports;
