import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "Password recovery" };

export default function ForgotPasswordPage() {
  return <main className="auth-page">
    <section className="auth-brand"><Logo /><div className="auth-brand-copy"><span className="eyebrow light">Built for Unthak Sappers</span><h1>Recover your account safely.</h1><p>Password recovery is handled by an authorised mess officer after identity verification.</p></div></section>
    <section className="auth-panel"><div className="auth-box"><div className="mobile-auth-logo"><Logo /></div><div className="auth-heading"><span>Account recovery</span><h2>Forgot your password?</h2><p>No recovery email is required.</p></div>
      <div className="recovery-steps"><div><span><ShieldCheck size={19} /></span><p><strong>Contact a mess officer</strong>Provide your registered name, email address, and unit number.</p></div><div><span><KeyRound size={19} /></span><p><strong>Receive a temporary password</strong>The officer will verify you and replace your password securely.</p></div><div><span>3</span><p><strong>Change it after signing in</strong>Open Settings and choose your own private password immediately.</p></div></div>
      <p className="recovery-warning">A mess officer cannot see your old password and should never ask you to provide it.</p>
      <Link className="button dark auth-submit" href="/login"><ArrowLeft size={17} /> Back to member sign in</Link>
      <p className="auth-switch">Are you a mess officer? <Link href="/officer/login">Officer sign in</Link></p>
    </div></section>
  </main>;
}
