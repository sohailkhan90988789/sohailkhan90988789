import { useEffect, useState } from "react";

import {
  AppNotice,
  AuthScreen,
  AuthView,
} from "@/app/components/AuthScreen";
import { DashboardShell } from "@/app/components/DashboardShell";
import {
  BehavioralDataPoint,
  PatternInsight,
} from "@/app/data/mockData";
import {
  apiService,
  AuthPayload,
  AuthUser,
  BehavioralDataSubmission,
} from "@/app/services/api";
import {
  detectHiddenPatterns,
} from "@/app/lib/behavioral-insights";
import {
  DevicePrivacySettings,
  downloadJsonFile,
  loadDevicePrivacySettings,
  loadInterventionPlans,
  loadLocalDrafts,
  saveDevicePrivacySettings,
  saveInterventionPlans,
  saveLocalDrafts,
  clearInterventionPlans,
  clearLocalDrafts,
} from "@/app/lib/device-storage";
import {
  LocalDraftEntry,
  mergeBehavioralData,
} from "@/app/lib/behavioral-metrics";
import { InterventionPlan } from "@/app/lib/intervention-tracking";

const SESSION_STORAGE_KEY = "behavioral-pattern-analysis-session";

function normalizeBehavioralDataPoint(entry: Record<string, unknown>): BehavioralDataPoint {
  return {
    date: String(entry.date ?? new Date().toISOString().split("T")[0]),
    sleepHours:
      typeof entry.sleepHours === "number" ? entry.sleepHours : undefined,
    sleepQuality: Number(entry.sleepQuality ?? 0),
    physicalActivity: Number(entry.physicalActivity ?? 0),
    socialInteraction: Number(entry.socialInteraction ?? 0),
    screenTime:
      typeof entry.screenTime === "number" ? entry.screenTime : undefined,
    moodScore: Number(entry.moodScore ?? 0),
    stressLevel: Number(entry.stressLevel ?? 0),
    productivityScore: Number(entry.productivityScore ?? 0),
  };
}

function normalizeInsight(entry: Record<string, unknown>): PatternInsight {
  const normalizedImportance = entry.importance;
  const importance =
    normalizedImportance === "high" ||
    normalizedImportance === "medium" ||
    normalizedImportance === "low"
      ? normalizedImportance
      : "medium";

  return {
    id: String(entry.id ?? crypto.randomUUID()),
    category: String(entry.category ?? "Behavioral Pattern"),
    title: String(entry.title ?? "Pattern detected"),
    description: String(entry.description ?? "A new behavioral pattern was detected."),
    confidence: Number(entry.confidence ?? 0),
    importance,
    factors: Array.isArray(entry.factors)
      ? entry.factors.map((factor) => String(factor))
      : [],
    recommendation: String(
      entry.recommendation ?? "Review this change and continue tracking.",
    ),
  };
}

function buildErrorNotice(title: string, description: string): AppNotice {
  return {
    type: "error",
    title,
    description,
  };
}

function buildSuccessNotice(
  title: string,
  description: string,
  preview?: string,
): AppNotice {
  return {
    type: "success",
    title,
    description,
    preview,
  };
}

