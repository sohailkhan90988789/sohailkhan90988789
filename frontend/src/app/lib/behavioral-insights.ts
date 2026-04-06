import {
  BehavioralDataPoint,
  PatternInsight,
} from "@/app/data/mockData";
import {
  averageMetric,
  buildPersonalBaseline,
  sortBehavioralData,
} from "@/app/lib/behavioral-metrics";

export interface PatternStory {
  headline: string;
  summary: string;
  narrative: string[];
  takeaways: string[];
  confidence: number;
}

function isWeekend(dateString: string) {
  const day = new Date(dateString).getDay();
  return day === 0 || day === 6;
}

function buildInsight(
  id: string,
  category: string,
  title: string,
  description: string,
  confidence: number,
  importance: "high" | "medium" | "low",
  factors: string[],
  recommendation: string,
) {
  return {
    id,
    category,
    title,
    description,
    confidence,
    importance,
    factors,
    recommendation,
  } satisfies PatternInsight;
}

function formatPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function detectHiddenPatterns(data: BehavioralDataPoint[]) {
  if (data.length < 7) {
    return [] as PatternInsight[];
  }

  const sortedData = sortBehavioralData(data);
  const firstWeek = sortedData.slice(0, Math.min(7, sortedData.length));
  const recentWeek = sortedData.slice(-Math.min(7, sortedData.length));
  const insights: PatternInsight[] = [];

  const weekdayMood = averageMetric(sortedData, "moodScore", (entry) => !isWeekend(entry.date));
  const weekendMood = averageMetric(sortedData, "moodScore", (entry) => isWeekend(entry.date));
  if (weekdayMood - weekendMood >= 0.9) {
    insights.push(
      buildInsight(
        "hidden_weekend_mood",
        "Hidden Pattern",
        "Weekend mood dip detected",
        "Your weekend mood is noticeably lower than your weekday baseline, suggesting your routine may be less restorative when structure drops.",
        0.77,
        "medium",
        [
          `Weekday mood average: ${weekdayMood.toFixed(1)}/10`,
          `Weekend mood average: ${weekendMood.toFixed(1)}/10`,
          "Pattern shows up across multiple recent entries",
        ],
        "Treat weekends as recovery design time: keep one anchor habit for sleep, movement, or social contact so the reset does not disappear.",
      ),
    );
  }

  const weekdayStress = averageMetric(
    sortedData,
    "stressLevel",
    (entry) => !isWeekend(entry.date),
  );
  const weekendStress = averageMetric(
    sortedData,
    "stressLevel",
    (entry) => isWeekend(entry.date),
  );
  if (weekendStress - weekdayStress >= 0.8) {
    insights.push(
      buildInsight(
        "hidden_weekend_stress",
        "Hidden Pattern",
        "Stress rises when routine loosens",
        "Stress tends to run higher on weekends than weekdays, which can signal unfinished work spillover or a lack of deliberate recovery time.",
        0.74,
        "medium",
        [
          `Weekday stress average: ${weekdayStress.toFixed(1)}/10`,
          `Weekend stress average: ${weekendStress.toFixed(1)}/10`,
          "The shift is larger than your normal day-to-day variation",
        ],
        "Plan one low-friction recovery ritual before the weekend starts so stress does not fill the empty space by default.",
      ),
    );
  }

  const baselineSleep = averageMetric(firstWeek, "sleepHours");
  const sleepDebtStreak = [...recentWeek]
    .reverse()
    .findIndex((entry) => (entry.sleepHours ?? baselineSleep) >= baselineSleep - 1);
  const lowSleepRun =
    sleepDebtStreak === -1 ? recentWeek.length : sleepDebtStreak;
  if (baselineSleep > 0 && lowSleepRun >= 3) {
    insights.push(
      buildInsight(
        "hidden_sleep_debt",
        "Hidden Pattern",
        "Sleep debt streak is forming",
        "Recent sleep duration has stayed under your usual range for several days in a row, which can quietly amplify mood instability and stress reactivity.",
        0.85,
        "high",
        [
          `Personal sleep baseline: ${baselineSleep.toFixed(1)} hrs`,
          `Current low-sleep streak: ${lowSleepRun} days`,
          `Recent sleep average: ${averageMetric(recentWeek, "sleepHours").toFixed(1)} hrs`,
        ],
        "A small recovery step matters here: aim to protect the next two nights first instead of trying to overhaul the whole week at once.",
      ),
    );
  }

  const baselineScreen = averageMetric(firstWeek, "screenTime");
  const recentScreen = averageMetric(recentWeek, "screenTime");
  const baselineStress = averageMetric(firstWeek, "stressLevel");
  const recentStress = averageMetric(recentWeek, "stressLevel");
  const baselineMood = averageMetric(firstWeek, "moodScore");
  const recentMood = averageMetric(recentWeek, "moodScore");
  if (
    baselineScreen > 0 &&
    ((recentScreen - baselineScreen) / baselineScreen) * 100 >= 15 &&
    recentStress - baselineStress >= 0.7 &&
    baselineMood - recentMood >= 0.5
  ) {
    insights.push(
      buildInsight(
        "hidden_screen_spiral",
        "Hidden Pattern",
        "Screen-time stress spiral is emerging",
        "Higher screen time is landing at the same time as higher stress and softer mood scores, which often points to a feedback loop rather than a single bad day.",
        0.82,
        "high",
        [
          `Screen time change: ${formatPercent(((recentScreen - baselineScreen) / baselineScreen) * 100)}`,
          `Stress change: ${formatPercent(((recentStress - baselineStress) / Math.max(baselineStress, 1)) * 100)}`,
          `Mood shift: ${formatPercent(((recentMood - baselineMood) / Math.max(baselineMood, 1)) * 100)}`,
        ],
        "Try reducing screen exposure in the final hour before sleep or after peak stress windows; that is where this loop often breaks first.",
      ),
    );
  }

  const baselineSocial = averageMetric(firstWeek, "socialInteraction");
  const recentSocial = averageMetric(recentWeek, "socialInteraction");
  if (
    baselineSocial > 0 &&
    ((baselineSocial - recentSocial) / baselineSocial) * 100 >= 18 &&
    baselineMood - recentMood >= 0.5
  ) {
    insights.push(
      buildInsight(
        "hidden_social_withdrawal",
        "Hidden Pattern",
        "Low-contact days are clustering",
        "Social interaction has pulled back from your personal norm at the same time your mood softened, which can indicate quiet withdrawal rather than simple busyness.",
        0.79,
        "medium",
        [
          `Social baseline: ${baselineSocial.toFixed(1)}/10`,
          `Recent social average: ${recentSocial.toFixed(1)}/10`,
          `Mood also eased from ${baselineMood.toFixed(1)} to ${recentMood.toFixed(1)}`,
        ],
        "Look for one lightweight connection point this week: a short call, a walk, or a low-pressure check-in often works better than waiting for energy to appear first.",
      ),
    );
  }

  return insights.slice(0, 4);
}

