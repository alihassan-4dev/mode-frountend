import { motion } from "framer-motion";

type StressCardProps = {
  percentage?: number;
  detail?: string;
};

function getStressCaption(p: number) {
  const n = Math.max(0, Math.min(100, p));
  if (n <= 25) return "Calm, stress is low";
  if (n <= 45) return "Mild tension, easy to manage";
  if (n <= 65) return "Moderate tension detected";
  if (n <= 85) return "Elevated stress, take a breather";
  return "High stress, prioritize rest";
}

const StressCard = ({ percentage = 10, detail }: StressCardProps) => {
  const normalized = Math.max(0, Math.min(100, percentage));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalized / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-2xl p-4 md:p-5"
    >
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Stress Level
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
              stroke="hsl(var(--destructive))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-display font-bold text-foreground">{Math.round(normalized)}%</span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground mt-2 text-center max-w-[11rem] leading-snug">
          {detail || getStressCaption(normalized)}
        </span>
      </div>
    </motion.div>
  );
};

export default StressCard;
