"use client";

import { KeyRound, LogOut, Mail, Phone, Save, ShieldCheck, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { PortalShell } from "@/components/portal-shell";
import { useCVMess } from "@/components/app-provider";

export default function SettingsPage() {
  const { profile, updateProfile, changePassword, signOut } = useCVMess();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSavingProfile(true);
    try {
      await updateProfile({ fullName: String(form.get("fullName")).trim(), phone: String(form.get("phone")).trim(), unit: String(form.get("unit")).trim() });
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Your profile could not be updated.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = event.currentTarget;
    const form = new FormData(target);
    const password = String(form.get("password"));
    const confirmation = String(form.get("confirmation"));
    if (password !== confirmation) { toast.error("The new passwords do not match."); return; }
    setSavingPassword(true);
    try {
      await changePassword(password);
      target.reset();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Your password could not be changed.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <PortalShell title="Settings" description="Manage your CVmess account and security.">
      <section className="settings-grid">
        <form className="panel settings-card" onSubmit={submitProfile}>
          <div className="panel-heading"><div><span>Account</span><h3>Profile details</h3></div><UserRound size={21} /></div>
          <label><span>Full name</span><div className="input-wrap"><UserRound size={18} /><input required name="fullName" defaultValue={profile.fullName} autoComplete="name" /></div></label>
          <label><span>Email address</span><div className="input-wrap read-only"><Mail size={18} /><input value={profile.email} readOnly aria-describedby="email-help" /></div><small id="email-help">Your login email cannot be changed here.</small></label>
          <label><span>Phone number</span><div className="input-wrap"><Phone size={18} /><input required name="phone" type="tel" defaultValue={profile.phone} autoComplete="tel" /></div></label>
          <label><span>Unit number</span><div className="input-wrap"><ShieldCheck size={18} /><input required name="unit" defaultValue={profile.room} /></div></label>
          <div className="account-role"><span>Account type</span><strong>{profile.officerLevel === "head_officer" ? "Head Officer" : profile.role === "officer" ? "Mess Officer" : "Member"}</strong></div>
          <button className="button dark" disabled={savingProfile}><Save size={16} /> {savingProfile ? "Saving…" : "Save profile"}</button>
        </form>

        <div className="settings-column">
          <form className="panel settings-card" onSubmit={submitPassword}>
            <div className="panel-heading"><div><span>Security</span><h3>Change password</h3></div><KeyRound size={21} /></div>
            <label><span>New password</span><div className="input-wrap"><KeyRound size={18} /><input required minLength={8} name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" /></div></label>
            <label><span>Confirm new password</span><div className="input-wrap"><KeyRound size={18} /><input required minLength={8} name="confirmation" type="password" autoComplete="new-password" /></div></label>
            <button className="button dark" disabled={savingPassword}>{savingPassword ? "Changing…" : "Change password"}</button>
          </form>
          <section className="panel settings-card signout-card"><div><span>Session</span><h3>Sign out of CVmess</h3><p>Use this on shared devices to protect your account.</p></div><button className="button reject" onClick={() => void signOut()}><LogOut size={16} /> Sign out</button></section>
        </div>
      </section>
    </PortalShell>
  );
}
