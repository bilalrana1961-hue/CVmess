"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";

export function PasswordForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
      const password = String(form.get("password"));
      const confirm = String(form.get("confirm"));
      if (password !== confirm) throw new Error("Passwords do not match.");
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) throw authError;
      toast.success("Password updated");
      router.push("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-page">
    <section className="auth-brand"><Logo /><div className="auth-brand-copy"><span className="eyebrow light">CV 105 community mess</span><h1>Your account, secured.</h1><p>Choose a private password for your account.</p></div></section>
    <section className="auth-panel"><div className="auth-box"><div className="mobile-auth-logo"><Logo /></div><div className="auth-heading"><span>Account security</span><h2>Choose a new password</h2><p>Use at least 8 characters.</p></div>
      <form onSubmit={submit}>
        <label><span>New password</span><div className="input-wrap"><LockKeyhole size={18}/><input required minLength={8} type="password" name="password" autoComplete="new-password" /></div></label><label><span>Confirm password</span><div className="input-wrap"><LockKeyhole size={18}/><input required minLength={8} type="password" name="confirm" autoComplete="new-password" /></div></label>
        {error && <p className="form-error">{error}</p>}
        <button className="button dark auth-submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18}/> : <>Update password<ArrowRight size={17}/></>}</button>
      </form>
      <p className="auth-switch"><Link href="/login">Back to sign in</Link></p>
    </div></section>
  </main>;
}
