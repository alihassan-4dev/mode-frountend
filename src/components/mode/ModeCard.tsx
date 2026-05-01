import { Sparkles, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import type { ModeSummary } from "@/lib/api";

const VIBE_STYLES: Record<string, { bg: string; ring: string; icon: typeof TrendingUp }> = {
  uplifted: {
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/30",
    icon: TrendingUp,
  },
  balanced: {
    bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    ring: "ring-sky-500/30",
    icon: Minus,
  },
  strained: {
    bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    ring: "ring-rose-500/30",
    icon: TrendingDown,
  },
};

const PERIOD_LABEL: Record<string, string> = {
  current: "Right now",
  weekly: "This week",
  monthly: "This month",
};

export function ModeBadge({ label, vibe }: { label: string | null; vibe: string | null }) {
  if (!label) {
    return <Badge variant="outline">No mode yet</Badge>;
  }
  const styles = VIBE_STYLES[vibe ?? "balanced"] ?? VIBE_STYLES.balanced;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${styles.bg} ${styles.ring}`}
    >
      <Sparkles className="h-3 w-3" />
      {label}
    </span>
  );
}

type ModeCardProps = {
  summary: ModeSummary;
  delay?: number;
};

const ModeCard = ({ summary, delay = 0 }: ModeCardProps) => {
  const styles = VIBE_STYLES[summary.mode_vibe ?? "balanced"] ?? VIBE_STYLES.balanced;
  const Icon = styles.icon;
  const pct = Math.round(summary.confidence * 100);
  const top3 = summary.distribution.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-2xl p-4 md:p-5"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {PERIOD_LABEL[summary.period] ?? summary.period}
        </div>
        <Icon className={`h-4 w-4 ${styles.bg.split(" ")[1] ?? ""}`} />
      </div>

      <div className="flex items-center gap-2 mb-1">
        <h4 className="font-display font-semibold text-foreground text-xl">
          {summary.mode_label ?? "Awaiting signal"}
        </h4>
      </div>
      <div className="text-xs text-muted-foreground mb-3">
        {summary.post_count} posts analyzed · {pct}% confidence
      </div>

      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden mb-3">
        <div
          className={`h-full ${styles.bg.split(" ")[0] ?? "bg-primary/40"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-sm text-foreground/85 leading-relaxed mb-3">{summary.narrative}</p>

      {top3.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {top3.map((item) => (
            <Badge key={item.label} variant="outline" className="text-[11px]">
              {item.label} · {Math.round(item.share * 100)}%
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ModeCard;
