import { BehavioralDataPoint } from "@/app/data/mockData";
import {
  averageMetric,
  clamp,
  sortBehavioralData,
} from "@/app/lib/behavioral-metrics";

export interface ScenarioInputs {
  sleepHours: number;
  physicalActivity: number;
  socialInteraction: number;
  screenTime: number;
}

export interface ScenarioProjectionMetric {
  label: string;
  current: number;
  projected: number;
  delta: number;
  favorableDirection: "increase" | "decrease";
}

export interface ScenarioProjection {
  metrics: {
    moodScore: ScenarioProjectionMetric;
    stressLevel: ScenarioProjectionMetric;
    productivityScore: ScenarioProjectionMetric;
  };
  confidence: number;
  summary: string;
  explanation: string[];
}

export function buildScenarioDefaults(data: BehavioralDataPoint[]): ScenarioInputs {
  if (data.length === 0) {
    return {
      sleepHours: 7.5,
      physicalActivity: 6,
      socialInteraction: 6,
      screenTime: 4,
    };
  }

  const recentWindow = sortBehavioralData(data).slice(-Math.min(7, data.length));

  return {
    sleepHours: Number(averageMetric(recentWindow, "sleepHours").toFixed(1)) || 7.5,
    physicalActivity:
      Number(averageMetric(recentWindow, "physicalActivity").toFixed(1)) || 6,
    socialInteraction:
      Number(averageMetric(recentWindow, "socialInteraction").toFixed(1)) || 6,
    screenTime: Number(averageMetric(recentWindow, "screenTime").toFixed(1)) || 4,
  };
}

export function simulateScenario(
  data: BehavioralDataPoint[],
  scenario: ScenarioInputs,
): ScenarioProjection {
  const sortedData = sortBehavioralData(data);
  const recentWindow = sortedData.slice(-Math.min(7, sortedData.length));
  const defaults = buildScenarioDefaults(data);
  const currentMood = averageMetric(recentWindow, "moodScore") || 6.5;
  const currentStress = averageMetric(recentWindow, "stressLevel") || 4.5;
  const currentProductivity =
    averageMetric(recentWindow, "productivityScore") || 6.5;

  const sleepDelta = scenario.sleepHours - defaults.sleepHours;
  const activityDelta = scenario.physicalActivity - defaults.physicalActivity;
  const socialDelta = scenario.socialInteraction - defaults.socialInteraction;
  const screenDelta = scenario.screenTime - defaults.screenTime;

  const projectedMood = clamp(
    currentMood +
      sleepDelta * 0.35 +
      activityDelta * 0.24 +
      socialDelta * 0.22 -
      screenDelta * 0.18,
    0,
    10,
  );
  const projectedStress = clamp(
    currentStress -
      sleepDelta * 0.4 -
      activityDelta * 0.18 -
      socialDelta * 0.16 +
      screenDelta * 0.24,
    0,
    10,
  );
  const projectedProductivity = clamp(
    currentProductivity +
      sleepDelta * 0.3 +
      activityDelta * 0.2 +
      socialDelta * 0.1 -
      screenDelta * 0.18,
    0,
    10,
  );

  const explanation: string[] = [];
  if (sleepDelta !== 0) {
    explanation.push(
      sleepDelta > 0
        ? `More sleep is projected to improve recovery-sensitive metrics by about ${sleepDelta.toFixed(1)} hour(s).`
        : `Reduced sleep is likely to make mood and stress less stable by around ${Math.abs(sleepDelta).toFixed(1)} hour(s).`,
    );
  }
  if (activityDelta !== 0) {
    explanation.push(
      activityDelta > 0
        ? "Higher physical activity usually supports lower stress and stronger productivity in your current pattern."
        : "Lower movement is likely to soften productivity and remove one of your main stress buffers.",
    );
  }
  if (socialDelta !== 0) {
    explanation.push(
      socialDelta > 0
        ? "More social contact tends to lift mood stability in the short term."
        : "Less social interaction may increase isolation pressure on mood.",
    );
  }
  if (screenDelta !== 0) {
    explanation.push(
      screenDelta < 0
        ? "Lower screen time is projected to reduce stress friction and support better focus."
        : "Higher screen time can intensify stress and erode recovery if it replaces sleep or downtime.",
    );
  }

  const netBalance =
    (projectedMood - currentMood) +
    (currentStress - projectedStress) +
    (projectedProductivity - currentProductivity);

  return {
    metrics: {
      moodScore: {
        label: "Mood Score",
        current: currentMood,
        projected: projectedMood,
        delta: projectedMood - currentMood,
        favorableDirection: "increase",
      },
      stressLevel: {
        label: "Stress Level",
        current: currentStress,
        projected: projectedStress,
        delta: projectedStress - currentStress,
        favorableDirection: "decrease",
      },
      productivityScore: {
        label: "Productivity",
        current: currentProductivity,
        projected: projectedProductivity,
        delta: projectedProductivity - currentProductivity,
        favorableDirection: "increase",
      },
    },
    confidence: Math.min(0.92, Math.max(0.5, 0.5 + data.length / 70)),
    summary:
      netBalance >= 1
        ? "This scenario looks noticeably stabilizing."
        : netBalance >= 0
          ? "This scenario looks mildly positive overall."
          : "This scenario looks mixed and may increase pressure on your current routine.",
    explanation,
  };
}
