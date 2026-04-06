import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  Eye,
  FileCheck,
  Lock,
  ServerCrash,
  Shield,
  Trash2,
} from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Switch } from "@/app/components/ui/switch";
import { privacyMetrics } from "@/app/data/mockData";

interface PrivacyPanelProps {
  localOnlyMode: boolean;
  retentionDays: number;
  localDraftCount: number;
  syncedRecordCount: number;
  onToggleLocalOnlyMode: (enabled: boolean) => void;
  onExportLocalCache: () => Promise<void> | void;
  onClearLocalCache: () => Promise<void> | void;
  onExportServerData: () => Promise<void> | void;
  onDeleteServerData: () => Promise<void> | void;
  isProcessing: boolean;
}

export function PrivacyPanel({
  localOnlyMode,
  retentionDays,
  localDraftCount,
  syncedRecordCount,
  onToggleLocalOnlyMode,
  onExportLocalCache,
  onClearLocalCache,
  onExportServerData,
  onDeleteServerData,
  isProcessing,
}: PrivacyPanelProps) {
  const privacyFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description:
        "All behavioral data is encrypted in transit and protected at rest in the synced research environment.",
      status: privacyMetrics.dataEncrypted,
      color: "text-emerald-600",
    },
    {
      icon: Database,
      title: "Local-First Drafts",
      description:
        "You can keep new check-ins on this device only and decide later whether they should ever leave your browser.",
      status: true,
      color: "text-sky-600",
    },
    {
      icon: Shield,
      title: "No Third-Party Sharing",
      description:
        "Your data is never sold or shared with advertisers, insurers, or third parties.",
      status: privacyMetrics.noThirdPartySharing,
      color: "text-violet-600",
    },
    {
      icon: Eye,
      title: "User Control",
      description:
        "Export, delete, or pause syncing whenever you want. The system is designed to make each data decision visible.",
      status: privacyMetrics.userControlled,
      color: "text-orange-600",
    },
    {
      icon: FileCheck,
      title: "Anonymized Research",
      description:
        "If you opt-in to research, data is anonymized and aggregated before use.",
      status: privacyMetrics.anonymized,
      color: "text-pink-600",
    },
    {
      icon: CheckCircle2,
      title: "Consent-Led Compliance",
      description:
        "Export and deletion rights are exposed directly inside the product rather than buried behind support requests.",
      status: privacyMetrics.gdprCompliant,
      color: "text-teal-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <Shield className="h-6 w-6 text-emerald-600" />
          <h2 className="text-3xl text-[#162530]">Privacy Trust Center</h2>
          <Badge variant="default" className="bg-emerald-600">
            Protected
          </Badge>
        </div>
        <p className="text-slate-600">
          This project now combines synced backend analytics with on-device
          privacy controls so you can choose how much of your behavioral data
          stays local.
        </p>
      </div>

      <Card className="rounded-[28px] border-white/70 bg-gradient-to-br from-white/84 to-[#eef7f5] p-5 shadow-[0_20px_55px_-38px_rgba(16,61,68,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#103d44]">
              <Shield className="h-4 w-4" />
              Device-only mode
            </div>
            <h3 className="text-2xl text-[#162530]">
              Keep new check-ins on this device until you decide otherwise
            </h3>
            <p className="max-w-3xl text-sm leading-7 text-slate-700">
              When device-only mode is on, new check-ins skip backend sync and
              stay in a local browser cache. Existing synced records remain
              visible, but fresh entries do not leave this device.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-[24px] border border-[#d7e9e3] bg-white/80 px-4 py-3">
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-[#2f7c6f]">
                Mode
              </p>
              <p className="text-sm font-semibold text-[#162530]">
                {localOnlyMode ? "Device-only active" : "Backend sync active"}
              </p>
            </div>
            <Switch
              checked={localOnlyMode}
              onCheckedChange={onToggleLocalOnlyMode}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-[#eadfce] bg-[#fcf6ee] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#8c5427]">
              Local drafts
            </p>
            <p className="mt-2 text-3xl font-semibold text-[#162530]">
              {localDraftCount}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Unsynced entries currently stored on this device.
            </p>
          </div>
          <div className="rounded-[24px] border border-[#d7e9e3] bg-[#eef7f5] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#2f7c6f]">
              Synced records
            </p>
            <p className="mt-2 text-3xl font-semibold text-[#162530]">
              {syncedRecordCount}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Entries already available in the backend research layer.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/70 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Retention window
            </p>
            <p className="mt-2 text-3xl font-semibold text-[#162530]">
              {retentionDays} days
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Local drafts older than this are cleared automatically.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {privacyFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card
              key={index}
              className="rounded-[24px] border-white/70 bg-white/82 p-4 shadow-[0_20px_55px_-38px_rgba(16,61,68,0.45)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-3">
                <div className={`${feature.color} mt-1`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                    {feature.status ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-[24px] border-[#eadfce] bg-[#fcf6ee] p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#5e3b1c]">
            <Download className="h-4 w-4" />
            On-device cache controls
          </h3>
          <div className="space-y-3">
            <p className="text-sm leading-6 text-slate-700">
              Export or wipe the local drafts that never reached the backend.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onExportLocalCache}
                className="rounded-full border-[#d7c6ae] bg-white text-[#8d5225]"
              >
                <Download className="mr-2 h-4 w-4" />
                Export local cache
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClearLocalCache}
                className="rounded-full border-rose-200 bg-white text-rose-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear local cache
              </Button>
            </div>
          </div>
        </Card>

        <Card className="rounded-[24px] border-[#d7e9e3] bg-[#eef7f5] p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#103d44]">
            <ServerCrash className="h-4 w-4" />
            Synced backend controls
          </h3>
          <div className="space-y-3">
            <p className="text-sm leading-6 text-slate-700">
              Access or delete the records already stored in the synced backend.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onExportServerData}
                disabled={isProcessing}
                className="rounded-full border-[#b8d7d0] bg-white text-[#103d44]"
              >
                <Download className="mr-2 h-4 w-4" />
                Export server data
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onDeleteServerData}
                disabled={isProcessing}
                className="rounded-full border-rose-200 bg-white text-rose-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete synced account
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-[24px] border-2 border-[#cfe2df] bg-[#eef7f5] p-5">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-[#103d44]">
          <Shield className="h-5 w-5" />
          Ethical framework
        </h3>
        <div className="space-y-3 text-sm text-[#103d44]">
          <div className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2f7c6f]" />
            <p>
              <strong>Non-diagnostic:</strong> This system provides awareness
              insights, not medical diagnoses. Always consult healthcare
              professionals for clinical assessment.
            </p>
          </div>
          <div className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2f7c6f]" />
            <p>
              <strong>Informed consent:</strong> All synced data collection
              requires explicit consent, and device-only mode offers a no-sync
              option for higher-control tracking.
            </p>
          </div>
          <div className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2f7c6f]" />
            <p>
              <strong>Right to explanation:</strong> Every insight includes
              the logic, factors, and confidence behind it so the system stays
              transparent by design.
            </p>
          </div>
        </div>
      </Card>

      <Card className="rounded-[24px] border-yellow-300 bg-yellow-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-700" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-yellow-900">
              Important disclaimer
            </h4>
            <p className="text-xs text-yellow-800">
              This tool is designed for early awareness and self-reflection, not
              for diagnosis or treatment of mental health conditions. If you are
              experiencing distress, please reach out to qualified mental health
              professionals. In crisis situations, contact emergency services or
              crisis helplines.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
