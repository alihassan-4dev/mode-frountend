import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { type SocialConnection } from "@/lib/integrations";
import ConnectButton from "./ConnectButton";
import StatsGrid from "./StatsGrid";

export interface PlatformConfig {
  id: "facebook" | "instagram";
  name: string;
  icon: ReactNode;
  color: string;
  iconBackground: string;
  description: string;
}

interface PlatformCardProps {
  config: PlatformConfig;
  connection: SocialConnection | undefined;
  index: number;
  loading?: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  onSync: () => void;
  syncing: boolean;
  disconnecting: boolean;
}

export default function PlatformCard({
  config,
  connection,
  index,
  loading,
  onConnect,
  onDisconnect,
  onSync,
  syncing,
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
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {connection?.avatar_url ? (
            <img
              src={connection.avatar_url}
              alt={config.name}
              className="h-11 w-11 rounded-xl object-cover"
            />
          ) : (
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                background: config.iconBackground,
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
              <p className="max-w-[140px] truncate text-xs text-muted-foreground">
                {connection.platform_name}
                {connection.platform_username &&
                  connection.platform_username !== connection.platform_name &&
                  ` (@${connection.platform_username})`}
              </p>
            )}
            <div className="mt-0.5 flex items-center gap-1">
              {loading ? (
                <span className="text-xs text-muted-foreground">Checking...</span>
              ) : connected ? (
                <>
                  <CheckCircle2 className="h-3 w-3 text-chart-green" />
                  <span className="text-xs text-chart-green">Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Not connected
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      </div>

      <p className="mb-4 flex-1 text-sm text-muted-foreground">
        {config.description}
      </p>

      {connected && connection && <StatsGrid connection={connection} />}

      <ConnectButton
        connected={connected}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        onSync={onSync}
        syncing={syncing}
        disconnecting={disconnecting}
      />
    </motion.div>
  );
}
