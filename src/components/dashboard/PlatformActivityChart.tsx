import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type PlatformActivityItem = {
  name: string;
  value: number;
  color: string;
  connected?: boolean;
};

type PlatformActivityChartProps = {
  data?: PlatformActivityItem[];
  totalLabel?: string;
  lastAnalyzed?: string;
};

const PlatformActivityChart = ({
  data = [],
  totalLabel = "0",
  lastAnalyzed = "Waiting for live sync",
}: PlatformActivityChartProps) => {
  const chartData = data.filter((item) => item.value > 0);
  const hasConnectedData = chartData.length > 0;

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
          {hasConnectedData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={35}
                  outerRadius={55}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full rounded-full border border-dashed border-border bg-secondary/40" />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted-foreground">TOTAL</span>
            <span className="text-xl font-display font-bold text-foreground">{totalLabel}</span>
          </div>
        </div>

        <div className="space-y-2 flex-1 w-full">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-foreground">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {item.connected ? item.value : 0}
              </span>
            </div>
          ))}
          {!data.length && (
            <p className="rounded-xl border border-dashed border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
              No platform connected yet. Connect Facebook or Instagram to start analysis.
            </p>
          )}
          <div className="pt-2 border-t border-border">
            <span className="text-[10px] text-muted-foreground">Last analyzed: {lastAnalyzed}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlatformActivityChart;
