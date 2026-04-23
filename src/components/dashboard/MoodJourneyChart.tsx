import { useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { MoodHistoryPoint } from "@/lib/api";

type MoodJourneyChartProps = {
  data?: MoodHistoryPoint[];
};

const MoodJourneyChart = ({ data = [] }: MoodJourneyChartProps) => {
  const [range, setRange] = useState<"7D" | "30D">("30D");
  const visibleData = range === "30D" ? data.slice(-30) : data.slice(-7);
  const hasHistory = visibleData.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card rounded-2xl p-4 md:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-display font-semibold text-foreground text-lg">Your Mood Journey</h3>
          <p className="text-xs text-muted-foreground">
            {hasHistory ? "Real trend from recent chat check-ins" : "No real mood history yet"}
          </p>
        </div>
        <div className="flex bg-secondary rounded-lg p-0.5">
          {(["7D", "30D"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="h-48 md:h-56">
        {hasHistory ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visibleData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(262,83%,58%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(262,83%,58%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(180,85%,55%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(180,85%,55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} domain={[0, 10]} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                  color: "hsl(var(--foreground))",
                }}
              />
              <Area type="monotone" dataKey="mood" stroke="hsl(262,83%,58%)" fill="url(#moodGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="energy" stroke="hsl(180,85%,55%)" fill="url(#energyGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/40 px-4 text-center">
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              No past check-ins found. Start chatting with the assistant and this chart will use real mood and energy signals.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MoodJourneyChart;
