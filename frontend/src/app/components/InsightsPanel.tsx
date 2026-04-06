import { useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
} from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { PatternInsight } from "@/app/data/mockData";

interface InsightsPanelProps {
  insights: PatternInsight[];
  message?: string | null;
}

export function InsightsPanel({ insights, message }: InsightsPanelProps) {
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (insights.length === 0) {
      setExpandedInsights(new Set());
      return;
    }

    setExpandedInsights(new Set([insights[0].id]));
  }, [insights]);

  const toggleInsight = (id: string) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedInsights(newExpanded);
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-rose-500" />;
      case "medium":
        return <Info className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-sky-500" />;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="mb-2 text-3xl text-[#162530]">Explainable Insights</h2>
          <p className="text-slate-600">
            AI-detected patterns with transparent reasoning and actionable
            recommendations
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {insights.length} Active Patterns
        </Badge>
      </div>

      <div className="space-y-4">
        {insights.length === 0 && (
          <Card className="rounded-[24px] border-[#d9e8e4] bg-gradient-to-r from-[#eef7f5] to-[#fcf6ee] p-5">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[#162530]">
                No explainable insights yet
              </h3>
              <p className="text-sm leading-6 text-slate-700">
                {message ||
                  "Keep submitting daily check-ins. Once enough live data is available, this panel will surface trends, anomalies, and correlations automatically."}
              </p>
            </div>
          </Card>
        )}

        {insights.map((insight) => {
          const isExpanded = expandedInsights.has(insight.id);

          return (
            <Card
              key={insight.id}
              className="overflow-hidden rounded-[24px] border-white/70 bg-white/82 shadow-[0_20px_55px_-38px_rgba(16,61,68,0.48)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-1 items-start gap-3">
                    <div className="mt-1">{getImportanceIcon(insight.importance)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-[#162530]">
                          {insight.title}
                        </h3>
                        <Badge
                          variant={getImportanceColor(insight.importance) as any}
                          className="text-xs"
                        >
                          {insight.importance}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleInsight(insight.id)}
                    className="shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">
                      Detection Confidence
                    </span>
                    <span className="font-semibold">
                      {(insight.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={insight.confidence * 100} className="h-2" />
                  <p className="text-xs text-slate-500">
                    Based on statistical analysis of behavioral patterns and
                    correlation strength
                  </p>
                </div>

                {isExpanded && (
                  <div className="space-y-4 border-t border-[#eadfce] pt-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Info className="h-4 w-4" />
                        Contributing Factors
                      </div>
                      <div className="space-y-1.5 rounded-2xl bg-[#fbf6ef] p-3">
                        {insight.factors.map((factor, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b67a49]" />
                            <span className="text-slate-700">{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Lightbulb className="h-4 w-4" />
                        Evidence-Based Recommendation
                      </div>
                      <div className="rounded-2xl border border-[#cfe2df] bg-[#eef7f5] p-3">
                        <p className="text-sm text-slate-800">
                          {insight.recommendation}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#eadfce] bg-[#fcf6ee] p-3">
                      <p className="text-xs text-[#5e3b1c]">
                        <strong>Transparency Note:</strong> This insight is
                        generated using correlation analysis and pattern
                        detection algorithms. It represents an observation, not
                        a diagnosis. All factors contributing to this insight
                        are shown above for full transparency.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-[24px] border-[#d9e8e4] bg-gradient-to-r from-[#eef7f5] to-[#fcf6ee] p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#103d44]" />
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-[#162530]">
              About These Insights
            </h4>
            <p className="text-xs text-slate-700">
              These patterns are detected through analysis of your behavioral
              data using machine learning algorithms. They are meant to increase
              self-awareness, not to diagnose conditions. For any health
              concerns, please consult qualified healthcare professionals.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
