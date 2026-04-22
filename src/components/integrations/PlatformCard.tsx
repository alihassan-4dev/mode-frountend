import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { type SocialConnection } from "@/lib/integrations";
import ConnectButton from "./ConnectButton";
import StatsGrid from "./StatsGrid";

export interface PlatformConfig {
  id: "facebook" | "instagram";
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface PlatformCardProps {
  config: PlatformConfig;
  connection: SocialConnection | undefined;
  index: number;
  loading?: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  disconnecting: boolean;
}

export default function PlatformCard({
  config,
  connection,
  index,
  loading,
  onConnect,
  onDisconnect,
  disconnecting,
}: PlatformCardProps) {
  const connected = !!connection;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card rounded-2xl p-5 flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {connection?.avatar_url ? (
            <img
              src={connection.avatar_url}
              alt={config.name}
              className="w-11 h-11 rounded-xl object-cover"
            />
          ) : (
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{
                backgroundColor: config.color + "20",
                color: config.color,
              }}
            >
              {config.icon}
            </div>
          )}
          <div>
            <h3 className="font-display font-semibold text-foreground">
              {config.name}
            </h3>
            {connected && connection.platform_name && (
              <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                {connection.platform_name}
                {connection.platform_username &&
                  connection.platform_username !== connection.platform_name &&
                  ` (@${connection.platform_username})`}
              </p>
            )}
            <div className="flex items-center gap-1 mt-0.5">
              {loading ? (
                <span className="text-xs text-muted-foreground">Checking…</span>
              ) : connected ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-chart-green" />
                  <span className="text-xs text-chart-green">Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Not connected
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground" />
      </div>

      <p className="text-sm text-muted-foreground mb-4 flex-1">
        {config.description}
      </p>

      {connected && connection && <StatsGrid connection={connection} />}

      <ConnectButton
        connected={connected}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        disconnecting={disconnecting}
      />
    </motion.div>
  );
}
