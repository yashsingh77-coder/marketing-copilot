"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, KeyRound, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Gyan, GyanSays } from "@/components/mascot/gyan";

type Mode = "signin" | "signup" | "link";

export function LoginForm({
  next,
  initialError,
  googleEnabled = false,
  otpCodeEnabled = false,
}: {
  next: string;
  initialError?: string;
  googleEnabled?: boolean;
  /** True once custom SMTP + email templates include {{ .Token }}. */
  otpCodeEnabled?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "verifying">("idle");
  const [error, setError] = useState<string | null>(
    initialError ? "That link didn't work — it may have opened in a different browser. Sign in with your password instead." : null,
  );

  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  function finish() {
    router.replace(next);
    router.refresh();
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState("busy");
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name.trim() || undefined } },
      });
      if (error) {
        setError(friendly(error.message));
        setState("idle");
        return;
      }
      if (data.session) return finish();
      // Auto-confirm is on, so this only happens if the email already exists.
      setError("An account with this email already exists. Sign in instead.");
      setMode("signin");
      setState("idle");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(friendly(error.message));
      setState("idle");
      return;
    }
    finish();
  }

  async function sendMagicLink(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setCode("");
    setState("busy");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
    if (error) {
      setError(friendly(error.message));
      setState("idle");
      return;
    }
    setState("sent");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState("verifying");
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "email" });
    if (error) {
      setError(error.message.includes("expired") ? "That code has expired. Request a new one." : "That code didn't match. Check and try again.");
      setState("sent");
      return;
    }
    finish();
  }

  async function signInWithGoogle() {
    setError(null);
    setState("busy");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
    if (error) {
      setError(error.message);
      setState("idle");
    }
  }

  if (mode === "link" && (state === "sent" || state === "verifying")) {
    return (
      <Card color="mint" shadow="lg" className="flex flex-col items-center gap-4 text-center">
        <Gyan expression="celebrating" size={110} />
        <h2 className="text-2xl">Check your inbox!</h2>
        <p className="font-semibold">
          {otpCodeEnabled ? (
            <>
              We emailed <span className="text-primary">{email}</span> a 6-digit code and a link. Type the code here, or tap
              the link on this device.
            </>
          ) : (
            <>
              We sent a sign-in link to <span className="text-primary">{email}</span>. Open it on this device, in this
              browser.
            </>
          )}
        </p>
        {otpCodeEnabled && (
          <form onSubmit={verifyCode} className="flex w-full flex-col gap-3">
            <Input
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="123456"
              aria-label="6-digit code"
              className="text-center font-display text-2xl tracking-[0.4em]"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              error={error ?? undefined}
              autoFocus
            />
            <Button type="submit" size="lg" fullWidth loading={state === "verifying"} disabled={code.length !== 6}>
              <KeyRound className="size-5" /> Sign in
            </Button>
          </form>
        )}
        {!otpCodeEnabled && error && <p className="text-sm font-bold text-secondary">{error}</p>}
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" onClick={() => { setState("idle"); setCode(""); setError(null); }}>
            Back
          </Button>
          <Button variant="ghost" size="sm" onClick={() => sendMagicLink()}>
            Resend
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <Gyan expression={mode === "signup" ? "celebrating" : "happy"} size={96} className="shrink-0" />
        <GyanSays className="mt-4">
          {mode === "signup"
            ? "New here? Create your account — takes 10 seconds, no email verification."
            : mode === "link"
              ? "I'll email you a sign-in link. Open it in this same browser."
              : "Hi! I'm Gyan. Sign in and let's get your business noticed."}
        </GyanSays>
      </div>

      <div className="flex gap-2">
        <Chip size="sm" selected={mode === "signin"} onClick={() => { setMode("signin"); setError(null); }}>
          Sign in
        </Chip>
        <Chip size="sm" selected={mode === "signup"} onClick={() => { setMode("signup"); setError(null); }}>
          Create account
        </Chip>
        <Chip size="sm" selected={mode === "link"} onClick={() => { setMode("link"); setError(null); }}>
          Email link
        </Chip>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {mode === "link" ? (
            <form onSubmit={sendMagicLink} className="flex flex-col gap-4">
              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error ?? undefined}
              />
              <Button type="submit" size="lg" fullWidth loading={state === "busy"}>
                <Mail className="size-5" /> Send me a sign-in link
              </Button>
              <p className="text-center text-xs text-ink-soft">
                Email links are limited to a few per hour right now. Password sign-in is instant.
              </p>
            </form>
          ) : (
            <form onSubmit={submitPassword} className="flex flex-col gap-4">
              {mode === "signup" && (
                <Input
                  label="Your name"
                  placeholder="e.g. Arnav"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  label="Password"
                  placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={error ?? undefined}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-3 top-[38px] text-ink-soft"
                >
                  {showPw ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              <Button type="submit" size="lg" fullWidth loading={state === "busy"}>
                {mode === "signup" ? (
                  <>
                    <UserPlus className="size-5" /> Create my account
                  </>
                ) : (
                  <>
                    <LogIn className="size-5" /> Sign in
                  </>
                )}
              </Button>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => { setMode("link"); setError(null); }}
                  className="text-center text-sm font-bold text-primary"
                >
                  Forgot password? Use an email link
                </button>
              )}
            </form>
          )}
        </motion.div>
      </AnimatePresence>

      {googleEnabled && (
        <>
          <div className="flex items-center gap-3 text-sm font-bold text-ink-soft">
            <span className="h-0.5 flex-1 bg-ink/20" />
            or
            <span className="h-0.5 flex-1 bg-ink/20" />
          </div>
          <Button variant="secondary" size="lg" fullWidth onClick={signInWithGoogle} loading={state === "busy"}>
            <GoogleMark />
            Continue with Google
          </Button>
        </>
      )}

      <p className="text-center text-xs text-ink-soft">No spam. Just marketing help.</p>
    </div>
  );
}

function friendly(msg: string) {
  if (/rate limit/i.test(msg)) return "Too many emails sent right now. Use password sign-in instead — it's instant.";
  if (/Invalid login credentials/i.test(msg)) return "Wrong email or password. If you're new, tap “Create account”.";
  if (/already registered|already exists/i.test(msg)) return "An account with this email already exists. Sign in instead.";
  if (/Password should be/i.test(msg)) return "Password needs at least 8 characters.";
  if (/valid email/i.test(msg)) return "That doesn't look like a valid email.";
  return msg;
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.4 7.4 24 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.6.4-2.4V6.5H1.4C.5 8.2 0 10 0 12s.5 3.8 1.4 5.5l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.6 1.4 6.5l4 3.1c.9-2.8 3.5-4.8 6.6-4.8z" />
    </svg>
  );
}
