import { Info } from "lucide-react";

import { Card } from "@/app/components/ui/card";
import { BehavioralDataPoint } from "@/app/data/mockData";

interface CorrelationMatrixProps {
  data: BehavioralDataPoint[];
}

const dimensions = [
  { key: "sleepQuality", label: "Sleep" },
  { key: "moodScore", label: "Mood" },
  { key: "stressLevel", label: "Stress" },
  { key: "socialInteraction", label: "Social" },
  { key: "physicalActivity", label: "Activity" },
  { key: "productivityScore", label: "Productivity" },
] as const;

export function CorrelationMatrix({ data }: CorrelationMatrixProps) {
  if (data.length < 2) {
    return (
      <Card className="rounded-[28px] border-white/70 bg-white/82 p-6 shadow-[0_24px_60px_-38px_rgba(16,61,68,0.48)]">
        <div className="space-y-3">
          <h3 className="text-2xl text-[#162530]">Correlation Analysis</h3>
          <p className="text-sm leading-6 text-slate-600">
            Correlation analysis needs at least two stored entries. Add a few
            more live check-ins to reveal how sleep, mood, stress, and activity
            move together.
          </p>
        </div>
      </Card>
    );
  }

  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
    );

    return denominator === 0 ? 0 : numerator / denominator;
  };

  const correlations: Record<string, Record<string, number>> = {};

  dimensions.forEach((dim1) => {
    correlations[dim1.key] = {};
    dimensions.forEach((dim2) => {
      if (dim1.key === dim2.key) {
        correlations[dim1.key][dim2.key] = 1;
      } else {
        const values1 = data.map((entry) => entry[dim1.key]);
        const values2 = data.map((entry) => entry[dim2.key]);
        correlations[dim1.key][dim2.key] = calculateCorrelation(
          values1,
          values2,
        );
      }
    });
  });

  const getCorrelationColor = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue > 0.7) return value > 0 ? "#10b981" : "#ef4444";
    if (absValue > 0.5) return value > 0 ? "#34d399" : "#f87171";
    if (absValue > 0.3) return value > 0 ? "#86efac" : "#fca5a5";
    return "#e5e7eb";
  };

  const getCorrelationStrength = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue > 0.7) return "Strong";
    if (absValue > 0.5) return "Moderate";
    if (absValue > 0.3) return "Weak";
    return "Negligible";
  };

  return (
    <Card className="rounded-[28px] border-white/70 bg-white/82 p-6 shadow-[0_24px_60px_-38px_rgba(16,61,68,0.48)]">
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-2xl text-[#162530]">Correlation Analysis</h3>
          <p className="text-sm text-slate-600">
            Pearson correlation coefficients showing relationships between
            behavioral dimensions. Strong correlations may indicate
            interconnected patterns.
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-r border-[#eadfce] bg-[#fbf6ef] p-2 text-left text-xs font-semibold" />
                  {dimensions.map((dim) => (
                    <th
                      key={dim.key}
                      className="border-b border-[#eadfce] bg-[#fbf6ef] p-2 text-center text-xs font-semibold"
                    >
                      {dim.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dimensions.map((dim1) => (
                  <tr key={dim1.key}>
                    <td className="border-r border-[#eadfce] bg-[#fbf6ef] p-2 text-xs font-semibold">
                      {dim1.label}
                    </td>
                    {dimensions.map((dim2) => {
                      const correlation = correlations[dim1.key][dim2.key];
                      const isDiagonal = dim1.key === dim2.key;

                      return (
                        <td
                          key={dim2.key}
                          className="group relative border border-white/55 p-1 text-center"
                          style={{
                            backgroundColor: getCorrelationColor(correlation),
                          }}
                        >
                          <div className="relative">
                            <div
                              className={`text-xs font-semibold ${
                                isDiagonal
                                  ? "text-slate-700"
                                  : Math.abs(correlation) > 0.5
                                    ? "text-white"
                                    : "text-slate-700"
                              }`}
                            >
                              {correlation.toFixed(2)}
                            </div>

                            {!isDiagonal && (
                              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform opacity-0 transition-opacity group-hover:opacity-100 z-10">
                                <div className="whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-white">
                                  <div className="font-semibold">
                                    {dim1.label} {"<->"} {dim2.label}
                                  </div>
                                  <div className="mt-1">
                                    Correlation: {(correlation * 100).toFixed(0)}%
                                  </div>
                                  <div>
                                    Strength: {getCorrelationStrength(correlation)}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3 border-t border-[#eadfce] pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-[#162530]">
            <Info className="h-4 w-4" />
            Interpretation Guide
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "#10b981" }} />
              <span>Strong Positive (0.7+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "#34d399" }} />
              <span>Moderate Positive (0.5-0.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "#f87171" }} />
              <span>Moderate Negative (-0.5 to -0.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "#ef4444" }} />
              <span>Strong Negative (-0.7+)</span>
            </div>
          </div>

          <p className="rounded-2xl bg-[#fbf6ef] p-3 text-xs text-slate-600">
            <strong>Note:</strong> Positive correlations (green) indicate
            metrics that move together. Negative correlations (red) indicate
            inverse relationships, such as stress decreasing as sleep improves.
            Strong correlations do not imply causation but suggest meaningful
            patterns worth exploring.
          </p>
        </div>
      </div>
    </Card>
  );
}
