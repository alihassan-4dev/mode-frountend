import { motion } from "framer-motion";

type EnergyCardProps = {
  energyValue?: number;
  label?: string;
};

const EnergyCard = ({ energyValue = 70, label }: EnergyCardProps) => {
  const normalized = Math.max(0, Math.min(100, energyValue));
  const activeBar = Math.min(4, Math.max(0, Math.round(normalized / 25)));

  const bars = [0, 1, 2, 3, 4].map((index) => {
    const distance = Math.abs(index - activeBar);
    const falloff = Math.min(distance * 15, 40);
    const height = Math.max(28, normalized - falloff);
    return { height, active: index === activeBar };
  });

  const energyState = label || (normalized >= 75 ? "Peak" : normalized >= 40 ? "Balanced" : "Low");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-2xl p-4 md:p-5"
    >
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Energy Level
      </span>
      <div className="mt-1 flex items-baseline justify-between">
        <span className="text-xl font-display font-bold text-foreground">{Math.round(normalized)}%</span>
        <span className="text-[10px] text-muted-foreground">{energyState}</span>
      </div>
      <div className="flex items-end justify-center gap-1.5 mt-3 h-16">
        {bars.map((bar, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${bar.height}%` }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
            className={`w-3 rounded-sm ${bar.active ? "bg-accent" : "bg-accent/40"}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 px-1">
        <span className="text-[10px] text-muted-foreground">Low</span>
        <span className="text-[10px] text-accent font-medium">Balanced</span>
        <span className="text-[10px] text-muted-foreground">Peak</span>
      </div>
    </motion.div>
  );
};

export default EnergyCard;
