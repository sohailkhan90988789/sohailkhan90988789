import { BookOpenText, Sparkles } from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import { BehavioralDataPoint, PatternInsight } from "@/app/data/mockData";
import { buildPatternStory } from "@/app/lib/behavioral-insights";

interface PatternStoryPanelProps {
  data: BehavioralDataPoint[];
  insights: PatternInsight[];
}

export function PatternStoryPanel({
  data,
  insights,
}: PatternStoryPanelProps) {
  const story = buildPatternStory(data, insights);

  return (
    <Card className="rounded-[28px] border-white/70 bg-gradient-to-br from-white/88 to-[#f7f1e7] p-6 shadow-[0_24px_60px_-38px_rgba(16,61,68,0.48)]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge className="w-fit rounded-full bg-[#8c5427] px-3 py-1 text-[#fff7ee]">
              Pattern story mode
            </Badge>
            <div className="flex items-center gap-3">
              <BookOpenText className="h-6 w-6 text-[#8c5427]" />
              <h2 className="text-3xl text-[#162530]">{story.headline}</h2>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-slate-700">
              {story.summary}
            </p>
          </div>

          <div className="rounded-[24px] border border-[#eadfce] bg-white/80 px-4 py-3 text-sm text-slate-700">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8c5427]">
              Story confidence
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#162530]">
              {(story.confidence * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3 rounded-[24px] border border-[#eadfce] bg-white/80 p-5">
            {story.narrative.map((paragraph, index) => (
              <p key={index} className="text-sm leading-7 text-slate-700">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="space-y-3 rounded-[24px] border border-[#d7e9e3] bg-[#eef7f5] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#103d44]">
              <Sparkles className="h-4 w-4" />
              Key takeaways
            </div>
            <div className="space-y-2">
              {story.takeaways.map((takeaway, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-white/80 px-4 py-3 text-sm leading-6 text-slate-700"
                >
                  {takeaway}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
