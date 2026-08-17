"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";

export function PasswordForm({ mode }: { mode: "request" | "update" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const updating = mode === "update";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      setBusy(false);
      return;
    }

    try {
      if (updating) {
        const password = String(form.get("password"));
        const confirm = String(form.get("confirm"));
        if (password !== confirm) throw new Error("Passwords do not match.");
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
        toast.success("Password updated");
        router.push("/dashboard");
      } else {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(String(form.get("email")), {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (authError) throw authError;
        toast.success("Reset link sent", { description: "Check your email inbox." });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-page">
    <section className="auth-brand"><Logo /><div className="auth-brand-copy"><span className="eyebrow light">CV 105 community mess</span><h1>Your account, secured.</h1><p>Recover access without involving the mess officer.</p></div></section>
    <section className="auth-panel"><div className="auth-box"><div className="mobile-auth-logo"><Logo /></div><div className="auth-heading"><span>Account recovery</span><h2>{updating ? "Choose a new password" : "Reset your password"}</h2><p>{updating ? "Use at least 8 characters." : "We will email you a secure reset link."}</p></div>
      <form onSubmit={submit}>
        {updating ? <><label><span>New password</span><div className="input-wrap"><LockKeyhole size={18}/><input required minLength={8} type="password" name="password" autoComplete="new-password" /></div></label><label><span>Confirm password</span><div className="input-wrap"><LockKeyhole size={18}/><input required minLength={8} type="password" name="confirm" autoComplete="new-password" /></div></label></> : <label><span>Email address</span><div className="input-wrap"><Mail size={18}/><input required type="email" name="email" autoComplete="email" /></div></label>}
        {error && <p className="form-error">{error}</p>}
        <button className="button dark auth-submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18}/> : <>{updating ? "Update password" : "Send reset link"}<ArrowRight size={17}/></>}</button>
      </form>
      <p className="auth-switch"><Link href="/login">Back to sign in</Link></p>
    </div></section>
  </main>;
}
