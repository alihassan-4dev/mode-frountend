import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface ConnectButtonProps {
  connected: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  onSync?: () => void;
  syncing?: boolean;
  disconnecting?: boolean;
}

export default function ConnectButton({
  connected,
  onConnect,
  onDisconnect,
  onSync,
  syncing,
  disconnecting,
}: ConnectButtonProps) {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await onConnect();
    } catch {
      setConnecting(false);
    }
  };

  if (connected) {
    return (
      <div className="flex items-center gap-2">
        <Button onClick={onSync} variant="secondary" disabled={syncing || disconnecting}>
          {syncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync
            </>
          )}
        </Button>
        <Button
          onClick={onDisconnect}
          variant="outline"
          disabled={disconnecting || syncing}
          className="border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
        >
          {disconnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Disconnecting...
            </>
          ) : (
            "Disconnect"
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={connecting}
      className="bg-primary text-primary-foreground hover:bg-primary/90"
    >
      {connecting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Connecting...
        </>
      ) : (
        "Connect"
      )}
    </Button>
  );
}
