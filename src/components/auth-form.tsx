"use client";

import Link from "next/link";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode, officer = false, inviteCode = "" }: { mode: "login" | "signup"; officer?: boolean; inviteCode?: string }) {
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
      if (!supabase) throw new Error("CVmess sign-in is temporarily unavailable. Please contact the administrator.");
      if (isSignup) {
        const { data: auth, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: String(data.get("fullName")), phone: String(data.get("phone")), room: String(data.get("room")), account_type: officer ? "officer" : "member", officer_invite: officer ? inviteCode : undefined },
          },
        });
        if (authError) throw authError;
        if (!auth.session) throw new Error("Email confirmation is still enabled in Supabase. Disable Confirm email, then try again.");
        toast.success(officer ? "Officer account created" : "Account created");
        window.location.replace(officer ? "/officer" : "/dashboard");
      } else {
        const { data: auth, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", auth.user.id).single();
        const isOfficer = profile?.role === "officer";
        if (isOfficer !== officer) {
          await supabase.auth.signOut();
          throw new Error(isOfficer ? "Use the separate Officer sign in." : "This is a member account. Use Member sign in.");
        }
        window.location.replace(officer ? "/officer" : "/dashboard");
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
          <div className="auth-heading"><span>{officer ? "Mess officer portal" : isSignup ? "Create your member account" : "Welcome back"}</span><h2>{isSignup ? (officer ? "Create officer account" : "Join CVmess") : (officer ? "Officer sign in" : "Member sign in")}</h2><p>{officer ? "Use the separate credentials provided for mess administration." : isSignup ? "Enter your details as registered with the mess." : "Use your registered email and password."}</p></div>
          <form onSubmit={submit}>
            {isSignup && <div className="field-row"><label><span>Full name</span><div className="input-wrap"><UserRound size={18} /><input required name="fullName" placeholder="Hamza Ahmed" autoComplete="name" /></div></label><label><span>Unit</span><div className="input-wrap"><input required name="room" placeholder="105" /></div></label></div>}
            <label><span>Email address</span><div className="input-wrap"><Mail size={18} /><input required type="email" name="email" placeholder="you@example.com" autoComplete="email" /></div></label>
            {isSignup && <label><span>Phone number</span><div className="input-wrap"><Phone size={18} /><input required type="tel" name="phone" placeholder="+92 300 1234567" autoComplete="tel" /></div></label>}
            <label><span>Password</span><div className="input-wrap"><LockKeyhole size={18} /><input required minLength={8} type={showPassword ? "text" : "password"} name="password" placeholder="At least 8 characters" autoComplete={isSignup ? "new-password" : "current-password"} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
            {!isSignup && <div className="form-options"><span /> <Link href="/forgot-password">Forgot password?</Link></div>}
            {error && <p className="form-error">{error}</p>}
            <button className="button dark auth-submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18} /> : <>{isSignup ? "Create account" : "Sign in"}<ArrowRight size={17} /></>}</button>
          </form>
          <p className="auth-switch">{isSignup ? "Already have an account?" : "New to CVmess?"} <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Sign in" : "Create account"}</Link></p>
          {!isSignup && <p className="auth-switch"><Link href={officer ? "/login" : "/officer/login"}>{officer ? "Member sign in" : "Officer sign in"}</Link></p>}
        </div>
      </section>
    </main>
  );
}
