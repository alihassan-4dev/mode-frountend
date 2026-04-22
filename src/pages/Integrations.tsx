import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Info } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { useSocialConnections } from "@/hooks/useSocialConnections";
import PlatformCard, {
  type PlatformConfig,
} from "@/components/integrations/PlatformCard";

const PLATFORMS: PlatformConfig[] = [
  {
    id: "facebook",
    name: "Facebook",
    icon: "f",
    color: "hsl(220,80%,55%)",
    description: "Monitor posts, reactions & community health for mood analysis",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📷",
    color: "hsl(330,80%,60%)",
    description: "Track visual content, stories & mood indicators",
  },
];

const Integrations = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    isLoading,
    isError,
    connect,
    disconnect,
    getConnection,
  } = useSocialConnections();

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected) {
      const name = connected.charAt(0).toUpperCase() + connected.slice(1);
      toast({ title: `${name} Connected!` });
      setSearchParams({}, { replace: true });
    } else if (error) {
      toast({
        title: "Connection failed",
        description: error.replace(/_/g, " "),
        variant: "destructive",
      });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, toast]);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          Integrations
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Connect your social platforms for mood analysis
        </p>
      </div>

      {isError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-lg p-3 mb-4"
        >
          <Info className="w-4 h-4 shrink-0" />
          <p className="text-sm">
            Could not load saved connections. Check that the backend is running
            and your backend env is configured. By default this project uses local
            SQLite with <code className="font-mono text-xs bg-secondary/50 px-1 rounded">USE_LOCAL_SQLITE=true</code> in{" "}
            <code className="font-mono text-xs bg-secondary/50 px-1 rounded">backend/.env</code>.
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLATFORMS.map((platform, i) => (
          <PlatformCard
            key={platform.id}
            config={platform}
            connection={getConnection(platform.id)}
            index={i}
            loading={isLoading}
            onConnect={() => connect(platform.id)}
            onDisconnect={() => {
              disconnect.mutate(platform.id, {
                onSuccess: () =>
                  toast({ title: `${platform.name} Disconnected` }),
                onError: () =>
                  toast({
                    title: "Disconnect failed",
                    variant: "destructive",
                  }),
              });
            }}
            disconnecting={disconnect.isPending}
          />
        ))}

        {/* X (Twitter) — coming soon card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: PLATFORMS.length * 0.1 }}
          className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center text-center opacity-60"
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold mb-3"
            style={{
              backgroundColor: "hsl(262,83%,58%,0.12)",
              color: "hsl(262,83%,58%)",
            }}
          >
            𝕏
          </div>
          <h3 className="font-display font-semibold text-foreground">
            X (Twitter)
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Coming soon — requires paid API access
          </p>
        </motion.div>
      </div>

      <div className="mt-8 glass-card rounded-2xl p-5">
        <h2 className="font-display font-semibold text-foreground text-lg mb-2">
          How it works
        </h2>
        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1.5">
          <li>Click <strong>Connect</strong> on a platform above</li>
          <li>Approve access in the provider&apos;s consent screen</li>
          <li>
            Your posts and engagement data are fetched and used for mood analysis
          </li>
          <li>
            Tokens are stored securely; you can disconnect at any time
          </li>
        </ol>
      </div>
    </AppLayout>
  );
};

export default Integrations;
