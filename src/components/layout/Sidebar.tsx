import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, MessageCircle, Link2, Settings, Moon, Sun, 
  LogOut, Menu, X, ChevronLeft, ChevronRight, Sparkles
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/chat", label: "Chat", icon: MessageCircle },
  { path: "/integrations", label: "Integrations", icon: Link2 },
  { path: "/settings", label: "Settings", icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  const NavContent = ({ showLabels = true }: { showLabels?: boolean }) => (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-5">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-accent flex items-center justify-center shadow-lg shadow-primary/25 relative overflow-hidden">
            <Sparkles className="w-5 h-5 text-primary-foreground relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
          </div>
          {showLabels && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display font-bold text-lg text-foreground tracking-tight"
            >
              Counseling Corner
            </motion.span>
          )}
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              title={!showLabels ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-primary/10 text-primary glow-purple"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              } ${!showLabels ? "justify-center" : ""}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {showLabels && item.label}
              {active && showLabels && (
                <motion.div
                  layoutId="nav-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 space-y-1 border-t border-border">
        <button
          onClick={toggleTheme}
          title={!showLabels ? (theme === "dark" ? "Light Mode" : "Dark Mode") : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all w-full ${!showLabels ? "justify-center" : ""}`}
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {showLabels && (theme === "dark" ? "Light Mode" : "Dark Mode")}
        </button>
        <button
          onClick={handleLogout}
          title={!showLabels ? "Logout" : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all w-full ${!showLabels ? "justify-center" : ""}`}
        >
          <LogOut className="w-5 h-5" />
          {showLabels && "Logout"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-accent flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground">CC</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground p-1">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-[260px] bg-card border-r border-border"
            >
              <NavContent showLabels={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
        className="hidden md:flex flex-shrink-0 h-screen sticky top-0 bg-card border-r border-border relative overflow-hidden"
      >
        <div className="w-full">
          <NavContent showLabels={!collapsed} />
        </div>
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-card border border-border rounded-r-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all z-10 translate-x-full"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </motion.aside>
    </>
  );
};

export default Sidebar;