function buildBackendOfflineNotice(): AppNotice {
  return {
    type: "error",
    title: "Backend offline",
    description:
      "Start the Flask server with `cd backend` and `.\\venv\\Scripts\\python.exe app.py`, then try again.",
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authView, setAuthView] = useState<AuthView>("signin");
  const [busy, setBusy] = useState(false);
  const [booting, setBooting] = useState(true);
  const [notice, setNotice] = useState<AppNotice | null>(null);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">(
    "checking",
  );
  const [syncedBehavioralData, setSyncedBehavioralData] = useState<
    BehavioralDataPoint[]
  >([]);
  const [insights, setInsights] = useState<PatternInsight[]>([]);
  const [insightMessage, setInsightMessage] = useState<string | null>(null);
  const [isRefreshingDashboard, setIsRefreshingDashboard] = useState(false);
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);
  const [isProcessingPrivacyAction, setIsProcessingPrivacyAction] =
    useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [privacySettings, setPrivacySettings] = useState<DevicePrivacySettings>(
    () => loadDevicePrivacySettings(),
  );
  const [localDraftEntries, setLocalDraftEntries] = useState<LocalDraftEntry[]>(
    [],
  );
  const [interventions, setInterventions] = useState<InterventionPlan[]>([]);

  const behavioralData = mergeBehavioralData(
    syncedBehavioralData,
    localDraftEntries,
  );
  const hiddenInsights = detectHiddenPatterns(behavioralData);
  const allInsights = [...hiddenInsights, ...insights].filter(
    (insight, index, source) =>
      source.findIndex((entry) => entry.id === insight.id) === index,
  );

  useEffect(() => {
    const restoreSession = async () => {
      const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) {
        setBooting(false);
        return;
      }

      try {
        const parsed = JSON.parse(stored) as { token?: string };
        if (!parsed?.token) {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
          setBooting(false);
          return;
        }

        apiService.setAuthToken(parsed.token);
        const response = await apiService.getCurrentUser();

        if (response.success && response.data?.user) {
          setCurrentUser(response.data.user);
        } else {
          apiService.clearAuthToken();
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
          setNotice({
            type: "info",
            title: "Session expired",
            description: "Please sign in again to continue.",
          });
        }
      } catch (_error) {
        apiService.clearAuthToken();
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      } finally {
        setBooting(false);
      }
    };

    const checkApi = async () => {
      const response = await apiService.healthCheck();
      setApiStatus(response.success ? "online" : "offline");
    };

    void Promise.all([restoreSession(), checkApi()]);
  }, []);

  const persistSession = (payload: AuthPayload) => {
    apiService.setAuthToken(payload.token);
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        token: payload.token,
      }),
    );
    setCurrentUser(payload.user);
  };

  const clearSession = () => {
    apiService.clearAuthToken();
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setCurrentUser(null);
    setSyncedBehavioralData([]);
    setLocalDraftEntries([]);
    setInterventions([]);
    setInsights([]);
    setInsightMessage(null);
    setLastSyncedAt(null);
    setActiveTab("overview");
  };

  const loadDashboardData = async (
    userId: string,
    options?: { quietErrors?: boolean },
  ) => {
    setIsRefreshingDashboard(true);

    const [dataResponse, insightsResponse] = await Promise.all([
      apiService.getBehavioralData(userId, 30),
      apiService.getInsights(userId),
    ]);

    if (dataResponse.success && dataResponse.data?.data) {
      const normalizedData = Array.isArray(dataResponse.data.data)
        ? dataResponse.data.data.map((entry: Record<string, unknown>) =>
            normalizeBehavioralDataPoint(entry),
          )
        : [];

      setSyncedBehavioralData(normalizedData);
    } else if (!options?.quietErrors) {
      setNotice(
        buildErrorNotice(
          "Live data refresh failed",
          dataResponse.error || "Behavioral records could not be loaded.",
        ),
      );
    }

    if (insightsResponse.success && insightsResponse.data) {
      const liveInsights = Array.isArray(insightsResponse.data.insights)
        ? insightsResponse.data.insights.map((entry: Record<string, unknown>) =>
            normalizeInsight(entry),
          )
        : [];

      setInsights(liveInsights);
      setInsightMessage(
        typeof insightsResponse.data.message === "string"
          ? insightsResponse.data.message
          : null,
      );
    } else if (!options?.quietErrors) {
      setNotice(
        buildErrorNotice(
          "Insight refresh failed",
          insightsResponse.error || "The latest explainable insights were unavailable.",
        ),
      );
    }

    setLastSyncedAt(new Date().toISOString());
    setIsRefreshingDashboard(false);
  };

  useEffect(() => {
    if (!currentUser) {
      setLocalDraftEntries([]);
      setInterventions([]);
      return;
    }

    setLocalDraftEntries(
      loadLocalDrafts(currentUser.id, privacySettings.retentionDays),
    );
    setInterventions(loadInterventionPlans(currentUser.id));
  }, [currentUser, privacySettings.retentionDays]);

  useEffect(() => {
    if (!currentUser || apiStatus !== "online") {
      return;
    }

    void loadDashboardData(currentUser.id, { quietErrors: true });
  }, [currentUser, apiStatus]);

  const handleSignIn = async (payload: { email: string; password: string }) => {
    if (apiStatus !== "online") {
      setNotice(buildBackendOfflineNotice());
      return;
    }

    setBusy(true);
    const response = await apiService.login(payload.email, payload.password);

    if (!response.success || !response.data) {
      setNotice(
        buildErrorNotice(
          "Sign in failed",
          response.error || "Please check your email and password.",
        ),
      );
      setBusy(false);
      return;
    }

    persistSession(response.data);
    setNotice(
      buildSuccessNotice(
        `Welcome back, ${response.data.user.name.split(" ")[0]}.`,
        "Your account session is active and the dashboard is ready.",
      ),
    );
    setBusy(false);
  };

  const handleSubmitCheckIn = async (
    payload: Omit<BehavioralDataSubmission, "userId">,
  ) => {
    if (!currentUser) {
      return;
    }

    if (privacySettings.localOnlyMode) {
      setIsSubmittingCheckIn(true);

      const nextDraftEntry: LocalDraftEntry = {
        id: crypto.randomUUID(),
        storedAt: new Date().toISOString(),
        localOnly: true,
        date: payload.date,
        sleepHours: payload.sleepHours,
        sleepQuality: payload.sleepQuality,
        physicalActivity: payload.physicalActivity,
        socialInteraction: payload.socialInteraction,
        screenTime: payload.screenTime,
        moodScore: payload.moodScore,
        stressLevel: payload.stressLevel,
        productivityScore: payload.productivityScore,
      };

      const nextDrafts = [...localDraftEntries, nextDraftEntry];
      setLocalDraftEntries(nextDrafts);
      saveLocalDrafts(currentUser.id, nextDrafts);
      setLastSyncedAt(new Date().toISOString());
      setActiveTab("overview");
      setNotice(
        buildSuccessNotice(
          "Saved to device-only cache",
          "This check-in stayed on your device and was added to the local analysis layer without syncing to the backend.",
        ),
      );
      setIsSubmittingCheckIn(false);
      return;
    }

    if (apiStatus !== "online") {
      setNotice(buildBackendOfflineNotice());
      return;
    }

    setIsSubmittingCheckIn(true);
    const response = await apiService.submitBehavioralData({
      userId: currentUser.id,
      ...payload,
    });

    if (!response.success) {
      setNotice(
        buildErrorNotice(
          "Live check-in failed",
          response.error || "The latest entry could not be stored.",
        ),
      );
      setIsSubmittingCheckIn(false);
      return;
    }

    await loadDashboardData(currentUser.id, { quietErrors: true });
    setActiveTab("overview");
    setNotice(
      buildSuccessNotice(
        "Live data stored",
        `A new behavioral entry was saved and the dashboard refreshed with ${
          response.data?.dataPoints ?? "the latest"
        } records.`,
      ),
    );
    setIsSubmittingCheckIn(false);
  };

  const handleRegister = async (payload: {
    name: string;
    email: string;
    password: string;
    consent: boolean;
  }) => {
    if (apiStatus !== "online") {
      setNotice(buildBackendOfflineNotice());
      return;
    }

    setBusy(true);
    const response = await apiService.register(payload);

    if (!response.success || !response.data) {
      setNotice(
        buildErrorNotice(
          "Account setup failed",
          response.error || "We could not create your account right now.",
        ),
      );
      setBusy(false);
      return;
    }

    persistSession(response.data);
    setNotice(
      buildSuccessNotice(
        "Account created",
        response.data.emailDelivery?.message ||
          "Your account is ready and you are now signed in.",
        response.data.emailDelivery?.preview,
      ),
    );
    setBusy(false);
  };

  const handleForgotPassword = async (email: string) => {
    if (apiStatus !== "online") {
      setNotice(buildBackendOfflineNotice());
      return;
    }

    setBusy(true);
    const response = await apiService.forgotPassword(email);

    if (!response.success || !response.data) {
      setNotice(
        buildErrorNotice(
          "Password help failed",
          response.error || "We could not prepare a temporary password.",
        ),
      );
      setBusy(false);
      return;
    }

    setAuthView("signin");
    setNotice({
      type: response.data.emailDelivery?.delivered ? "success" : "info",
      title: "Temporary password prepared",
      description:
        response.data.emailDelivery?.message || response.data.message,
      preview: response.data.emailDelivery?.preview,
    });
    setBusy(false);
  };

  const handleLogout = async () => {
    setBusy(true);
    await apiService.logout();
    clearSession();
    setAuthView("signin");
    setNotice({
      type: "info",
      title: "Signed out safely",
      description:
        "Your session has been closed. Sign back in whenever you are ready.",
    });
    setBusy(false);
  };

  const handlePrivacyClick = () => {
    setActiveTab("privacy");
  };

  const handleToggleLocalOnlyMode = (enabled: boolean) => {
    const nextSettings: DevicePrivacySettings = {
      ...privacySettings,
      localOnlyMode: enabled,
      lastRetentionReview: new Date().toISOString(),
    };

    setPrivacySettings(nextSettings);
    saveDevicePrivacySettings(nextSettings);
    setNotice({
      type: enabled ? "info" : "success",
      title: enabled ? "Device-only mode enabled" : "Device-only mode disabled",
      description: enabled
        ? "New check-ins will stay in your on-device cache until you export or clear them."
        : "New check-ins will sync to the backend again.",
    });
  };

  const handleAddIntervention = async (
    intervention: Omit<InterventionPlan, "id">,
  ) => {
    if (!currentUser) {
      return;
    }

    const nextInterventions = [
      {
        id: crypto.randomUUID(),
        ...intervention,
      },
      ...interventions,
    ];
    setInterventions(nextInterventions);
    saveInterventionPlans(currentUser.id, nextInterventions);
    setNotice(
      buildSuccessNotice(
        "Intervention started",
        "This experiment is now being tracked against your behavioral baseline.",
      ),
    );
  };

  const handleRemoveIntervention = async (id: string) => {
    if (!currentUser) {
      return;
    }

    const nextInterventions = interventions.filter(
      (intervention) => intervention.id !== id,
    );
    setInterventions(nextInterventions);
    saveInterventionPlans(currentUser.id, nextInterventions);
    setNotice({
      type: "info",
      title: "Intervention removed",
      description: "The experiment has been removed from your device tracker.",
    });
  };

  const handleExportLocalCache = async () => {
    if (!currentUser) {
      return;
    }

    downloadJsonFile(`device-cache-${currentUser.id}.json`, {
      exportedAt: new Date().toISOString(),
      userId: currentUser.id,
      privacySettings,
      localDraftEntries,
      interventions,
    });

    setNotice(
      buildSuccessNotice(
        "Local cache exported",
        "Your device-only drafts and interventions were exported as JSON.",
      ),
    );
  };

  const handleClearLocalCache = async () => {
    if (!currentUser) {
      return;
    }

    clearLocalDrafts(currentUser.id);
    clearInterventionPlans(currentUser.id);
    setLocalDraftEntries([]);
    setInterventions([]);
    setNotice({
      type: "info",
      title: "Local cache cleared",
      description:
        "All on-device drafts and intervention notes were removed from this browser.",
    });
  };

  const handleExportServerData = async () => {
    if (!currentUser) {
      return;
    }

    if (apiStatus !== "online") {
      setNotice(buildBackendOfflineNotice());
      return;
    }

    setIsProcessingPrivacyAction(true);
    const response = await apiService.exportUserData(currentUser.id);

    if (!response.success || !response.data) {
      setNotice(
        buildErrorNotice(
          "Server export failed",
          response.error || "We could not export the synced backend records.",
        ),
      );
      setIsProcessingPrivacyAction(false);
      return;
    }

    downloadJsonFile(`server-export-${currentUser.id}.json`, response.data);
    setNotice(
      buildSuccessNotice(
        "Server data exported",
        "Your synced backend records were exported as JSON.",
      ),
    );
    setIsProcessingPrivacyAction(false);
  };

  const handleDeleteServerData = async () => {
    if (!currentUser) {
      return;
    }

    if (apiStatus !== "online") {
      setNotice(buildBackendOfflineNotice());
      return;
    }

    const confirmed = window.confirm(
      "This will permanently delete your synced backend data and account. Continue?",
    );

    if (!confirmed) {
      return;
    }

    setIsProcessingPrivacyAction(true);
    const response = await apiService.deleteUserData(currentUser.id);

    if (!response.success) {
      setNotice(
        buildErrorNotice(
          "Server deletion failed",
          response.error || "We could not delete the synced backend data.",
        ),
      );
      setIsProcessingPrivacyAction(false);
      return;
    }

    clearSession();
    setAuthView("signin");
    setNotice({
      type: "info",
      title: "Server account deleted",
      description:
        "Your synced backend data was removed. Local device-only drafts remain available only if you kept them separately.",
    });
    setIsProcessingPrivacyAction(false);
  };

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="glass-panel reveal-up w-full max-w-xl rounded-[32px] p-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8c5427]">
            Secure startup
          </p>
          <h1 className="mt-3 text-4xl text-[#162530]">
            Loading your protected workspace
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            We are checking the saved session and backend status before showing
            the new experience.
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen
        view={authView}
        onViewChange={setAuthView}
        onSignIn={handleSignIn}
        onRegister={handleRegister}
        onForgotPassword={handleForgotPassword}
        busy={busy}
        apiStatus={apiStatus}
        notice={notice}
      />
    );
  }

  return (
    <DashboardShell
      user={currentUser}
      data={behavioralData}
      insights={allInsights}
      insightMessage={insightMessage}
      interventions={interventions}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onPrivacyClick={handlePrivacyClick}
      onLogout={handleLogout}
      onSubmitCheckIn={handleSubmitCheckIn}
      onAddIntervention={handleAddIntervention}
      onRemoveIntervention={handleRemoveIntervention}
      localDraftCount={localDraftEntries.length}
      localOnlyMode={privacySettings.localOnlyMode}
      retentionDays={privacySettings.retentionDays}
      syncedRecordCount={syncedBehavioralData.length}
      onToggleLocalOnlyMode={handleToggleLocalOnlyMode}
      onExportLocalCache={handleExportLocalCache}
      onClearLocalCache={handleClearLocalCache}
      onExportServerData={handleExportServerData}
      onDeleteServerData={handleDeleteServerData}
      isSigningOut={busy}
      isSubmittingCheckIn={isSubmittingCheckIn}
      isRefreshingDashboard={isRefreshingDashboard}
      isProcessingPrivacyAction={isProcessingPrivacyAction}
      lastSyncedAt={lastSyncedAt}
      apiStatus={apiStatus}
      notice={notice}
      onClearNotice={() => setNotice(null)}
    />
  );
}
