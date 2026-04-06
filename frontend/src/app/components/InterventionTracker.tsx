import { FormEvent, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Plus,
  Trash2,
} from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { BehavioralDataPoint } from "@/app/data/mockData";
import {
  InterventionPlan,
  evaluateInterventions,
} from "@/app/lib/intervention-tracking";
import { metricCatalog, MetricKey } from "@/app/lib/behavioral-metrics";

interface InterventionTrackerProps {
  data: BehavioralDataPoint[];
  interventions: InterventionPlan[];
  onAddIntervention: (
    intervention: Omit<InterventionPlan, "id">,
  ) => Promise<void> | void;
  onRemoveIntervention: (id: string) => Promise<void> | void;
}

interface InterventionFormState {
  title: string;
  action: string;
  focusMetric: MetricKey;
  targetDirection: "increase" | "decrease";
  targetDelta: string;
  startDate: string;
  notes: string;
}

function buildInitialState(): InterventionFormState {
  return {
    title: "",
    action: "",
    focusMetric: "sleepQuality",
    targetDirection: "increase",
    targetDelta: "1",
    startDate: new Date().toISOString().split("T")[0],
    notes: "",
  };
}

export function InterventionTracker({
  data,
  interventions,
  onAddIntervention,
  onRemoveIntervention,
}: InterventionTrackerProps) {
  const [formState, setFormState] = useState<InterventionFormState>(() =>
    buildInitialState(),
  );

  const reviews = evaluateInterventions(data, interventions);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onAddIntervention({
      title: formState.title.trim(),
      action: formState.action.trim(),
      focusMetric: formState.focusMetric,
      targetDirection: formState.targetDirection,
      targetDelta: Number(formState.targetDelta),
      startDate: formState.startDate,
      notes: formState.notes.trim(),
    });

    setFormState(buildInitialState());
  };

  const getStatusTone = (status: string) => {
    switch (status) {
      case "achieved":
        return "border-emerald-200 bg-emerald-50 text-emerald-900";
      case "on-track":
        return "border-sky-200 bg-sky-50 text-sky-900";
      case "watch":
        return "border-amber-200 bg-amber-50 text-amber-900";
      default:
        return "border-[#eadfce] bg-[#fcf6ee] text-[#5e3b1c]";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge className="w-fit rounded-full bg-[#103d44] px-3 py-1 text-[#f8efe2]">
            Intervention tracker
          </Badge>
          <h2 className="text-3xl text-[#162530]">Track what actually helps</h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-700">
            Turn recommendations into short experiments, then compare your
            current data against the pre-intervention baseline to see whether
            the change is helping in practice.
          </p>
        </div>

        <Badge variant="outline" className="rounded-full text-xs">
          {reviews.length} active experiments
        </Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[28px] border-white/70 bg-white/82 p-5 shadow-[0_18px_50px_-34px_rgba(16,61,68,0.45)]">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="intervention-title">Experiment title</Label>
              <Input
                id="intervention-title"
                value={formState.title}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Example: 20-minute evening walk"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="intervention-action">Intervention action</Label>
              <Input
                id="intervention-action"
                value={formState.action}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    action: event.target.value,
                  }))
                }
                placeholder="What exactly will you change?"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="intervention-metric">Focus metric</Label>
                <select
                  id="intervention-metric"
                  value={formState.focusMetric}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      focusMetric: event.target.value as MetricKey,
                    }))
                  }
                  className="h-11 w-full rounded-2xl border border-[#dccab3] bg-white px-3 text-sm"
                >
                  {metricCatalog.map((metric) => (
                    <option key={metric.key} value={metric.key}>
                      {metric.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="intervention-direction">Goal direction</Label>
                <select
                  id="intervention-direction"
                  value={formState.targetDirection}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      targetDirection: event.target.value as "increase" | "decrease",
                    }))
                  }
                  className="h-11 w-full rounded-2xl border border-[#dccab3] bg-white px-3 text-sm"
                >
                  <option value="increase">Increase</option>
                  <option value="decrease">Decrease</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="intervention-delta">Target change</Label>
                <Input
                  id="intervention-delta"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formState.targetDelta}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      targetDelta: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="intervention-start">Start date</Label>
                <Input
                  id="intervention-start"
                  type="date"
                  value={formState.startDate}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      startDate: event.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="intervention-notes">Notes</Label>
              <Textarea
                id="intervention-notes"
                value={formState.notes}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                placeholder="Why are you trying this, and what should success feel like?"
              />
            </div>

            <Button
              type="submit"
              className="rounded-full bg-[#103d44] px-5 text-[#f8efe2] hover:bg-[#0c3137]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Start intervention
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          {reviews.length === 0 && (
            <Card className="rounded-[28px] border-[#d7e9e3] bg-[#eef7f5] p-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#103d44]">
                  <ClipboardCheck className="h-4 w-4" />
                  No active intervention yet
                </div>
                <p className="text-sm leading-6 text-slate-700">
                  Create a small behavioral experiment here and the system will
                  compare your current data to your pre-intervention baseline.
                </p>
              </div>
            </Card>
          )}

          {reviews.map((review) => (
            <Card
              key={review.id}
              className="rounded-[28px] border-white/70 bg-white/82 p-5 shadow-[0_18px_50px_-34px_rgba(16,61,68,0.45)]"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-[#162530]">
                        {review.title}
                      </h3>
                      <Badge
                        className={`rounded-full border ${getStatusTone(review.status)}`}
                      >
                        {review.status.replace("-", " ")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {review.action}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveIntervention(review.id)}
                    className="rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-[#eadfce] bg-[#fcf6ee] p-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#8c5427]">
                      Baseline
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[#162530]">
                      {review.baseline.toFixed(1)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#d7e9e3] bg-[#eef7f5] p-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#2f7c6f]">
                      Current
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[#162530]">
                      {review.current.toFixed(1)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                      Goal progress
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[#162530]">
                      {Math.max(0, review.progress).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#eadfce] bg-[#fcf6ee] p-4 text-sm leading-6 text-slate-700">
                  {review.evaluation}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {review.daysActive} days active
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Target {review.targetDirection} by {review.targetDelta}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
