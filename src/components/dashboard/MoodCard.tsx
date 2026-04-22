import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

type MoodCardProps = {
  score?: number;
  detail?: string;
};

const MoodCard = ({ score = 4, detail }: MoodCardProps) => {
  const normalized = Math.max(0, Math.min(10, score));

  const getMoodEmoji = (value: number) => {
    if (value >= 7) return "😄";
    if (value >= 4) return "🙂";
    return "😔";
  };

  const getMoodLabel = (value: number) => {
    if (value >= 8.5) return "Excellent, thriving today";
    if (value >= 7) return "Strong positive mood";
    if (value >= 5) return "Steady and balanced";
    if (value >= 3) return "Below your usual baseline";
    return "Worth checking in with yourself";
  };

  const pct = Math.max(0, Math.min(100, (normalized / 10) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card rounded-2xl p-4 md:p-5 flex flex-col min-h-[180px]"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Current Mood
        </span>
        <TrendingUp className="w-4 h-4 text-accent" />
      </div>
      <div className="flex items-center gap-3">
        <motion.span
          className="text-4xl shrink-0"
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {getMoodEmoji(normalized)}
        </motion.span>
        <div className="min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-display font-bold text-foreground">
              {normalized.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">/10</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col flex-1 justify-end gap-2">
        <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
          {detail || getMoodLabel(normalized)}
        </p>
        <div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary/80 to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5 text-[10px] text-muted-foreground">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MoodCard;
