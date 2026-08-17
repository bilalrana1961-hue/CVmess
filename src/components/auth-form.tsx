"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isSignup = mode === "signup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    const supabase = createClient();
    try {
      if (!supabase) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success(isSignup ? "Demo account ready" : "Welcome back to CVmess");
        router.push("/dashboard");
        return;
      }
      if (isSignup) {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: String(data.get("fullName")), phone: String(data.get("phone")), room: String(data.get("room")) },
            emailRedirectTo: `${window.location.origin}/auth/confirm`,
          },
        });
        if (authError) throw authError;
        toast.success("Account created", { description: "Check your email to confirm your address." });
        router.push("/login");
      } else {
        const { data: auth, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", auth.user.id).single();
        router.push(profile?.role === "officer" ? "/officer" : "/dashboard");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand">
        <Logo />
        <div className="auth-brand-copy"><span className="eyebrow light">CV 105 community mess</span><h1>Every meal accounted for.</h1><p>Order confidently, follow the status, and see a bill you can trust.</p></div>
        <div className="auth-quote"><p>“I can finally see my full month at a glance. No calls, no confusion.”</p><span>— CVmess member</span></div>
      </section>
      <section className="auth-panel">
        <div className="auth-box">
          <div className="mobile-auth-logo"><Logo /></div>
          <div className="auth-heading"><span>{isSignup ? "Create your member account" : "Welcome back"}</span><h2>{isSignup ? "Join CVmess" : "Sign in to CVmess"}</h2><p>{isSignup ? "Enter your details as registered with the mess." : "Use your registered email and password."}</p></div>
          <form onSubmit={submit}>
            {isSignup && <div className="field-row"><label><span>Full name</span><div className="input-wrap"><UserRound size={18} /><input required name="fullName" placeholder="Hamza Ahmed" autoComplete="name" /></div></label><label><span>Room</span><div className="input-wrap"><input required name="room" placeholder="Room 214" /></div></label></div>}
            <label><span>Email address</span><div className="input-wrap"><Mail size={18} /><input required type="email" name="email" placeholder="you@example.com" autoComplete="email" defaultValue={!isSignup && !isSupabaseConfigured() ? "member@cvmess.pk" : ""} /></div></label>
            {isSignup && <label><span>Phone number</span><div className="input-wrap"><Phone size={18} /><input required type="tel" name="phone" placeholder="+92 300 1234567" autoComplete="tel" /></div></label>}
            <label><span>Password</span><div className="input-wrap"><LockKeyhole size={18} /><input required minLength={8} type={showPassword ? "text" : "password"} name="password" placeholder="At least 8 characters" autoComplete={isSignup ? "new-password" : "current-password"} defaultValue={!isSignup && !isSupabaseConfigured() ? "cvmess-demo" : ""} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
            {!isSignup && <div className="form-options"><span /> <Link href="/forgot-password">Forgot password?</Link></div>}
            {error && <p className="form-error">{error}</p>}
            <button className="button dark auth-submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18} /> : <>{isSignup ? "Create account" : "Sign in"}<ArrowRight size={17} /></>}</button>
          </form>
          {!isSupabaseConfigured() && <p className="demo-hint"><b>Demo mode:</b> use the pre-filled details or enter anything valid.</p>}
          <p className="auth-switch">{isSignup ? "Already have an account?" : "New to CVmess?"} <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Sign in" : "Create account"}</Link></p>
        </div>
      </section>
    </main>
  );
}
