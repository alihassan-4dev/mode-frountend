import { useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data30 = [
  { date: "Aug 01", mood: 5, energy: 4 }, { date: "Aug 05", mood: 6, energy: 5 },
  { date: "Aug 08", mood: 7, energy: 6 }, { date: "Aug 10", mood: 8, energy: 7 },
  { date: "Aug 13", mood: 6, energy: 5 }, { date: "Aug 16", mood: 4, energy: 3 },
  { date: "Aug 18", mood: 5, energy: 6 }, { date: "Aug 20", mood: 7, energy: 8 },
  { date: "Aug 23", mood: 8, energy: 7 }, { date: "Aug 25", mood: 9, energy: 6 },
  { date: "Aug 28", mood: 7, energy: 5 }, { date: "Aug 30", mood: 6, energy: 7 },
];

const data7 = [
  { date: "Aug 24", mood: 8, energy: 7 },
  { date: "Aug 25", mood: 9, energy: 6 },
  { date: "Aug 26", mood: 8, energy: 6 },
  { date: "Aug 27", mood: 7, energy: 5 },
  { date: "Aug 28", mood: 7, energy: 5 },
  { date: "Aug 29", mood: 6, energy: 6 },
  { date: "Aug 30", mood: 6, energy: 7 },
];

const MoodJourneyChart = () => {
  const [range, setRange] = useState<"7D" | "30D">("30D");
  const data = range === "30D" ? data30 : data7;

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
            {range === "30D" ? "30-day psychological fluctuations" : "Last 7 days mood and energy trend"}
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
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
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
      </div>
    </motion.div>
  );
};

export default MoodJourneyChart;
