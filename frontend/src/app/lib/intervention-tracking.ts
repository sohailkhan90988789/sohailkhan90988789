import { BehavioralDataPoint } from "@/app/data/mockData";
import {
  averageMetric,
  MetricKey,
  metricCatalog,
  sortBehavioralData,
} from "@/app/lib/behavioral-metrics";

export interface InterventionPlan {
  id: string;
  title: string;
  action: string;
  focusMetric: MetricKey;
  targetDirection: "increase" | "decrease";
  targetDelta: number;
  startDate: string;
  notes?: string;
}

export interface InterventionReview extends InterventionPlan {
  baseline: number;
  current: number;
  observedDelta: number;
  progress: number;
  status: "tracking" | "on-track" | "watch" | "achieved";
  daysActive: number;
  evaluation: string;
}

export function evaluateInterventions(
  data: BehavioralDataPoint[],
  plans: InterventionPlan[],
) {
  const sortedData = sortBehavioralData(data);

  return [...plans]
    .sort(
      (left, right) =>
        new Date(right.startDate).getTime() - new Date(left.startDate).getTime(),
    )
    .map((plan) => {
      const planDate = new Date(plan.startDate).getTime();
      const preWindow = sortedData.filter(
        (entry) => new Date(entry.date).getTime() < planDate,
      );
      const postWindow = sortedData.filter(
        (entry) => new Date(entry.date).getTime() >= planDate,
      );

      const baselineSample = preWindow.slice(-Math.min(7, preWindow.length));
      const currentSample = postWindow.slice(-Math.min(7, postWindow.length));
      const baseline = averageMetric(
        baselineSample.length > 0 ? baselineSample : sortedData,
        plan.focusMetric,
      );
      const current = averageMetric(
        currentSample.length > 0 ? currentSample : sortedData,
        plan.focusMetric,
      );
      const observedDelta = current - baseline;
      const progressDelta =
        plan.targetDirection === "increase" ? observedDelta : baseline - current;
      const progress =
        plan.targetDelta > 0 ? (progressDelta / plan.targetDelta) * 100 : 0;
      const daysActive = Math.max(
        0,
        Math.floor((Date.now() - planDate) / (1000 * 60 * 60 * 24)),
      );

      let status: InterventionReview["status"] = "tracking";
      if (currentSample.length >= 3) {
        if (progress >= 100) {
          status = "achieved";
        } else if (progress >= 50) {
          status = "on-track";
        } else if (progress > 0) {
          status = "watch";
        }
      }

      const metricDefinition = metricCatalog.find(
        (metric) => metric.key === plan.focusMetric,
      );
      const evaluation =
        status === "achieved"
          ? `${metricDefinition?.label ?? "This metric"} has already moved enough to meet your target.`
          : status === "on-track"
            ? `${metricDefinition?.label ?? "This metric"} is moving in the right direction and is already more than halfway to your goal.`
            : status === "watch"
              ? `${metricDefinition?.label ?? "This metric"} has improved slightly, but the shift is still smaller than your target.`
              : "Keep tracking a few more days before judging this intervention. The system needs a stronger post-intervention window.";

      return {
        ...plan,
        baseline,
        current,
        observedDelta,
        progress,
        status,
        daysActive,
        evaluation,
      } satisfies InterventionReview;
    });
}
