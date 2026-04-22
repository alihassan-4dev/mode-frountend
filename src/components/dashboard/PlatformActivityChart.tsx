import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type PlatformActivityItem = {
  name: string;
  value: number;
  color: string;
};

type PlatformActivityChartProps = {
  data?: PlatformActivityItem[];
  totalLabel?: string;
  lastAnalyzed?: string;
};

const defaultData: PlatformActivityItem[] = [
  { name: "Facebook", value: 50, color: "hsl(180,85%,55%)" },
  { name: "Instagram", value: 35, color: "hsl(330,80%,60%)" },
  { name: "Other", value: 15, color: "hsl(262,83%,58%)" },
];

const PlatformActivityChart = ({
  data = defaultData,
  totalLabel = "2",
  lastAnalyzed = "Waiting for live sync",
}: PlatformActivityChartProps) => {
  const safeData = data.length ? data : defaultData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="glass-card rounded-2xl p-4 md:p-6"
    >
      <h3 className="font-display font-semibold text-foreground text-lg">Platform Activity</h3>
      <p className="text-xs text-muted-foreground mb-4">Data sources analyzed</p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={safeData}
                innerRadius={35}
                outerRadius={55}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {safeData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted-foreground">TOTAL</span>
            <span className="text-xl font-display font-bold text-foreground">{totalLabel}</span>
          </div>
        </div>

        <div className="space-y-2 flex-1 w-full">
          {safeData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-foreground">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-foreground">{item.value}%</span>
            </div>
          ))}
          <div className="pt-2 border-t border-border">
            <span className="text-[10px] text-muted-foreground">Last analyzed: {lastAnalyzed}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlatformActivityChart;
