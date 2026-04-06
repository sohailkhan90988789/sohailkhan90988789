import { FormEvent, useState } from "react";
import { Clock3, RefreshCw, Waves } from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { BehavioralDataPoint } from "@/app/data/mockData";
import { BehavioralDataSubmission } from "@/app/services/api";

interface LiveCheckInPanelProps {
  userName: string;
  totalEntries: number;
  latestEntry?: BehavioralDataPoint;
  lastSyncedAt?: string | null;
  isSubmitting: boolean;
  isRefreshing: boolean;
  isLocalOnlyMode: boolean;
  localDraftCount: number;
  onSubmit: (
    payload: Omit<BehavioralDataSubmission, "userId">,
  ) => Promise<void>;
}

interface FormState {
  date: string;
  sleepHours: string;
  sleepQuality: string;
  physicalActivity: string;
  socialInteraction: string;
  screenTime: string;
  moodScore: string;
  stressLevel: string;
  productivityScore: string;
}

const fieldGroups = [
  {
    key: "sleepHours",
    label: "Sleep Hours",
    description: "0-24 hours",
    min: 0,
    max: 24,
    step: 0.1,
  },
  {
    key: "sleepQuality",
    label: "Sleep Quality",
    description: "0-10 score",
    min: 0,
    max: 10,
    step: 0.1,
  },
  {
    key: "physicalActivity",
    label: "Physical Activity",
    description: "0-10 score",
    min: 0,
    max: 10,
    step: 0.1,
  },
  {
    key: "socialInteraction",
    label: "Social Interaction",
    description: "0-10 score",
    min: 0,
    max: 10,
    step: 0.1,
  },
  {
    key: "screenTime",
    label: "Screen Time",
    description: "0-24 hours",
    min: 0,
    max: 24,
    step: 0.1,
  },
  {
    key: "moodScore",
    label: "Mood Score",
    description: "0-10 score",
    min: 0,
    max: 10,
    step: 0.1,
  },
  {
    key: "stressLevel",
    label: "Stress Level",
    description: "0-10 score",
    min: 0,
    max: 10,
    step: 0.1,
  },
  {
    key: "productivityScore",
    label: "Productivity",
    description: "0-10 score",
    min: 0,
    max: 10,
    step: 0.1,
  },
] as const;

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function buildInitialState(): FormState {
  return {
    date: getTodayDate(),
    sleepHours: "7.5",
    sleepQuality: "7",
    physicalActivity: "6",
    socialInteraction: "6",
    screenTime: "4",
    moodScore: "7",
    stressLevel: "4",
    productivityScore: "7",
  };
}

function formatSyncTime(lastSyncedAt?: string | null) {
  if (!lastSyncedAt) {
    return "Waiting for first refresh";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  }).format(new Date(lastSyncedAt));
}

export function LiveCheckInPanel({
  userName,
  totalEntries,
  latestEntry,
  lastSyncedAt,
  isSubmitting,
  isRefreshing,
  isLocalOnlyMode,
  localDraftCount,
  onSubmit,
}: LiveCheckInPanelProps) {
  const [formState, setFormState] = useState<FormState>(() => buildInitialState());

  const handleInputChange = (key: keyof FormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const applyLatestSnapshot = () => {
    if (!latestEntry) {
      return;
    }

    setFormState({
      date: getTodayDate(),
      sleepHours: latestEntry.sleepHours?.toString() ?? "7.5",
      sleepQuality: latestEntry.sleepQuality.toString(),
      physicalActivity: latestEntry.physicalActivity.toString(),
      socialInteraction: latestEntry.socialInteraction.toString(),
      screenTime: latestEntry.screenTime?.toString() ?? "4",
      moodScore: latestEntry.moodScore.toString(),
      stressLevel: latestEntry.stressLevel.toString(),
      productivityScore: latestEntry.productivityScore.toString(),
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      date: formState.date,
      sleepHours: Number(formState.sleepHours),
      sleepQuality: Number(formState.sleepQuality),
      physicalActivity: Number(formState.physicalActivity),
      socialInteraction: Number(formState.socialInteraction),
      screenTime: Number(formState.screenTime),
      moodScore: Number(formState.moodScore),
      stressLevel: Number(formState.stressLevel),
      productivityScore: Number(formState.productivityScore),
    });
  };

  return (
    <Card className="rounded-[28px] border-white/70 bg-white/84 p-6 shadow-[0_24px_60px_-38px_rgba(16,61,68,0.48)]">
      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-[#103d44] px-3 py-1 text-[#f8efe2]">
              Live check-in
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full border-[#d7c6ae] bg-[#fcf5eb] px-3 py-1 text-[#8d5225]"
            >
              {totalEntries} stored entries
            </Badge>
            {isLocalOnlyMode && (
              <Badge className="rounded-full bg-[#8c5427] px-3 py-1 text-[#fff7ee]">
                {localDraftCount} device-only drafts
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl text-[#162530]">
              Capture real-time signals for {userName.split(" ")[0]}
            </h2>
            <p className="text-sm leading-7 text-slate-700">
              This is the fastest real-time source for the current project:
              enter today&apos;s behavioral signals, submit them to the backend,
              and the dashboard refreshes with the latest analysis.
            </p>
          </div>

          <div className="space-y-3 rounded-[24px] border border-[#d6ebe5] bg-[#eef7f5] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-[#103d44]">
              <Clock3 className="h-4 w-4" />
              Refresh status
            </div>
            <p className="text-sm text-slate-700">
              Last sync: <span className="font-medium">{formatSyncTime(lastSyncedAt)}</span>
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-[#2a6a5f]">
              {isLocalOnlyMode
                ? "Device-only mode is active"
                : isRefreshing
                  ? "Refreshing live analytics"
                  : "Dashboard ready"}
            </p>
          </div>

          <div className="rounded-[24px] border border-[#eadfce] bg-[#fcf6ee] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-[#5e3b1c]">
              <Waves className="h-4 w-4" />
              Recommended data strategy
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Manual check-ins work immediately. Later, this same API can be fed
              by Health Connect, HealthKit, Fitbit, or Oura sync jobs.
            </p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="checkin-date">Date</Label>
              <Input
                id="checkin-date"
                type="date"
                value={formState.date}
                onChange={(event) => handleInputChange("date", event.target.value)}
                required
                className="h-11 rounded-2xl border-[#dccab3] bg-white"
              />
            </div>

            {fieldGroups.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={`checkin-${field.key}`}>{field.label}</Label>
                <Input
                  id={`checkin-${field.key}`}
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={formState[field.key]}
                  onChange={(event) =>
                    handleInputChange(field.key, event.target.value)
                  }
                  required
                  className="h-11 rounded-2xl border-[#dccab3] bg-white"
                />
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#8c5427]">
                  {field.description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-[#103d44] px-5 text-[#f8efe2] hover:bg-[#0c3137]"
            >
              {isSubmitting
                ? "Saving live entry..."
                : isLocalOnlyMode
                  ? "Save to device-only cache"
                  : "Save live entry"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={applyLatestSnapshot}
              disabled={!latestEntry || isSubmitting}
              className="rounded-full border-[#d7c6ae] bg-[#fcf5eb] text-[#8d5225]"
            >
              Use latest values
            </Button>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isLocalOnlyMode
                ? "stored locally without backend sync"
                : "backend + dashboard refresh after submit"}
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
}
