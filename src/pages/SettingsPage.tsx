import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Moon, Sun, User, Shield } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { displayNameFromUser } from "@/lib/utils";
import { api } from "@/lib/api";

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, session } = useAuth();
  const meFromApi = useQuery({
    queryKey: ["api-me", session?.access_token],
    queryFn: () => api.me(session!.access_token),
    enabled: !!session?.access_token,
    retry: 1,
  });
  const name = displayNameFromUser(user);
  const email = user?.email ?? "—";

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Settings ⚙️</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your preferences</p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground">Profile</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-medium text-foreground">{name}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium text-foreground">{email}</span>
            </div>
            {meFromApi.isSuccess && (
              <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                Backend user ID: <span className="font-mono text-foreground">{meFromApi.data.id}</span>
              </p>
            )}
            {meFromApi.isError && (
              <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                API server not reachable — start the backend and check <code className="text-foreground">VITE_API_URL</code>{" "}
                / proxy settings.
              </p>
            )}
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            {theme === "dark" ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            <h2 className="font-display font-semibold text-foreground">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Theme</p>
              <p className="text-xs text-muted-foreground">Toggle between light and dark mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                theme === "dark" ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-primary-foreground transition-transform ${
                  theme === "dark" ? "left-6.5 translate-x-0" : "left-0.5"
                }`}
                style={{ left: theme === "dark" ? "26px" : "2px" }}
              />
            </button>
          </div>
        </motion.div>


        {/* Privacy */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground">Privacy & Security</h2>
          </div>
          <p className="text-sm text-muted-foreground">Your data is encrypted and secure 🔒</p>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
