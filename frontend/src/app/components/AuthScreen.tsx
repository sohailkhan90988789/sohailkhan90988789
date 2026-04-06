import { FormEvent, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Brain,
  KeyRound,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Progress } from "@/app/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";

export type AuthView = "signin" | "register" | "forgot";

export interface AppNotice {
  type: "success" | "error" | "info";
  title: string;
  description: string;
  preview?: string;
}

interface AuthScreenProps {
  view: AuthView;
  onViewChange: (view: AuthView) => void;
  onSignIn: (payload: { email: string; password: string }) => Promise<void>;
  onRegister: (payload: {
    name: string;
    email: string;
    password: string;
    consent: boolean;
  }) => Promise<void>;
  onForgotPassword: (email: string) => Promise<void>;
  busy: boolean;
  apiStatus: "checking" | "online" | "offline";
  notice: AppNotice | null;
}

const signalCards = [
  {
    icon: Brain,
    title: "Explainable insights",
    copy: "Pattern changes are surfaced with context, confidence, and responsible framing.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-first controls",
    copy: "Consent, export, deletion, and session safety are built directly into the flow.",
  },
  {
    icon: Activity,
    title: "Calm daily tracking",
    copy: "The workspace keeps signal quality high without turning the experience into noise.",
  },
];

const trustSignals = [
  "Secure account creation",
  "Temporary password recovery by email",
  "Research-safe dashboard with consent tracking",
];

function buildGeneratedPassword() {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*?-_=+";

  return Array.from({ length: 14 }, () => {
    const index = Math.floor(Math.random() * alphabet.length);
    return alphabet[index];
  }).join("");
}

