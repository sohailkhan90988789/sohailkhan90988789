import {
  Activity,
  Brain,
  CalendarRange,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { Header } from "@/app/components/Header";
import { CorrelationMatrix } from "@/app/components/CorrelationMatrix";
import { DashboardOverview } from "@/app/components/DashboardOverview";
import { InterventionTracker } from "@/app/components/InterventionTracker";
import { InsightsPanel } from "@/app/components/InsightsPanel";
import { LiveCheckInPanel } from "@/app/components/LiveCheckInPanel";
import { PatternStoryPanel } from "@/app/components/PatternStoryPanel";
import { PersonalBaselinePanel } from "@/app/components/PersonalBaselinePanel";
import { PrivacyPanel } from "@/app/components/PrivacyPanel";
import { TimelineChart } from "@/app/components/TimelineChart";
import { WeeklyComparison } from "@/app/components/WeeklyComparison";
import { WhatIfSimulator } from "@/app/components/WhatIfSimulator";
import type { AppNotice } from "@/app/components/AuthScreen";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  BehavioralDataPoint,
  PatternInsight,
} from "@/app/data/mockData";
import { AuthUser, BehavioralDataSubmission } from "@/app/services/api";
import { InterventionPlan } from "@/app/lib/intervention-tracking";

interface DashboardShellProps {
  user: AuthUser;
  data: BehavioralDataPoint[];
  insights: PatternInsight[];
  insightMessage?: string | null;
  interventions: InterventionPlan[];
  activeTab: string;
  onTabChange: (value: string) => void;
  onPrivacyClick: () => void;
  onLogout: () => Promise<void> | void;
  onSubmitCheckIn: (
    payload: Omit<BehavioralDataSubmission, "userId">,
  ) => Promise<void>;
  onAddIntervention: (
    intervention: Omit<InterventionPlan, "id">,
  ) => Promise<void> | void;
  onRemoveIntervention: (id: string) => Promise<void> | void;
  localDraftCount: number;
  localOnlyMode: boolean;
  retentionDays: number;
  syncedRecordCount: number;
  onToggleLocalOnlyMode: (enabled: boolean) => void;
  onExportLocalCache: () => Promise<void> | void;
  onClearLocalCache: () => Promise<void> | void;
  onExportServerData: () => Promise<void> | void;
  onDeleteServerData: () => Promise<void> | void;
  isSigningOut: boolean;
  isSubmittingCheckIn: boolean;
  isRefreshingDashboard: boolean;
  isProcessingPrivacyAction: boolean;
  lastSyncedAt?: string | null;
  apiStatus: "checking" | "online" | "offline";
  notice: AppNotice | null;
  onClearNotice: () => void;
}

