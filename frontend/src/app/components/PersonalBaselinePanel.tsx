import { Activity, Gauge, Moon, ShieldAlert, Sparkles } from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import { BehavioralDataPoint } from "@/app/data/mockData";
import { buildPersonalBaseline } from "@/app/lib/behavioral-metrics";

interface PersonalBaselinePanelProps {
  data: BehavioralDataPoint[];
  localDraftCount: number;
}

const iconMap = {
  sleepHours: Moon,
  sleepQuality: Moon,
  physicalActivity: Activity,
  socialInteraction: Sparkles,
  screenTime: Gauge,
  moodScore: Sparkles,
  stressLevel: ShieldAlert,
  productivityScore: Gauge,
} as const;

export function PersonalBaselinePanel({
  data,
  localDraftCount,
}: PersonalBaselinePanelProps) {
  const baselineMetrics = buildPersonalBaseline(data).slice(0, 4);

  if (baselineMetrics.length === 0) {
    return (
      <Card className="rounded-[28px] border-white/70 bg-white/82 p-6 shadow-[0_24px_60px_-38px_rgba(16,61,68,0.48)]">
        <div className="space-y-3">
          <Badge className="w-fit rounded-full bg-[#103d44] px-3 py-1 text-[#f8efe2]">
            Personal baseline engine
          </Badge>
          <h2 className="text-3xl text-[#162530]">Your normal range starts here</h2>
          <p className="max-w-3xl text-slate-600">
            Once a few days of behavioral data are available, this panel will
            show what counts as normal for you instead of relying on a generic score.
          </p>
        </div>
      </Card>
    );
  }

  const supportiveCount = baselineMetrics.filter(
    (metric) => metric.priority === "supportive",
  ).length;
  const watchCount = baselineMetrics.filter(
    (metric) => metric.priority === "watch",
  ).length;

  return (
    <Card className="rounded-[28px] border-white/70 bg-white/82 p-6 shadow-[0_24px_60px_-38px_rgba(16,61,68,0.48)]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge className="w-fit rounded-full bg-[#103d44] px-3 py-1 text-[#f8efe2]">
              Personal baseline engine
            </Badge>
            <h2 className="text-3xl text-[#162530]">Your normal, not a generic average</h2>
            <p className="max-w-3xl text-sm leading-7 text-slate-700">
              The dashboard now compares your recent behavior against your own
              early baseline so the system can describe what is unusual for you.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full text-xs">
              {supportiveCount} supportive shifts
            </Badge>
            <Badge variant="outline" className="rounded-full text-xs">
              {watchCount} watch signals
            </Badge>
            {localDraftCount > 0 && (
              <Badge className="rounded-full bg-[#8c5427] text-[11px] text-[#fff7ee]">
                {localDraftCount} local-only draft entries included
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {baselineMetrics.map((metric) => {
            const Icon = iconMap[metric.key];
            const tone =
              metric.priority === "supportive"
                ? "border-emerald-200 bg-emerald-50"
                : metric.priority === "watch"
                  ? "border-rose-200 bg-rose-50"
                  : "border-[#eadfce] bg-[#fcf6ee]";

            return (
              <div
                key={metric.key}
                className={`rounded-[24px] border p-4 shadow-[0_18px_50px_-34px_rgba(16,61,68,0.24)] ${tone}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white/80 p-2.5 text-[#103d44]">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#162530]">
                        {metric.label}
                      </p>
                      <p className="text-xs uppercase tracking-[0.14em] text-[#8c5427]">
                        {metric.statusLabel}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-3xl font-semibold text-[#162530]">
                    {metric.latest.toFixed(1)}
                    <span className="ml-1 text-sm font-medium text-slate-500">
                      {metric.unit}
                    </span>
                  </p>
                  <p className="text-sm text-slate-700">
                    Baseline {metric.baseline.toFixed(1)}
                    {metric.unit} to recent {metric.recent.toFixed(1)}
                    {metric.unit}
                  </p>
                  <p className="text-sm leading-6 text-slate-700">
                    {metric.narrative}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