function getPasswordScore(password: string) {
  const checks = [
    password.length >= 8,
    password.length >= 12,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function getPasswordLabel(score: number) {
  if (score >= 84) return "Strong";
  if (score >= 67) return "Good";
  if (score >= 50) return "Fair";
  return "Weak";
}

export function AuthScreen({
  view,
  onViewChange,
  onSignIn,
  onRegister,
  onForgotPassword,
  busy,
  apiStatus,
  notice,
}: AuthScreenProps) {
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerConsent, setRegisterConsent] = useState(true);
  const [localRegisterError, setLocalRegisterError] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");

  const passwordScore = useMemo(
    () => getPasswordScore(registerPassword),
    [registerPassword],
  );

  const apiTone =
    apiStatus === "online"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : apiStatus === "offline"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-slate-200 bg-white/80 text-slate-700";

  const apiLabel =
    apiStatus === "online"
      ? "Backend connected"
      : apiStatus === "offline"
        ? "Backend offline"
        : "Checking backend";
  const authActionsDisabled = busy || apiStatus !== "online";

  const noticeTone =
    notice?.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : notice?.type === "error"
        ? "border-rose-200 bg-rose-50 text-rose-900"
        : "border-sky-200 bg-sky-50 text-sky-900";

  const handleSignInSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSignIn({
      email: signInEmail,
      password: signInPassword,
    });
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (registerPassword !== registerConfirmPassword) {
      setLocalRegisterError("Password and confirm password must match.");
      return;
    }

    setLocalRegisterError("");
    await onRegister({
      name: registerName,
      email: registerEmail,
      password: registerPassword,
      consent: registerConsent,
    });
  };

  const handleForgotSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onForgotPassword(forgotEmail);
  };

  const applyGeneratedPassword = () => {
    const generated = buildGeneratedPassword();
    setRegisterPassword(generated);
    setRegisterConfirmPassword(generated);
    setLocalRegisterError("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="float-orb absolute left-[-6rem] top-20 h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(201,111,45,0.28),_transparent_68%)]" />
      <div className="float-orb absolute right-[-7rem] top-12 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(16,61,68,0.2),_transparent_70%)] [animation-delay:-3s]" />
      <div className="float-orb absolute bottom-[-5rem] left-1/3 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(61,141,128,0.16),_transparent_72%)] [animation-delay:-6s]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-panel reveal-up flex flex-col justify-between rounded-[32px] p-6 sm:p-8 lg:p-10">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="rounded-full bg-[#103d44] px-3 py-1 text-[#f9f3ea]">
                Secure behavioral intelligence
              </Badge>
              <Badge variant="outline" className={`rounded-full px-3 py-1 ${apiTone}`}>
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-current opacity-70" />
                {apiLabel}
              </Badge>
            </div>

            <div className="max-w-2xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#a15f2d]">
                Behavioral Pattern Analysis Framework
              </p>
              <h1 className="text-4xl text-[#162530] sm:text-5xl lg:text-6xl">
                Sign in to a calmer, clearer well-being workspace.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-700 sm:text-lg">
                We have reshaped the product around trust, clarity, and strong
                account handling so the research dashboard feels safer and easier
                to use from the first screen.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {signalCards.map((card, index) => {
                const Icon = card.icon;

                return (
                  <Card
                    key={card.title}
                    className={`reveal-up stagger-${index + 1} gap-4 rounded-[24px] border-white/70 bg-white/78 p-5 shadow-[0_24px_60px_-34px_rgba(16,61,68,0.45)] backdrop-blur`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#103d44] text-[#f8efe2]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="text-lg text-[#162530]">{card.title}</h2>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{card.copy}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="mt-10 grid gap-4 rounded-[28px] border border-white/70 bg-[#102f36] p-6 text-[#f4ece1] shadow-[0_26px_70px_-40px_rgba(16,61,68,0.7)] sm:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-[#f1c08b]" />
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e6d3bc]">
                  What changed
                </p>
              </div>
              <div className="space-y-2">
                {trustSignals.map((signal) => (
                  <div key={signal} className="flex items-start gap-3 text-sm leading-6 text-[#f7f3ed]">
                    <BadgeCheck className="mt-0.5 h-4 w-4 text-[#f1c08b]" />
                    <span>{signal}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/8 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d8c3a9]">
                Session ready
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">01 secure flow</p>
              <p className="mt-2 text-sm leading-6 text-[#d8c3a9]">
                Create an account, receive onboarding email support, recover
                passwords safely, and move straight into the dashboard.
              </p>
            </div>
          </div>
        </section>

        <section className="glass-panel reveal-up stagger-2 flex items-center rounded-[32px] p-4 sm:p-6">
          <Card className="w-full gap-0 rounded-[28px] border-white/70 bg-white/86 shadow-none backdrop-blur">
            <div className="border-b border-[#eadfce] px-6 py-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="rounded-full border-[#d7c6ae] bg-[#fcf5eb] px-3 py-1 text-[#8d5225]">
                    Account access
                  </Badge>
                  <h2 className="text-3xl text-[#162530]">Welcome back</h2>
                  <p className="text-sm leading-6 text-slate-600">
                    Sign in, create your account, or request a temporary password.
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#103d44] text-[#f8efe2]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <Tabs value={view} onValueChange={(value) => onViewChange(value as AuthView)}>
                <TabsList className="grid h-auto w-full grid-cols-3 rounded-2xl bg-[#f2e6d9] p-1">
                  <TabsTrigger value="signin" className="rounded-2xl py-2.5 data-[state=active]:bg-white data-[state=active]:text-[#103d44]">
                    Sign in
                  </TabsTrigger>
                  <TabsTrigger value="register" className="rounded-2xl py-2.5 data-[state=active]:bg-white data-[state=active]:text-[#103d44]">
                    Create account
                  </TabsTrigger>
                  <TabsTrigger value="forgot" className="rounded-2xl py-2.5 data-[state=active]:bg-white data-[state=active]:text-[#103d44]">
                    Password help
                  </TabsTrigger>
                </TabsList>

                {notice && (
                  <div className={`mt-5 rounded-2xl border px-4 py-4 ${noticeTone}`}>
                    <p className="text-sm font-semibold">{notice.title}</p>
                    <p className="mt-1 text-sm leading-6">{notice.description}</p>
                    {notice.preview && (
                      <div className="mt-3 rounded-2xl border border-current/15 bg-white/70 p-3 text-xs leading-6 text-slate-700">
                        <p className="mb-2 font-semibold text-slate-900">
                          Email preview
                        </p>
                        <pre className="whitespace-pre-wrap font-mono text-[11px]">
                          {notice.preview}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {apiStatus === "offline" && (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900">
                    <p className="text-sm font-semibold">Local API server is not running</p>
                    <p className="mt-1 text-sm leading-6">
                      Start the backend with <code>cd backend</code> and{" "}
                      <code>.\venv\Scripts\python.exe app.py</code>, then refresh or
                      try the form again.
                    </p>
                  </div>
                )}

                <TabsContent value="signin" className="mt-6">
                  <form className="space-y-5" onSubmit={handleSignInSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={signInEmail}
                        onChange={(event) => setSignInEmail(event.target.value)}
                        placeholder="you@example.com"
                        required
                        className="h-11 rounded-2xl border-[#dccab3] bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={signInPassword}
                        onChange={(event) => setSignInPassword(event.target.value)}
                        placeholder="Enter your password"
                        required
                        className="h-11 rounded-2xl border-[#dccab3] bg-white"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="h-11 w-full rounded-2xl bg-[#103d44] text-[#f8efe2] hover:bg-[#0d3339]"
                      disabled={authActionsDisabled}
                    >
                      {busy ? "Signing in..." : "Sign in"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="mt-6">
                  <form className="space-y-5" onSubmit={handleRegisterSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full name</Label>
                      <Input
                        id="register-name"
                        value={registerName}
                        onChange={(event) => setRegisterName(event.target.value)}
                        placeholder="Tarun Yadav"
                        required
                        className="h-11 rounded-2xl border-[#dccab3] bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerEmail}
                        onChange={(event) => setRegisterEmail(event.target.value)}
                        placeholder="you@example.com"
                        required
                        className="h-11 rounded-2xl border-[#dccab3] bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="register-password">Password</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={applyGeneratedPassword}
                          className="rounded-full px-3 text-[#103d44] hover:bg-[#f3e5d3]"
                        >
                          <KeyRound className="h-4 w-4" />
                          Generate secure password
                        </Button>
                      </div>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerPassword}
                        onChange={(event) => setRegisterPassword(event.target.value)}
                        placeholder="Create a strong password"
                        required
                        className="h-11 rounded-2xl border-[#dccab3] bg-white"
                      />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                          <span>Password strength</span>
                          <span>{getPasswordLabel(passwordScore)}</span>
                        </div>
                        <Progress value={passwordScore} className="h-2 bg-[#ead8c1]" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Confirm password</Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        value={registerConfirmPassword}
                        onChange={(event) => setRegisterConfirmPassword(event.target.value)}
                        placeholder="Re-enter your password"
                        required
                        className="h-11 rounded-2xl border-[#dccab3] bg-white"
                      />
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-[#eadfce] bg-[#fbf6ef] px-4 py-3">
                      <Checkbox
                        checked={registerConsent}
                        onCheckedChange={(checked) => setRegisterConsent(checked === true)}
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#162530]">
                          I consent to privacy-first behavioral data handling.
                        </p>
                        <p className="text-xs leading-5 text-slate-600">
                          You can export or delete your records later from the dashboard.
                        </p>
                      </div>
                    </div>

                    {localRegisterError && (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                        {localRegisterError}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="h-11 w-full rounded-2xl bg-[#103d44] text-[#f8efe2] hover:bg-[#0d3339]"
                      disabled={authActionsDisabled}
                    >
                      {busy ? "Creating account..." : "Create account"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="forgot" className="mt-6">
                  <form className="space-y-5" onSubmit={handleForgotSubmit}>
                    <div className="rounded-2xl border border-[#eadfce] bg-[#fbf6ef] px-4 py-4 text-sm leading-6 text-slate-700">
                      Enter the email linked to your account. The backend will
                      generate a temporary password and send it by email. If SMTP
                      is not configured yet, you will still get a safe preview in
                      this UI.
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Registered email</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        value={forgotEmail}
                        onChange={(event) => setForgotEmail(event.target.value)}
                        placeholder="you@example.com"
                        required
                        className="h-11 rounded-2xl border-[#dccab3] bg-white"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="h-11 w-full rounded-2xl bg-[#103d44] text-[#f8efe2] hover:bg-[#0d3339]"
                      disabled={authActionsDisabled}
                    >
                      {busy ? "Preparing email..." : "Send temporary password"}
                      <Mail className="h-4 w-4" />
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
