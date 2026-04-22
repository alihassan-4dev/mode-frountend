import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ConnectButtonProps {
  connected: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  disconnecting?: boolean;
}

export default function ConnectButton({
  connected,
  onConnect,
  onDisconnect,
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
      <Button
        onClick={onDisconnect}
        variant="outline"
        disabled={disconnecting}
        className="border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
      >
        {disconnecting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Disconnecting…
          </>
        ) : (
          "Disconnect"
        )}
      </Button>
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
          Connecting…
        </>
      ) : (
        "Connect"
      )}
    </Button>
  );
}
