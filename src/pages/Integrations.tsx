import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { useSocialConnections } from "@/hooks/useSocialConnections";
import PlatformCard, {
  type PlatformConfig,
} from "@/components/integrations/PlatformCard";

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
    <path d="M13.65 21v-8.03h2.7l.4-3.12h-3.1V7.86c0-.9.25-1.52 1.55-1.52H16.5V3.55c-.22-.03-.98-.09-1.86-.09-1.84 0-3.1 1.12-3.1 3.2v1.79H9.46v3.12h2.08V21h2.11Z" />
  </svg>
);

const InstagramLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none" aria-hidden="true">
    <rect
      x="3.25"
      y="3.25"
      width="17.5"
      height="17.5"
      rx="5.25"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="17.45" cy="6.55" r="1.15" fill="currentColor" />
  </svg>
);

const PLATFORMS: PlatformConfig[] = [
  {
    id: "facebook",
    name: "Facebook",
    icon: <FacebookLogo />,
    color: "hsl(221 83% 53%)",
    iconBackground:
      "linear-gradient(135deg, rgba(24, 119, 242, 0.18), rgba(24, 119, 242, 0.08))",
    description: "Monitor posts, reactions and community health for mood analysis.",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: <InstagramLogo />,
    color: "hsl(333 71% 51%)",
    iconBackground:
      "linear-gradient(135deg, rgba(245, 96, 64, 0.18), rgba(193, 53, 132, 0.14) 45%, rgba(131, 58, 180, 0.16))",
    description: "Track visual content, stories and mood indicators.",
  },
];

const Integrations = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoading, isError, connect, disconnect, getConnection } =
    useSocialConnections();

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
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your social platforms for cleaner mood analysis and account insights.
        </p>
      </div>

      {isError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400"
        >
          <Info className="h-4 w-4 shrink-0" />
          <p className="text-sm">
            Could not load saved connections. Check that the backend is running
            and your backend env is configured. By default this project uses local
            SQLite with{" "}
            <code className="rounded bg-secondary/50 px-1 font-mono text-xs">
              USE_LOCAL_SQLITE=true
            </code>{" "}
            in{" "}
            <code className="rounded bg-secondary/50 px-1 font-mono text-xs">
              backend/.env
            </code>
            .
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  toast({ title: `${platform.name} disconnected` }),
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
      </div>

      <div className="mt-8 glass-card rounded-2xl p-5">
        <h2 className="mb-2 text-lg font-display font-semibold text-foreground">
          How it works
        </h2>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
          <li>Click <strong>Connect</strong> on a platform above.</li>
          <li>Approve access in the provider&apos;s consent screen.</li>
          <li>Your posts and engagement data are fetched and used for mood analysis.</li>
          <li>Tokens are stored securely, and you can disconnect at any time.</li>
        </ol>
      </div>
    </AppLayout>
  );
};

export default Integrations;
