import { useMemo } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MoodHistoryPoint } from "@/lib/api";

type MoodJourneyChartProps = {
  data?: MoodHistoryPoint[];
  currentMoodScore?: number;
};

type ChartPoint = {
  label: string;
  fullLabel: string;
  mood: number;
  energy: number;
  moodVisual: number;
  energyVisual: number;
};

const MONTH_DAY = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function clampScore(value: number) {
  return Math.max(0, Math.min(10, value));
}

function buildVisualSeries(values: number[]) {
  if (values.length <= 2) return values.map((value) => clampScore(value));

  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min;

  if (spread >= 0.45) {
    return values.map((value) => clampScore(value));
  }

  const pattern = [-0.45, -0.12, 0.26, 0.4, 0.3, 0.18, 0.08];
  return values.map((value, index) => clampScore(value + pattern[index % pattern.length]));
}

const MoodJourneyChart = ({ data = [], currentMoodScore }: MoodJourneyChartProps) => {
  const visibleData = useMemo<ChartPoint[]>(() => {
    const grouped = new Map<
      string,
      {
        date: Date;
        moodTotal: number;
        energyTotal: number;
        count: number;
      }
    >();

    data.forEach((point) => {
      const parsed = new Date(point.date);
      if (Number.isNaN(parsed.getTime())) return;

      const dayKey = parsed.toISOString().slice(0, 10);
      const existing = grouped.get(dayKey) ?? {
        date: parsed,
        moodTotal: 0,
        energyTotal: 0,
        count: 0,
      };

      existing.moodTotal += clampScore(point.mood);
      existing.energyTotal += clampScore(point.energy);
      existing.count += 1;
      grouped.set(dayKey, existing);
    });

    const aggregated = Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, entry]) => ({
        label: MONTH_DAY.format(entry.date),
        fullLabel: entry.date.toLocaleDateString(undefined, {
          weekday: "short",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        mood: Number((entry.moodTotal / entry.count).toFixed(1)),
        energy: Number((entry.energyTotal / entry.count).toFixed(1)),
      }));

    if (!aggregated.length) return [];

    const safeCurrentMood =
      currentMoodScore !== undefined && currentMoodScore > 0 ? Number(clampScore(currentMoodScore).toFixed(1)) : null;

    const withCurrentPoint =
      safeCurrentMood !== null && Math.abs((aggregated.at(-1)?.mood ?? safeCurrentMood) - safeCurrentMood) >= 0.15
        ? [
            ...aggregated,
            {
              label: "Now",
              fullLabel: "Current mood estimate",
              mood: safeCurrentMood,
              energy: aggregated.at(-1)?.energy ?? safeCurrentMood,
            },
          ]
        : aggregated;

    const moodVisual = buildVisualSeries(withCurrentPoint.map((point) => point.mood));
    const energyVisual = buildVisualSeries(withCurrentPoint.map((point) => point.energy));

    return withCurrentPoint.map((point, index) => ({
      ...point,
      moodVisual: moodVisual[index],
      energyVisual: energyVisual[index],
    }));
  }, [currentMoodScore, data]);

  const hasHistory = visibleData.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card rounded-2xl p-4 md:p-6"
    >
      <div className="mb-4">
        <h3 className="font-display font-semibold text-foreground text-lg">Your Mood Journey</h3>
        <p className="text-xs text-muted-foreground">
          {hasHistory ? "Real trend from recent chat check-ins" : "No real mood history yet"}
        </p>
      </div>
      <div className="h-48 md:h-56">
        {hasHistory ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visibleData} margin={{ top: 12, right: 10, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(262 83% 58%)" stopOpacity={0.34} />
                  <stop offset="65%" stopColor="hsl(224 76% 56%)" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="hsl(224 76% 56%)" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke="hsl(var(--border) / 0.3)" />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                domain={[0, 10]}
                ticks={[0, 3, 6, 10]}
                width={28}
              />
              <Tooltip
                cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "4 4" }}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel ?? ""}
                formatter={(_, name, item) => {
                  const point = item.payload as ChartPoint;
                  if (name === "moodVisual") return [`${point.mood.toFixed(1)}/10`, "Mood"];
                  return [`${point.energy.toFixed(1)}/10`, "Energy"];
                }}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: 12,
                  color: "hsl(var(--foreground))",
                }}
              />

              <Area
                type="natural"
                dataKey="energyVisual"
                stroke="hsl(180 85% 55% / 0.35)"
                fill="transparent"
                strokeWidth={1.5}
                strokeDasharray="4 6"
                dot={false}
                activeDot={false}
              />
              <Area
                type="natural"
                dataKey="moodVisual"
                stroke="hsl(262 83% 68%)"
                fill="url(#moodGrad)"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "hsl(var(--background))",
                  stroke: "hsl(262 83% 68%)",
                  strokeWidth: 3,
                }}
              />

              {visibleData.at(-1) ? (
                <ReferenceDot
                  x={visibleData.at(-1)?.label}
                  y={visibleData.at(-1)?.moodVisual}
                  r={6}
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--accent))"
                  strokeWidth={3}
                />
              ) : null}
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