export function buildPatternStory(
  data: BehavioralDataPoint[],
  insights: PatternInsight[],
) {
  if (data.length < 5) {
    return {
      headline: "Your pattern story is still forming",
      summary:
        "A few more daily entries will make the story mode more specific and more reliable.",
      narrative: [
        "Right now the system only has a short signal window, so it can describe direction but not a dependable rhythm yet.",
        "Once you build a fuller week of check-ins, this story will explain how your strongest changes connect to each other.",
      ],
      takeaways: [
        "Keep capturing daily check-ins for at least one full week.",
        "Try to log sleep, mood, stress, and screen time consistently.",
      ],
      confidence: 0.45,
    } satisfies PatternStory;
  }

  const baselineMetrics = buildPersonalBaseline(data);
  const leadingShift = baselineMetrics[0];
  const companionShift = baselineMetrics.find(
    (metric) =>
      metric.key !== leadingShift?.key &&
      metric.priority === leadingShift?.priority,
  );
  const hiddenPattern = insights.find((insight) => insight.category === "Hidden Pattern");
  const concernCount = baselineMetrics.filter((metric) => metric.priority === "watch").length;
  const supportiveCount = baselineMetrics.filter(
    (metric) => metric.priority === "supportive",
  ).length;

  const tone =
    concernCount > supportiveCount
      ? "A subtle strain is building in your current routine."
      : supportiveCount > concernCount
        ? "Your recent behavior suggests a stabilizing pattern."
        : "Your pattern looks mixed, with both recovery and strain signals present.";

  return {
    headline:
      leadingShift.priority === "watch"
        ? `${leadingShift.label} is drifting away from your normal baseline`
        : leadingShift.priority === "supportive"
          ? `${leadingShift.label} is becoming a recovery anchor`
          : "Your baseline is holding steady across most signals",
    summary: tone,
    narrative: [
      `${tone} Across ${data.length} tracked days, the clearest shift is in ${leadingShift.label.toLowerCase()}, which is now ${Math.abs(leadingShift.deviationPct).toFixed(1)}% ${
        leadingShift.priority === "watch" ? "below" : "above"
      } your usual pattern.`,
      companionShift
        ? `${companionShift.label} is moving in the same general direction, which suggests this is part of a wider lifestyle pattern rather than a one-off fluctuation.`
        : "Most of the remaining signals are closer to your normal range, which suggests the pattern is still focused rather than system-wide.",
      hiddenPattern
        ? `${hiddenPattern.title} adds another layer to the story: ${hiddenPattern.description}`
        : "No major hidden routine split is dominating yet, so the strongest story is still coming from your baseline shifts.",
    ],
    takeaways: [
      `${leadingShift.statusLabel} for ${leadingShift.label.toLowerCase()}.`,
      companionShift
        ? `${companionShift.label} is reinforcing the same direction of change.`
        : "Your secondary signals are comparatively stable.",
      insights[0]
        ? `Highest-priority insight: ${insights[0].title}.`
        : "The dashboard will surface more detailed insights as your data window grows.",
    ],
    confidence: Math.min(0.95, Math.max(0.55, 0.55 + data.length / 60)),
  } satisfies PatternStory;
}
