"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Gyan, GyanSays } from "@/components/mascot/gyan";

export function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "google">("idle");
  const [error, setError] = useState<string | null>(
    initialError ? "That sign-in link didn't work. Try again." : null,
  );

  const redirectTo = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo() },
    });
    if (error) {
      setError(error.message);
      setState("idle");
      return;
    }
    setState("sent");
  }

  async function signInWithGoogle() {
    setError(null);
    setState("google");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (error) {
      setError(error.message);
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <Card color="mint" shadow="lg" className="flex flex-col items-center gap-4 text-center">
        <Gyan expression="celebrating" size={120} />
        <h2 className="text-2xl">Check your inbox!</h2>
        <p className="font-semibold">
          We sent a sign-in link to <span className="text-primary">{email}</span>. Tap it on this device.
        </p>
        <Button variant="ghost" size="sm" onClick={() => setState("idle")}>
          Use a different email
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <Gyan expression="happy" size={96} className="shrink-0" />
        <GyanSays className="mt-4">
          Hi! I&apos;m Gyan. Sign in and let&apos;s get your business noticed.
        </GyanSays>
      </div>

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
        <Button type="submit" size="lg" fullWidth loading={state === "sending"}>
          <Mail className="size-5" />
          Send me a sign-in link
        </Button>
      </form>

      <div className="flex items-center gap-3 text-sm font-bold text-ink-soft">
        <span className="h-0.5 flex-1 bg-ink/20" />
        or
        <span className="h-0.5 flex-1 bg-ink/20" />
      </div>

      <Button variant="secondary" size="lg" fullWidth onClick={signInWithGoogle} loading={state === "google"}>
        <GoogleMark />
        Continue with Google
      </Button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-xs text-ink-soft"
      >
        No passwords. No spam. Just marketing help.
      </motion.p>
    </div>
  );
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
