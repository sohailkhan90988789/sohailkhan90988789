import { BehavioralDataPoint } from "@/app/data/mockData";

export type MetricKey =
  | "sleepHours"
  | "sleepQuality"
  | "physicalActivity"
  | "socialInteraction"
  | "screenTime"
  | "moodScore"
  | "stressLevel"
  | "productivityScore";

export interface LocalDraftEntry extends BehavioralDataPoint {
  id: string;
  storedAt: string;
  localOnly: true;
}

export interface BaselineMetric {
  key: MetricKey;
  label: string;
  unit: string;
  baseline: number;
  recent: number;
  latest: number;
  deviation: number;
  deviationPct: number;
  priority: "supportive" | "watch" | "stable";
  statusLabel: string;
  narrative: string;
}

interface MetricDefinition {
  key: MetricKey;
  label: string;
  unit: string;
  higherIsBetter: boolean;
}

export const metricCatalog: MetricDefinition[] = [
  { key: "sleepHours", label: "Sleep Hours", unit: "hrs", higherIsBetter: true },
  { key: "sleepQuality", label: "Sleep Quality", unit: "/10", higherIsBetter: true },
  { key: "physicalActivity", label: "Physical Activity", unit: "/10", higherIsBetter: true },
  { key: "socialInteraction", label: "Social Interaction", unit: "/10", higherIsBetter: true },
  { key: "screenTime", label: "Screen Time", unit: "hrs", higherIsBetter: false },
  { key: "moodScore", label: "Mood Score", unit: "/10", higherIsBetter: true },
  { key: "stressLevel", label: "Stress Level", unit: "/10", higherIsBetter: false },
  { key: "productivityScore", label: "Productivity", unit: "/10", higherIsBetter: true },
];

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function averageMetric(
  data: BehavioralDataPoint[],
  key: MetricKey,
  predicate?: (entry: BehavioralDataPoint) => boolean,
) {
  const values = data
    .filter((entry) => (predicate ? predicate(entry) : true))
    .map((entry) => entry[key])
    .filter((value) => typeof value === "number") as number[];

  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function sortBehavioralData<T extends { date: string }>(data: T[]) {
  return [...data].sort(
    (left, right) =>
      new Date(left.date).getTime() - new Date(right.date).getTime(),
  );
}

function formatPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function mergeBehavioralData(
  syncedEntries: BehavioralDataPoint[],
  localDraftEntries: LocalDraftEntry[],
) {
  return [...syncedEntries, ...localDraftEntries].sort((left, right) => {
    const dateDelta =
      new Date(left.date).getTime() - new Date(right.date).getTime();

    if (dateDelta !== 0) {
      return dateDelta;
    }

    const leftStoredAt = "storedAt" in left ? Date.parse(left.storedAt) : 0;
    const rightStoredAt = "storedAt" in right ? Date.parse(right.storedAt) : 0;
    return leftStoredAt - rightStoredAt;
  });
}

export function buildPersonalBaseline(data: BehavioralDataPoint[]) {
  if (data.length === 0) {
    return [] as BaselineMetric[];
  }

  const sortedData = sortBehavioralData(data);
  const baselineWindow = sortedData.slice(0, Math.min(7, sortedData.length));
  const recentWindow = sortedData.slice(-Math.min(7, sortedData.length));
  const latestEntry = sortedData[sortedData.length - 1];

  return metricCatalog
    .map((metric) => {
      const baseline = averageMetric(baselineWindow, metric.key);
      const recent = averageMetric(recentWindow, metric.key);
      const latestValue = latestEntry[metric.key];
      const latest = typeof latestValue === "number" ? latestValue : recent;
      const deviation = recent - baseline;
      const deviationPct = baseline === 0 ? 0 : (deviation / baseline) * 100;
      const effectiveChange = metric.higherIsBetter ? deviationPct : -deviationPct;

      let priority: BaselineMetric["priority"] = "stable";
      let statusLabel = "On your usual baseline";
      if (Math.abs(effectiveChange) >= 6) {
        if (effectiveChange > 0) {
          priority = "supportive";
          statusLabel = "Above your usual pattern";
        } else {
          priority = "watch";
          statusLabel = "Below your usual pattern";
        }
      }

      const narrative =
        priority === "supportive"
          ? `${metric.label} is trending ${formatPercent(effectiveChange)} better than your baseline.`
          : priority === "watch"
            ? `${metric.label} is ${formatPercent(effectiveChange)} below your usual range and worth attention.`
            : `${metric.label} is staying close to your personal baseline.`;

      return {
        key: metric.key,
        label: metric.label,
        unit: metric.unit,
        baseline,
        recent,
        latest,
        deviation,
        deviationPct,
        priority,
        statusLabel,
        narrative,
      } satisfies BaselineMetric;
    })
    .sort((left, right) => Math.abs(right.deviationPct) - Math.abs(left.deviationPct));
}
