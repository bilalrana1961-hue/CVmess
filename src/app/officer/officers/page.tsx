"use client";

import { AlertTriangle, KeyRound, Plus, ShieldCheck, Trash2, UserCog, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { useCVMess } from "@/components/app-provider";
import { EmptyState } from "@/components/empty-state";
import { PortalShell } from "@/components/portal-shell";
import { initials } from "@/lib/format";
import type { Profile } from "@/lib/types";

export default function OfficerAccountsPage() {
  const { accounts, createOfficer, resetOfficerPassword, deleteAccount } = useCVMess();
  const [showForm, setShowForm] = useState(false);
  const [resetOfficer, setResetOfficer] = useState<Profile | null>(null);
  const [deleteOfficer, setDeleteOfficer] = useState<Profile | null>(null);
  const [working, setWorking] = useState(false);

  async function submitOfficer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setWorking(true);
    try { await createOfficer({ name: String(data.get("name")), email: String(data.get("email")), password: String(data.get("password")), unit: String(data.get("unit")) }); form.reset(); setShowForm(false); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : "Mess Officer account could not be created."); }
    finally { setWorking(false); }
  }

  async function submitReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resetOfficer) return;
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (password !== String(data.get("confirmation"))) { toast.error("The temporary passwords do not match."); return; }
    setWorking(true);
    try { await resetOfficerPassword(resetOfficer.id, password); setResetOfficer(null); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : "Password could not be updated."); }
    finally { setWorking(false); }
  }

  async function confirmDeletion() {
    if (!deleteOfficer) return;
    setWorking(true);
    try { await deleteAccount(deleteOfficer.id, "officer"); setDeleteOfficer(null); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : "Mess Officer could not be deleted."); }
    finally { setWorking(false); }
  }

  return (
    <PortalShell title="Manage officers" description="Head Officer access for creating and managing Mess Officer accounts.">
      <section className="page-intro-card panel"><span className="page-intro-icon"><ShieldCheck size={22} /></span><div><strong>Head Officer controlled access</strong><p>New accounts are Mess Officers with access to orders, menus, and bills. Only the Head Officer can create, reset, or delete them.</p></div><button className="button confirm small" onClick={() => setShowForm(true)}><Plus size={16} /> Add Mess Officer</button></section>
      <section className="panel directory-table officer-directory"><div className="directory-head"><span>Officer</span><span>Unit</span><span>Access level</span><span>Account actions</span></div>{accounts.map((account) => <div className="directory-row" key={account.id}><div className="member-cell"><span className="avatar soft">{initials(account.fullName)}</span><div><strong>{account.fullName}</strong><small>{account.email}</small></div></div><strong className="unit-cell">Unit {account.room}</strong><span className={`access-badge ${account.officerLevel === "head_officer" ? "head" : ""}`}><ShieldCheck size={14} /> {account.officerLevel === "head_officer" ? "Head Officer" : "Mess Officer"}</span>{account.officerLevel === "head_officer" ? <span className="protected-label">Protected account</span> : <div className="account-actions"><button className="button light small" onClick={() => setResetOfficer(account)}><KeyRound size={15} /> Reset password</button><button className="icon-danger-button" onClick={() => setDeleteOfficer(account)} aria-label={`Delete ${account.fullName}`}><Trash2 size={16} /></button></div>}</div>)}{accounts.length === 0 && <EmptyState icon={UserCog} title="No officer accounts found" description="Create a Mess Officer account to share operational access." />}</section>

      {showForm && <div className="modal-layer"><button className="modal-backdrop" onClick={() => setShowForm(false)} aria-label="Close officer form" /><form className="menu-modal" onSubmit={submitOfficer}><div className="modal-heading"><div><span>Mess Officer access</span><h2>Add Mess Officer</h2><p>This account will have orders, menu, billing, overview, and settings access.</p></div><button type="button" onClick={() => setShowForm(false)} aria-label="Close"><X size={20} /></button></div><label><span>Full name</span><input required name="name" autoComplete="name" /></label><label><span>Email address</span><input required type="email" name="email" autoComplete="email" /></label><label><span>Temporary password</span><input required minLength={8} type="password" name="password" autoComplete="new-password" /></label><label><span>Unit number</span><input required name="unit" inputMode="numeric" /></label><div className="modal-actions"><button type="button" className="button light" onClick={() => setShowForm(false)}>Cancel</button><button className="button dark" disabled={working}><Plus size={16} /> {working ? "Creating…" : "Create Mess Officer"}</button></div></form></div>}
      {resetOfficer && <div className="modal-layer"><button className="modal-backdrop" onClick={() => setResetOfficer(null)} aria-label="Close password reset" /><form className="menu-modal" onSubmit={submitReset}><div className="modal-heading"><div><span>Mess Officer access</span><h2>Reset officer password</h2><p>{resetOfficer.fullName} · {resetOfficer.email}</p></div><button type="button" onClick={() => setResetOfficer(null)} aria-label="Close"><X size={20} /></button></div><p className="recovery-warning">Assign a temporary password and provide it securely to this Mess Officer.</p><label><span>Temporary password</span><input required minLength={8} name="password" type="password" autoComplete="new-password" /></label><label><span>Confirm temporary password</span><input required minLength={8} name="confirmation" type="password" autoComplete="new-password" /></label><div className="modal-actions"><button type="button" className="button light" onClick={() => setResetOfficer(null)}>Cancel</button><button className="button dark" disabled={working}><KeyRound size={16} /> {working ? "Resetting…" : "Assign temporary password"}</button></div></form></div>}
      {deleteOfficer && <div className="modal-layer"><button className="modal-backdrop" onClick={() => setDeleteOfficer(null)} aria-label="Close deletion confirmation" /><div className="menu-modal"><div className="modal-heading"><div><span>Permanent action</span><h2>Delete Mess Officer?</h2><p>{deleteOfficer.fullName} · {deleteOfficer.email}</p></div><button onClick={() => setDeleteOfficer(null)} aria-label="Close"><X size={20} /></button></div><p className="danger-warning"><AlertTriangle size={18} /> This permanently removes their login and profile. Their historical decisions remain without an officer identity.</p><div className="modal-actions"><button className="button light" onClick={() => setDeleteOfficer(null)}>Cancel</button><button className="button danger" disabled={working} onClick={() => void confirmDeletion()}><Trash2 size={16} /> {working ? "Deleting…" : "Delete permanently"}</button></div></div></div>}
    </PortalShell>
  );
}
