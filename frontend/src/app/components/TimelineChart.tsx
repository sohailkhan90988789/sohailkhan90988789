import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { BehavioralDataPoint } from "@/app/data/mockData";

interface TimelineChartProps {
  data: BehavioralDataPoint[];
}

type MetricKey =
  | "sleepQuality"
  | "moodScore"
  | "stressLevel"
  | "socialInteraction"
  | "physicalActivity"
  | "productivityScore";

const metricConfigs = {
  sleepQuality: { label: "Sleep Quality", color: "#8b5cf6" },
  moodScore: { label: "Mood Score", color: "#f59e0b" },
  stressLevel: { label: "Stress Level", color: "#ef4444" },
  socialInteraction: { label: "Social Interaction", color: "#ec4899" },
  physicalActivity: { label: "Physical Activity", color: "#10b981" },
  productivityScore: { label: "Productivity", color: "#3b82f6" },
};

export function TimelineChart({ data }: TimelineChartProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<Set<MetricKey>>(
    new Set(["sleepQuality", "moodScore", "stressLevel"]),
  );

  if (data.length === 0) {
    return (
      <Card className="rounded-[28px] border-white/70 bg-white/82 p-6 shadow-[0_24px_60px_-38px_rgba(16,61,68,0.48)]">
        <div className="space-y-3">
          <h3 className="text-2xl text-[#162530]">30-Day Behavioral Timeline</h3>
          <p className="text-sm leading-6 text-slate-600">
            No live data is available yet. Submit your first check-in from the
            overview tab to start building the timeline.
          </p>
        </div>
      </Card>
    );
  }

  const toggleMetric = (metric: MetricKey) => {
    const newSelection = new Set(selectedMetrics);
    if (newSelection.has(metric)) {
      if (newSelection.size > 1) {
        newSelection.delete(metric);
      }
    } else {
      newSelection.add(metric);
    }
    setSelectedMetrics(newSelection);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const chartData = data.map((entry) => ({
    ...entry,
    dateFormatted: formatDate(entry.date),
  }));

  return (
    <Card className="rounded-[28px] border-white/70 bg-white/82 p-6 shadow-[0_24px_60px_-38px_rgba(16,61,68,0.48)]">
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-2xl text-[#162530]">
            30-Day Behavioral Timeline
          </h3>
          <p className="text-sm text-slate-600">
            Track patterns over time. Select metrics to compare and identify
            correlations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(metricConfigs) as MetricKey[]).map((key) => {
            const config = metricConfigs[key];
            const isSelected = selectedMetrics.has(key);

            return (
              <Button
                key={key}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMetric(key)}
                className="text-xs"
                style={
                  isSelected
                    ? {
                        backgroundColor: config.color,
                        borderColor: config.color,
                      }
                    : {}
                }
              >
                <div
                  className="mr-2 h-2 w-2 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                {config.label}
              </Button>
            );
          })}
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="dateFormatted"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fontSize: 12 }}
                label={{
                  value: "Score (0-10)",
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
                formatter={(value: number) => value.toFixed(1)}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} iconType="line" />
              {Array.from(selectedMetrics).map((metric) => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  name={metricConfigs[metric].label}
                  stroke={metricConfigs[metric].color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="border-t border-[#eadfce] pt-3 text-xs text-slate-500">
          <strong>How to interpret:</strong> Look for patterns, trends, and
          correlations between different metrics. Simultaneous changes in
          multiple dimensions may indicate meaningful behavioral patterns.
        </div>
      </div>
    </Card>
  );
}
