import { motion } from "framer-motion";

type HealthScoreCardProps = {
  score?: number;
  label?: string;
};

const HealthScoreCard = ({ score = 100, label }: HealthScoreCardProps) => {
  const normalized = Math.max(0, Math.min(100, score));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalized / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card rounded-2xl p-4 md:p-5"
    >
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Health Score
      </span>
      <div className="flex flex-col items-center mt-2">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
            <motion.circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-display font-bold text-foreground">{Math.round(normalized)}</span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground mt-2">{label || "Optimum stability"}</span>
      </div>
    </motion.div>
  );
};

export default HealthScoreCard;
