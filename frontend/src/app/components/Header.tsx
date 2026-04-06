import { LogOut, Shield, UserRound } from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { AuthUser } from "@/app/services/api";

interface HeaderProps {
  user: AuthUser;
  apiStatus: "checking" | "online" | "offline";
  onPrivacyClick: () => void;
  onLogout: () => Promise<void> | void;
  isSigningOut: boolean;
}

export function Header({
  user,
  apiStatus,
  onPrivacyClick,
  onLogout,
  isSigningOut,
}: HeaderProps) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const statusCopy =
    apiStatus === "online"
      ? "Live backend"
      : apiStatus === "offline"
        ? "Offline mode"
        : "Checking backend";

  const statusTone =
    apiStatus === "online"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : apiStatus === "offline"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-slate-200 bg-white text-slate-700";

  return (
    <header className="sticky top-0 z-50 pt-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[28px] border border-white/70 bg-white/72 px-4 py-3 shadow-[0_25px_70px_-45px_rgba(16,61,68,0.75)] backdrop-blur sm:px-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#103d44] text-[#f8efe2]">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c5427]">
              Secure workspace
            </p>
            <h1 className="truncate text-2xl text-[#162530]">
              Behavioral Pattern Analysis
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={`hidden rounded-full px-3 py-1 sm:inline-flex ${statusTone}`}
          >
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-current opacity-70" />
            {statusCopy}
          </Badge>

          <div className="hidden items-center gap-3 rounded-[20px] border border-[#eadfce] bg-[#fcf6ee] px-3 py-2 sm:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#103d44] text-sm font-semibold text-[#f8efe2]">
              {initials || <UserRound className="h-4 w-4" />}
            </div>
            <div className="max-w-[180px]">
              <p className="truncate text-sm font-medium text-[#162530]">
                {user.name}
              </p>
              <p className="truncate text-xs text-slate-600">{user.email}</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={onPrivacyClick}
            className="rounded-2xl border-[#d8c6ae] bg-[#fcf6ee] text-[#103d44] hover:bg-[#f4e8d9]"
          >
            Privacy
          </Button>

          <Button
            onClick={onLogout}
            className="rounded-2xl bg-[#103d44] text-[#f8efe2] hover:bg-[#0d3339]"
            disabled={isSigningOut}
          >
            <LogOut className="h-4 w-4" />
            {isSigningOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </div>
    </header>
  );
}
