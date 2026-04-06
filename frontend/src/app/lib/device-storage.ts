import { LocalDraftEntry } from "@/app/lib/behavioral-metrics";
import { InterventionPlan } from "@/app/lib/intervention-tracking";

export interface DevicePrivacySettings {
  localOnlyMode: boolean;
  retentionDays: number;
  lastRetentionReview: string;
}

const DEVICE_PRIVACY_KEY = "behavioral-pattern-analysis-device-privacy";
const LOCAL_DRAFTS_PREFIX = "behavioral-pattern-analysis-local-drafts:";
const INTERVENTIONS_PREFIX = "behavioral-pattern-analysis-interventions:";

const defaultPrivacySettings: DevicePrivacySettings = {
  localOnlyMode: false,
  retentionDays: 14,
  lastRetentionReview: new Date().toISOString(),
};

function hasStorageAccess() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!hasStorageAccess()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!hasStorageAccess()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function draftsKey(userId: string) {
  return `${LOCAL_DRAFTS_PREFIX}${userId}`;
}

function interventionsKey(userId: string) {
  return `${INTERVENTIONS_PREFIX}${userId}`;
}

export function loadDevicePrivacySettings() {
  return {
    ...defaultPrivacySettings,
    ...readJson<DevicePrivacySettings>(DEVICE_PRIVACY_KEY, defaultPrivacySettings),
  };
}

export function saveDevicePrivacySettings(settings: DevicePrivacySettings) {
  writeJson(DEVICE_PRIVACY_KEY, settings);
}

export function purgeExpiredLocalDrafts(
  entries: LocalDraftEntry[],
  retentionDays: number,
) {
  const retentionWindowMs = retentionDays * 24 * 60 * 60 * 1000;
  const now = Date.now();

  return entries.filter(
    (entry) => now - new Date(entry.storedAt).getTime() <= retentionWindowMs,
  );
}

export function loadLocalDrafts(userId: string, retentionDays: number) {
  const entries = readJson<LocalDraftEntry[]>(draftsKey(userId), []);
  const filteredEntries = purgeExpiredLocalDrafts(entries, retentionDays);

  if (filteredEntries.length !== entries.length) {
    writeJson(draftsKey(userId), filteredEntries);
  }

  return filteredEntries;
}

export function saveLocalDrafts(userId: string, entries: LocalDraftEntry[]) {
  writeJson(draftsKey(userId), entries);
}

export function clearLocalDrafts(userId: string) {
  if (!hasStorageAccess()) {
    return;
  }

  window.localStorage.removeItem(draftsKey(userId));
}

export function loadInterventionPlans(userId: string) {
  return readJson<InterventionPlan[]>(interventionsKey(userId), []);
}

export function saveInterventionPlans(userId: string, plans: InterventionPlan[]) {
  writeJson(interventionsKey(userId), plans);
}

export function clearInterventionPlans(userId: string) {
  if (!hasStorageAccess()) {
    return;
  }

  window.localStorage.removeItem(interventionsKey(userId));
}

export function downloadJsonFile(filename: string, payload: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
