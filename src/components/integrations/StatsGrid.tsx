import { type SocialConnection } from "@/lib/integrations";

interface StatsGridProps {
  connection: SocialConnection;
}

export default function StatsGrid({ connection }: StatsGridProps) {
  const connectedDate = new Date(connection.connected_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const lastSync = connection.last_synced_at
    ? new Date(connection.last_synced_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "Never";

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="bg-secondary/50 rounded-lg p-3 text-center">
        <div className="text-sm font-display font-bold text-foreground">{connectedDate}</div>
        <div className="text-[10px] text-muted-foreground">Connected</div>
      </div>
      <div className="bg-secondary/50 rounded-lg p-3 text-center">
        <div className="text-sm font-display font-bold text-foreground">{lastSync}</div>
        <div className="text-[10px] text-muted-foreground">Last Synced</div>
      </div>
    </div>
  );
}
