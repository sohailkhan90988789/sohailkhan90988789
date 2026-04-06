import { useEffect, useState } from "react";
import { FlaskConical, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { BehavioralDataPoint } from "@/app/data/mockData";
import {
  buildScenarioDefaults,
  ScenarioInputs,
  simulateScenario,
} from "@/app/lib/behavioral-simulation";

interface WhatIfSimulatorProps {
  data: BehavioralDataPoint[];
}

const simulatorFields = [
  { key: "sleepHours", label: "Sleep Hours", min: 4, max: 10, step: 0.1 },
  {
    key: "physicalActivity",
    label: "Physical Activity",
    min: 0,
    max: 10,
    step: 0.1,
  },
  {
    key: "socialInteraction",
    label: "Social Interaction",
    min: 0,
    max: 10,
    step: 0.1,
  },
  { key: "screenTime", label: "Screen Time", min: 0, max: 12, step: 0.1 },
] as const;

function getDeltaTone(delta: number, favorableDirection: "increase" | "decrease") {
  const isPositive =
    favorableDirection === "increase" ? delta >= 0 : delta <= 0;

  return isPositive ? "text-emerald-600" : "text-rose-600";
}

export function WhatIfSimulator({ data }: WhatIfSimulatorProps) {
  const [scenario, setScenario] = useState<ScenarioInputs>(() =>
    buildScenarioDefaults(data),
  );

  useEffect(() => {
    setScenario(buildScenarioDefaults(data));
  }, [data]);

  const projection = simulateScenario(data, scenario);

  if (data.length < 5) {
    return (
      <Card className="rounded-[28px] border-white/70 bg-white/84 p-6 shadow-[0_24px_60px_-38px_rgba(16,61,68,0.48)]">
        <div className="space-y-3">
          <Badge className="w-fit rounded-full bg-[#103d44] px-3 py-1 text-[#f8efe2]">
            What-if simulator
          </Badge>
          <h2 className="text-3xl text-[#162530]">Try scenarios once the signal window is stronger</h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-700">
            The simulator gets more useful after a few more check-ins because
            it uses your recent behavior as the starting point for predictions.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge className="w-fit rounded-full bg-[#103d44] px-3 py-1 text-[#f8efe2]">
            What-if simulator
          </Badge>
          <h2 className="text-3xl text-[#162530]">Test small lifestyle shifts before you try them</h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-700">
            Move the sliders to simulate a different recovery pattern. The
            system projects how mood, stress, and productivity could respond
            relative to your recent 7-day average.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="rounded-full border-[#d7c6ae] bg-[#fcf5eb] text-[#8d5225]"
          onClick={() => setScenario(buildScenarioDefaults(data))}
        >
          Reset to current pattern
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[28px] border-white/70 bg-white/82 p-5 shadow-[0_18px_50px_-34px_rgba(16,61,68,0.45)]">
          <div className="space-y-4">
            {simulatorFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#162530]">{field.label}</span>
                  <span className="font-semibold text-[#8c5427]">
                    {scenario[field.key].toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={scenario[field.key]}
                  onChange={(event) =>
                    setScenario((current) => ({
                      ...current,
                      [field.key]: Number(event.target.value),
                    }))
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#eadfce]"
                />
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-[28px] border-white/70 bg-gradient-to-br from-white/84 to-[#eef7f5] p-5 shadow-[0_18px_50px_-34px_rgba(16,61,68,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#103d44]">
                  <FlaskConical className="h-4 w-4" />
                  Simulated outcome
                </div>
                <p className="mt-2 text-2xl font-semibold text-[#162530]">
                  {projection.summary}
                </p>
              </div>
              <Badge variant="outline" className="rounded-full text-xs">
                {(projection.confidence * 100).toFixed(0)}% confidence
              </Badge>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {Object.values(projection.metrics).map((metric) => {
              const tone = getDeltaTone(metric.delta, metric.favorableDirection);
              const TrendIcon =
                metric.delta >= 0 ? TrendingUp : TrendingDown;

              return (
                <Card
                  key={metric.label}
                  className="rounded-[24px] border-white/70 bg-white/82 p-4 shadow-[0_18px_50px_-34px_rgba(16,61,68,0.45)]"
                >
                  <p className="text-sm font-medium text-slate-600">{metric.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-[#162530]">
                    {metric.projected.toFixed(1)}
                    <span className="ml-1 text-sm text-slate-500">/10</span>
                  </p>
                  <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${tone}`}>
                    <TrendIcon className="h-4 w-4" />
                    {metric.delta > 0 ? "+" : ""}
                    {metric.delta.toFixed(1)} vs current
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Current baseline: {metric.current.toFixed(1)}
                  </p>
                </Card>
              );
            })}
          </div>

          <Card className="rounded-[24px] border-[#eadfce] bg-[#fcf6ee] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#8c5427]">
              <Sparkles className="h-4 w-4" />
              Why the model thinks this
            </div>
            <div className="mt-3 space-y-2">
              {projection.explanation.map((line, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-white/70 px-4 py-3 text-sm leading-6 text-slate-700"
                >
                  {line}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
