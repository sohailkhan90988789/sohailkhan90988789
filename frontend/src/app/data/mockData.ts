// Mock behavioral data for demonstration purposes
// In production, this would come from ethical data collection with user consent

export interface BehavioralDataPoint {
  date: string;
  sleepHours?: number;
  sleepQuality: number;
  physicalActivity: number;
  socialInteraction: number;
  screenTime?: number;
  moodScore: number;
  stressLevel: number;
  productivityScore: number;
}

export interface PatternInsight {
  id: string;
  category: string;
  title: string;
  description: string;
  confidence: number;
  importance: "high" | "medium" | "low";
  factors: string[];
  recommendation: string;
}

// Generate last 30 days of behavioral data
export const generateMockData = (): BehavioralDataPoint[] => {
  const data: BehavioralDataPoint[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Simulate gradual decline in some metrics to show pattern detection
    const declineFactorSleep = i < 15 ? 1 - (15 - i) * 0.03 : 1;
    const declineFactorMood = i < 15 ? 1 - (15 - i) * 0.04 : 1;
    const increaseFactorStress = i < 15 ? 1 + (15 - i) * 0.04 : 1;

    data.push({
      date: date.toISOString().split("T")[0],
      sleepHours: Math.max(4, 7 + (Math.random() - 0.5) * 2 * declineFactorSleep),
      sleepQuality: Math.max(3, 7 + (Math.random() - 0.5) * 2 * declineFactorSleep),
      physicalActivity: Math.max(1, 6 + (Math.random() - 0.5) * 3),
      socialInteraction: Math.max(2, 7 + (Math.random() - 0.5) * 3 * declineFactorMood),
      screenTime: Math.min(12, 5 + (Math.random() - 0.5) * 3 * increaseFactorStress),
      moodScore: Math.max(3, 7 + (Math.random() - 0.5) * 2 * declineFactorMood),
      stressLevel: Math.min(9, 4 + (Math.random() - 0.5) * 2 * increaseFactorStress),
      productivityScore: Math.max(3, 7 + (Math.random() - 0.5) * 2 * declineFactorMood),
    });
  }

  return data;
};

export const mockInsights: PatternInsight[] = [
  {
    id: "1",
    category: "Sleep Pattern",
    title: "Declining Sleep Quality Detected",
    description:
      "Your sleep quality has decreased by 18% over the past 2 weeks. This pattern correlates with increased stress levels and reduced mood scores.",
    confidence: 0.87,
    importance: "high",
    factors: [
      "Sleep hours: -1.2h average",
      "Sleep quality: -18%",
      "Correlation with stress: +0.76",
    ],
    recommendation:
      "Consider establishing a consistent bedtime routine. Research shows that regular sleep schedules can improve both sleep quality and mood stability.",
  },
  {
    id: "2",
    category: "Social Engagement",
    title: "Reduced Social Interaction",
    description:
      "Social interaction levels have declined by 23% compared to your baseline. This change coincides with mood variations.",
    confidence: 0.82,
    importance: "high",
    factors: [
      "Social interaction: -23%",
      "Correlation with mood: +0.68",
      "Pattern duration: 12 days",
    ],
    recommendation:
      "Social connections are vital for mental well-being. Consider scheduling regular check-ins with friends or family, even if brief.",
  },
  {
    id: "3",
    category: "Stress & Activity",
    title: "Stress-Activity Imbalance",
    description:
      "Elevated stress levels (+32%) paired with decreased physical activity (-15%) suggests an emerging pattern that may benefit from attention.",
    confidence: 0.79,
    importance: "medium",
    factors: [
      "Stress level: +32%",
      "Physical activity: -15%",
      "Screen time: +28%",
    ],
    recommendation:
      "Physical activity is a proven stress buffer. Even 15-20 minutes of walking daily can significantly impact stress management.",
  },
  {
    id: "4",
    category: "Digital Behavior",
    title: "Increased Screen Time Trend",
    description:
      "Screen time has increased by 28% in the past two weeks, correlating with reduced sleep quality and productivity.",
    confidence: 0.75,
    importance: "medium",
    factors: [
      "Screen time: +28%",
      "Evening screen use: +42%",
      "Sleep onset delay: +35min",
    ],
    recommendation:
      "Consider implementing a digital sunset routine, reducing screen exposure 1-2 hours before bedtime.",
  },
  {
    id: "5",
    category: "Overall Trend",
    title: "Multi-Factor Pattern Change",
    description:
      "Multiple behavioral indicators show coordinated changes over 14 days, suggesting an emerging pattern worth monitoring.",
    confidence: 0.84,
    importance: "high",
    factors: [
      "Affected dimensions: 6/8",
      "Pattern consistency: High",
      "Timeline: 14 days",
    ],
    recommendation:
      "Consider consulting with a mental health professional to discuss these patterns. Early awareness enables proactive well-being management.",
  },
];

export const dimensionMetrics = [
  {
    name: "Sleep Quality",
    current: 5.8,
    baseline: 7.2,
    change: -19.4,
    icon: "moon",
    color: "#8b5cf6",
  },
  {
    name: "Social Connection",
    current: 5.4,
    baseline: 7.0,
    change: -22.9,
    icon: "users",
    color: "#ec4899",
  },
  {
    name: "Physical Activity",
    current: 5.9,
    baseline: 6.8,
    change: -13.2,
    icon: "activity",
    color: "#10b981",
  },
  {
    name: "Mood Stability",
    current: 6.1,
    baseline: 7.3,
    change: -16.4,
    icon: "smile",
    color: "#f59e0b",
  },
  {
    name: "Stress Level",
    current: 6.8,
    baseline: 4.2,
    change: +61.9,
    icon: "brain",
    color: "#ef4444",
    inverted: true,
  },
  {
    name: "Productivity",
    current: 6.2,
    baseline: 7.1,
    change: -12.7,
    icon: "target",
    color: "#3b82f6",
  },
];

export const privacyMetrics = {
  dataEncrypted: true,
  localProcessing: true,
  noThirdPartySharing: true,
  userControlled: true,
  anonymized: true,
  gdprCompliant: true,
  lastAudit: "2026-01-15",
  dataRetention: "90 days",
};