function averageByKey(
  data: BehavioralDataPoint[],
  key: keyof BehavioralDataPoint,
) {
  const values = data
    .map((entry) => entry[key])
    .filter((value) => typeof value === "number") as number[];

  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function DashboardShell({
  user,
  data,
  insights,
  insightMessage,
  interventions,
  activeTab,
  onTabChange,
  onPrivacyClick,
  onLogout,
  onSubmitCheckIn,
  onAddIntervention,
  onRemoveIntervention,
  localDraftCount,
  localOnlyMode,
  retentionDays,
  syncedRecordCount,
  onToggleLocalOnlyMode,
  onExportLocalCache,
  onClearLocalCache,
  onExportServerData,
  onDeleteServerData,
  isSigningOut,
  isSubmittingCheckIn,
  isRefreshingDashboard,
  isProcessingPrivacyAction,
  lastSyncedAt,
  apiStatus,
  notice,
  onClearNotice,
}: DashboardShellProps) {
  const latestEntry = data[data.length - 1];
  const lastWeek = data.slice(-7);
  const firstWeek = data.slice(0, 7);

  const moodShift =
    averageByKey(lastWeek, "moodScore") - averageByKey(firstWeek, "moodScore");
  const stressShift =
    averageByKey(lastWeek, "stressLevel") -
    averageByKey(firstWeek, "stressLevel");
  const averageSleep = averageByKey(lastWeek, "sleepHours");

  const snapshotCards = [
    {
      icon: HeartPulse,
      label: "Current mood",
      value: `${latestEntry?.moodScore.toFixed(1) ?? "0.0"}/10`,
      detail: `${moodShift >= 0 ? "+" : ""}${moodShift.toFixed(1)} vs first week`,
    },
    {
      icon: Activity,
      label: "Sleep rhythm",
      value: `${averageSleep.toFixed(1)} hrs`,
      detail: "Average of the last 7 days",
    },
    {
      icon: Brain,
      label: "Stress watch",
      value: `${latestEntry?.stressLevel.toFixed(1) ?? "0.0"}/10`,
      detail: `${stressShift >= 0 ? "+" : ""}${stressShift.toFixed(1)} vs first week`,
    },
    {
      icon: CalendarRange,
      label: "Tracked window",
      value: `${data.length} days`,
      detail: "Rolling research snapshot",
    },
  ];

  const formattedCreatedDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(user.createdAt));

  const noticeTone =
    notice?.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : notice?.type === "error"
        ? "border-rose-200 bg-rose-50 text-rose-900"
        : "border-sky-200 bg-sky-50 text-sky-900";

  return (
    <div className="relative min-h-screen px-4 pb-10 sm:px-6 lg:px-8">
      <Header
        user={user}
        apiStatus={apiStatus}
        onPrivacyClick={onPrivacyClick}
        onLogout={onLogout}
        isSigningOut={isSigningOut}
      />

      <main className="mx-auto mt-6 max-w-7xl space-y-6">
        {notice && (
          <div
            className={`glass-panel flex items-start justify-between gap-4 rounded-[24px] border px-5 py-4 ${noticeTone}`}
          >
            <div>
              <p className="text-sm font-semibold">{notice.title}</p>
              <p className="mt-1 text-sm leading-6">{notice.description}</p>
              {notice.preview && (
                <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-current/15 bg-white/70 p-3 text-[11px] leading-6 text-slate-700">
                  {notice.preview}
                </pre>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearNotice}
              className="rounded-full text-current hover:bg-white/60"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="glass-panel reveal-up gap-6 rounded-[30px] border-white/70 p-6 shadow-[0_30px_80px_-40px_rgba(16,61,68,0.55)] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl space-y-3">
                <Badge className="rounded-full bg-[#103d44] px-3 py-1 text-[#f7f1e7]">
                  Research workspace
                </Badge>
                <h1 className="text-4xl text-[#162530] sm:text-5xl">
                  Hello, {user.name.split(" ")[0]}.
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-700">
                  Your refreshed dashboard keeps the analytics visible, but wraps
                  them in a cleaner, calmer interface with stronger account and
                  privacy cues.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#e7d8c5] bg-[#fcf6ee] px-5 py-4 text-sm text-slate-700">
                <div className="flex items-center gap-2 font-medium text-[#103d44]">
                  <ShieldCheck className="h-4 w-4" />
                  Account status
                </div>
                <p className="mt-2">{user.email}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#9b6334]">
                  Joined {formattedCreatedDate}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {snapshotCards.map((card, index) => {
                const Icon = card.icon;

                return (
                  <Card
                    key={card.label}
                    className={`reveal-up stagger-${index + 1} gap-3 rounded-[24px] border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_-34px_rgba(16,61,68,0.45)]`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#103d44] text-[#f8efe2]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Sparkles className="h-4 w-4 text-[#bf7d48]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        {card.label}
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-[#162530]">
                        {card.value}
                      </p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#8c5427]">
                      {card.detail}
                    </p>
                  </Card>
                );
              })}
            </div>
          </Card>

          <Card className="glass-panel reveal-up stagger-2 gap-5 rounded-[30px] border-white/70 p-6 shadow-[0_30px_80px_-40px_rgba(16,61,68,0.55)] sm:p-8">
            <div className="space-y-3">
              <Badge
                variant="outline"
                className="rounded-full border-[#d7c6ae] bg-[#fcf5eb] px-3 py-1 text-[#8d5225]"
              >
                Session briefing
              </Badge>
              <h2 className="text-3xl text-[#162530]">Built for clarity</h2>
              <p className="text-sm leading-6 text-slate-700">
                The dashboard now accepts live behavioral entries, refreshes the
                analytics from the backend, and keeps research context visible
                without losing clarity.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-[#e7d8c5] bg-[#fcf6ee] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[#8c5427]">
                  Explainable insights
                </p>
                <p className="mt-2 text-3xl font-semibold text-[#162530]">
                  {insights.length}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Active patterns are ready to review inside the insights tab.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#d6ebe5] bg-[#eff8f5] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[#2a6a5f]">
                  Live capture
                </p>
                <p className="mt-2 text-3xl font-semibold text-[#103d44]">
                  Real-time ready input
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Daily check-ins now post directly to the Flask backend and
                  refresh the latest timeline, insights, and correlation views.
                </p>
              </div>

              {localOnlyMode && (
                <div className="rounded-[24px] border border-[#e7c9a2] bg-[#fff3e4] p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#8c5427]">
                    Device-only mode
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-[#7b4a20]">
                    {localDraftCount} local drafts
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    New entries stay on this device only until you export or clear them.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </section>

        <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
          <TabsList className="glass-panel grid h-auto w-full grid-cols-2 gap-2 rounded-[28px] p-2 lg:grid-cols-8">
            <TabsTrigger value="overview" className="rounded-[20px] py-3 data-[state=active]:bg-[#103d44] data-[state=active]:text-[#f8efe2]">
              Overview
            </TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-[20px] py-3 data-[state=active]:bg-[#103d44] data-[state=active]:text-[#f8efe2]">
              Timeline
            </TabsTrigger>
            <TabsTrigger value="insights" className="rounded-[20px] py-3 data-[state=active]:bg-[#103d44] data-[state=active]:text-[#f8efe2]">
              Insights
            </TabsTrigger>
            <TabsTrigger value="simulator" className="rounded-[20px] py-3 data-[state=active]:bg-[#103d44] data-[state=active]:text-[#f8efe2]">
              Simulator
            </TabsTrigger>
            <TabsTrigger value="correlations" className="rounded-[20px] py-3 data-[state=active]:bg-[#103d44] data-[state=active]:text-[#f8efe2]">
              Correlations
            </TabsTrigger>
            <TabsTrigger value="weekly" className="rounded-[20px] py-3 data-[state=active]:bg-[#103d44] data-[state=active]:text-[#f8efe2]">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="interventions" className="rounded-[20px] py-3 data-[state=active]:bg-[#103d44] data-[state=active]:text-[#f8efe2]">
              Interventions
            </TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-[20px] py-3 data-[state=active]:bg-[#103d44] data-[state=active]:text-[#f8efe2]">
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <LiveCheckInPanel
              userName={user.name}
              totalEntries={data.length}
              latestEntry={latestEntry}
              lastSyncedAt={lastSyncedAt}
              isSubmitting={isSubmittingCheckIn}
              isRefreshing={isRefreshingDashboard}
              isLocalOnlyMode={localOnlyMode}
              localDraftCount={localDraftCount}
              onSubmit={onSubmitCheckIn}
            />
            <PersonalBaselinePanel
              data={data}
              localDraftCount={localDraftCount}
            />
            <DashboardOverview data={data} isRefreshing={isRefreshingDashboard} />
            <PatternStoryPanel data={data} insights={insights} />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineChart data={data} />
          </TabsContent>

          <TabsContent value="insights">
            <InsightsPanel insights={insights} message={insightMessage} />
          </TabsContent>

          <TabsContent value="simulator">
            <WhatIfSimulator data={data} />
          </TabsContent>

          <TabsContent value="correlations">
            <CorrelationMatrix data={data} />
          </TabsContent>

          <TabsContent value="weekly">
            <WeeklyComparison data={data} />
          </TabsContent>

          <TabsContent value="interventions">
            <InterventionTracker
              data={data}
              interventions={interventions}
              onAddIntervention={onAddIntervention}
              onRemoveIntervention={onRemoveIntervention}
            />
          </TabsContent>

          <TabsContent value="privacy">
            <PrivacyPanel
              localOnlyMode={localOnlyMode}
              retentionDays={retentionDays}
              localDraftCount={localDraftCount}
              syncedRecordCount={syncedRecordCount}
              onToggleLocalOnlyMode={onToggleLocalOnlyMode}
              onExportLocalCache={onExportLocalCache}
              onClearLocalCache={onClearLocalCache}
              onExportServerData={onExportServerData}
              onDeleteServerData={onDeleteServerData}
              isProcessing={isProcessingPrivacyAction}
            />
          </TabsContent>
        </Tabs>

        <footer className="pb-2 pt-4 text-center text-sm text-slate-600">
          <p>
            Research prototype for early mental well-being awareness. Not for
            clinical diagnosis.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8c5427]">
            (c) 2026 Privacy-first design | consent-led research tooling
          </p>
        </footer>
      </main>
    </div>
  );
}
