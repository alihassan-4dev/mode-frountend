import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ExternalLink, Loader2 } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSocialConnections } from "@/hooks/useSocialConnections";
import { useSocialPosts } from "@/hooks/useSocialPosts";

type Platform = "facebook" | "instagram";

function sentimentBadgeVariant(label: string): "default" | "secondary" | "destructive" | "outline" {
  if (label === "positive") return "default";
  if (label === "negative") return "destructive";
  return "secondary";
}

const SocialPosts = () => {
  const [platform, setPlatform] = useState<Platform>("facebook");
  const connections = useSocialConnections();
  const activeConnection = connections.getConnection(platform);
  const isConnected = !!activeConnection;
  const postsQuery = useSocialPosts(platform, 10, isConnected);
  const posts = postsQuery.data?.posts ?? [];

  const lastFetchedLabel = useMemo(() => {
    const fetchedAt = postsQuery.data?.meta?.fetched_at;
    if (!fetchedAt) return "Not fetched yet";
    return new Date(fetchedAt).toLocaleString();
  }, [postsQuery.data?.meta?.fetched_at]);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Social Posts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review live Facebook and Instagram posts with compact AI insights for faster action.
        </p>
      </div>

      <Card className="mb-5">
        <CardContent className="pt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Tabs value={platform} onValueChange={(value) => setPlatform(value as Platform)}>
            <TabsList>
              <TabsTrigger value="facebook">Facebook</TabsTrigger>
              <TabsTrigger value="instagram">Instagram</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="text-xs text-muted-foreground">Last fetched: {lastFetchedLabel}</div>
        </CardContent>
      </Card>

      {!isConnected && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              {platform === "facebook" ? "Facebook" : "Instagram"} is not connected
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-4">
              Connect your account first to fetch real-time posts and show AI analysis.
            </p>
            <Button asChild>
              <Link to="/integrations">Open Integrations</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {isConnected && postsQuery.isLoading && (
        <div className="glass-card rounded-2xl p-5 text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading live posts from {platform}...
        </div>
      )}

      {isConnected && postsQuery.isError && (
        <div className="glass-card rounded-2xl p-5 text-sm text-destructive">
          Could not load posts for {platform}. Please re-sync in Integrations and try again.
        </div>
      )}

      {isConnected && !postsQuery.isLoading && !postsQuery.isError && postsQuery.data?.meta?.notice && (
        <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-950 dark:text-amber-100">
          {postsQuery.data.meta.notice}
        </div>
      )}

      {isConnected && !postsQuery.isLoading && !postsQuery.isError && posts.length === 0 && (
        <div className="glass-card rounded-2xl p-5 text-sm text-muted-foreground">
          {postsQuery.data?.meta?.notice
            ? "No posts were returned for this Facebook connection after the alternate fetch paths."
            : `No posts available yet for ${platform}. Create a post on the connected account and sync again.`}
        </div>
      )}

      {isConnected && posts.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => (
            <Card key={post.post_id} className="rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base capitalize">{post.platform} post</CardTitle>
                  <div className="text-xs text-muted-foreground">
                    {post.created_at ? new Date(post.created_at).toLocaleString() : "Unknown time"}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                  {post.text?.trim() || "No caption/message available for this post."}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {post.media_type && <Badge variant="outline">{post.media_type}</Badge>}
                  {typeof post.likes_count === "number" && <Badge variant="secondary">Likes: {post.likes_count}</Badge>}
                  {typeof post.comments_count === "number" && (
                    <Badge variant="secondary">Comments: {post.comments_count}</Badge>
                  )}
                  {post.permalink && (
                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Open post <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                <div className="rounded-xl border bg-secondary/35 p-3">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">AI analysis</div>
                  {post.analysis ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={sentimentBadgeVariant(post.analysis.sentiment_label)}>
                          {post.analysis.sentiment_label}
                        </Badge>
                        <Badge variant="outline">Engagement: {post.analysis.engagement_quality}</Badge>
                        <span className="text-muted-foreground">
                          Score: {post.analysis.sentiment_score.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-foreground/90">{post.analysis.recommendation}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Analysis unavailable right now. Try refreshing the page.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default SocialPosts;
