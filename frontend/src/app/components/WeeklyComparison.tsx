import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/app/components/ui/card";
import { BehavioralDataPoint } from "@/app/data/mockData";

interface WeeklyComparisonProps {
  data: BehavioralDataPoint[];
}

export function WeeklyComparison({ data }: WeeklyComparisonProps) {
  if (data.length === 0) {
    return (
      <Card className="rounded-[28px] border-white/70 bg-white/82 p-6 shadow-[0_24px_60px_-38px_rgba(16,61,68,0.48)]">
        <div className="space-y-3">
          <h3 className="text-2xl text-[#162530]">Weekly Averages Comparison</h3>
          <p className="text-sm leading-6 text-slate-600">
            Weekly aggregation appears here once live entries are available.
          </p>
        </div>
      </Card>
    );
  }

  const getWeekNumber = (date: string): number => {
    const currentDate = new Date(date);
    const firstDay = new Date(data[0].date);
    const diffTime = currentDate.getTime() - firstDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
  };

  const weeklyData: Record<number, BehavioralDataPoint[]> = {};

  data.forEach((point) => {
    const week = getWeekNumber(point.date);
    if (!weeklyData[week]) {
      weeklyData[week] = [];
    }
    weeklyData[week].push(point);
  });

  const weeklyAverages = Object.entries(weeklyData).map(([week, points]) => {
    const avg = (key: keyof BehavioralDataPoint) => {
      const values = points
        .map((point) => point[key])
        .filter((value) => typeof value === "number") as number[];
      return values.reduce((a, b) => a + b, 0) / values.length;
    };

    return {
      week: `Week ${week}`,
      sleepQuality: avg("sleepQuality"),
      moodScore: avg("moodScore"),
      stressLevel: avg("stressLevel"),
      socialInteraction: avg("socialInteraction"),
      physicalActivity: avg("physicalActivity"),
      productivityScore: avg("productivityScore"),
    };
  });

  return (
    <Card className="rounded-[28px] border-white/70 bg-white/82 p-6 shadow-[0_24px_60px_-38px_rgba(16,61,68,0.48)]">
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-2xl text-[#162530]">
            Weekly Averages Comparison
          </h3>
          <p className="text-sm text-slate-600">
            Compare average scores across weeks to identify long-term trends and
            changes in behavioral patterns.
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyAverages}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis
                domain={[0, 10]}
                tick={{ fontSize: 12 }}
                label={{
                  value: "Average Score",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "14px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => value.toFixed(2)}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} iconType="rect" />
              <Bar dataKey="sleepQuality" name="Sleep Quality" fill="#8b5cf6" />
              <Bar dataKey="moodScore" name="Mood Score" fill="#f59e0b" />
              <Bar dataKey="stressLevel" name="Stress Level" fill="#ef4444" />
              <Bar dataKey="socialInteraction" name="Social" fill="#ec4899" />
              <Bar dataKey="physicalActivity" name="Activity" fill="#10b981" />
              <Bar dataKey="productivityScore" name="Productivity" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-[#fbf6ef] p-3 text-xs text-slate-500">
          <strong>Interpretation:</strong> Weekly aggregation smooths out daily
          variations to reveal broader trends. Look for consistent changes
          across multiple weeks, which may indicate sustained pattern shifts
          requiring attention.
        </div>
      </div>
    </Card>
  );
}
