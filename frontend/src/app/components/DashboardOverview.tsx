import {
  Activity,
  Brain,
  Minus,
  Moon,
  Smile,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import { BehavioralDataPoint } from "@/app/data/mockData";

interface DashboardOverviewProps {
  data: BehavioralDataPoint[];
  isRefreshing: boolean;
}

const iconMap = {
  moon: Moon,
  users: Users,
  activity: Activity,
  smile: Smile,
  brain: Brain,
  target: Target,
};

const metricDefinitions = [
  {
    key: "sleepQuality",
    label: "Sleep Quality",
    icon: "moon",
    color: "#8b5cf6",
  },
  {
    key: "socialInteraction",
    label: "Social Connection",
    icon: "users",
    color: "#ec4899",
  },
  {
    key: "physicalActivity",
    label: "Physical Activity",
    icon: "activity",
    color: "#10b981",
  },
  {
    key: "moodScore",
    label: "Mood Stability",
    icon: "smile",
    color: "#f59e0b",
  },
  {
    key: "stressLevel",
    label: "Stress Level",
    icon: "brain",
    color: "#ef4444",
    inverted: true,
  },
  {
    key: "productivityScore",
    label: "Productivity",
    icon: "target",
    color: "#3b82f6",
  },
] as const;

function average(
  data: BehavioralDataPoint[],
  key: keyof BehavioralDataPoint,
): number {
  const values = data
    .map((entry) => entry[key])
    .filter((value) => typeof value === "number") as number[];

  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function DashboardOverview({
  data,
  isRefreshing,
}: DashboardOverviewProps) {
  if (data.length === 0) {
    return (
      <Card className="rounded-[28px] border-white/70 bg-white/82 p-6 shadow-[0_24px_60px_-38px_rgba(16,61,68,0.48)]">
        <div className="space-y-3">
          <Badge className="w-fit rounded-full bg-[#103d44] px-3 py-1 text-[#f8efe2]">
            Live data pending
          </Badge>
          <h2 className="text-3xl text-[#162530]">Behavioral Pattern Overview</h2>
          <p className="max-w-3xl text-slate-600">
            No live entries have been stored yet. Use the check-in form above to
            submit your first behavioral record and unlock the timeline,
            correlations, and explainable insights.
          </p>
        </div>
      </Card>
    );
  }

  const baselineWindow = data.slice(0, Math.min(7, data.length));
  const currentWindow = data.slice(-Math.min(7, data.length));

  const liveMetrics = metricDefinitions.map((metric) => {
    const baseline = average(baselineWindow, metric.key);
    const current = average(currentWindow, metric.key);
    const change = baseline > 0 ? ((current - baseline) / baseline) * 100 : 0;

    return {
      ...metric,
      baseline,
      current,
      change,
    };
  });

  const getTrendIcon = (change: number, inverted?: boolean) => {
    const effectiveChange = inverted ? -change : change;
    if (Math.abs(effectiveChange) < 5) return <Minus className="h-4 w-4" />;
    return effectiveChange > 0 ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );
  };

  const getTrendColor = (change: number, inverted?: boolean) => {
    const effectiveChange = inverted ? -change : change;
    if (Math.abs(effectiveChange) < 5) return "text-slate-500";
    return effectiveChange > 0 ? "text-emerald-600" : "text-rose-600";
  };

  const getStatusBadge = (change: number, inverted?: boolean) => {
    const effectiveChange = inverted ? -change : change;
    const absChange = Math.abs(effectiveChange);

    if (absChange < 5) return { label: "Stable", variant: "default" as const };
    if (absChange < 15) {
      return effectiveChange > 0
        ? { label: "Improving", variant: "default" as const }
        : { label: "Attention", variant: "secondary" as const };
    }

    return effectiveChange > 0
      ? { label: "Good Progress", variant: "default" as const }
      : { label: "Monitor", variant: "destructive" as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="mb-2 text-3xl text-[#162530]">Behavioral Pattern Overview</h2>
          <p className="max-w-3xl text-slate-600">
            Key dimensions are now calculated from your live backend entries.
            The current view compares your latest 7-day window against your
            initial 7-day baseline.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {data.length} live entries
          </Badge>
          <Badge variant="outline" className="text-xs">
            {isRefreshing ? "Refreshing..." : "Synced with backend"}
          </Badge>
        </div>
      </div>

      {data.length < 7 && (
        <Card className="rounded-[24px] border-[#d7e9e3] bg-[#eef7f5] p-4">
          <p className="text-sm text-slate-700">
            <strong>Research note:</strong> You can already capture live data,
            but pattern confidence improves after at least 7 daily entries.
            Keep tracking to unlock stronger trend and anomaly analysis.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {liveMetrics.map((metric) => {
          const Icon = iconMap[metric.icon];
          const status = getStatusBadge(metric.change, metric.inverted);

          return (
            <Card
              key={metric.label}
              className="rounded-[24px] border-white/70 bg-white/82 p-5 shadow-[0_22px_55px_-38px_rgba(16,61,68,0.5)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="rounded-2xl p-2.5"
                    style={{ backgroundColor: `${metric.color}15` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: metric.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-700">
                      {metric.label}
                    </h3>
                  </div>
                </div>
                <Badge variant={status.variant} className="text-xs">
                  {status.label}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#162530]">
                    {metric.current.toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-500">/10</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`flex items-center gap-1 font-medium ${getTrendColor(metric.change, metric.inverted)}`}
                  >
                    {getTrendIcon(metric.change, metric.inverted)}
                    {Math.abs(metric.change).toFixed(1)}%
                  </span>
                  <span className="text-slate-500">
                    from baseline ({metric.baseline.toFixed(1)})
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#ece1d4]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(metric.current / 10) * 100}%`,
                        backgroundColor: metric.color,
                      }}
                    />
                  </div>
                  <div className="relative h-1 w-full">
                    <div
                      className="absolute top-0 h-full w-0.5 bg-[#8c5427]/55"
                      style={{ left: `${(metric.baseline / 10) * 100}%` }}
                      title="Baseline"
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
