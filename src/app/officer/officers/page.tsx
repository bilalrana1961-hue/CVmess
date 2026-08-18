"use client";

import { Plus, ShieldCheck, UserCog, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { useCVMess } from "@/components/app-provider";
import { EmptyState } from "@/components/empty-state";
import { PortalShell } from "@/components/portal-shell";
import { initials } from "@/lib/format";

export default function OfficerAccountsPage() {
  const { accounts, createOfficer } = useCVMess();
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  async function submitOfficer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setCreating(true);
    try { await createOfficer({ name: String(data.get("name")), email: String(data.get("email")), password: String(data.get("password")), unit: String(data.get("unit")) }); form.reset(); setShowForm(false); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : "Officer account could not be created."); }
    finally { setCreating(false); }
  }
  return (
    <PortalShell title="Manage officers" description="Create and review dedicated mess officer accounts.">
      <section className="page-intro-card panel"><span className="page-intro-icon"><ShieldCheck size={22} /></span><div><strong>Separate, protected access</strong><p>Officer credentials are independent from member accounts. Only existing officers can create another officer.</p></div><button className="button confirm small" onClick={() => setShowForm(true)}><Plus size={16} /> Add officer</button></section>
      <section className="panel directory-table officer-directory"><div className="directory-head"><span>Officer</span><span>Unit</span><span>Access type</span></div>{accounts.map((account) => <div className="directory-row" key={account.id}><div className="member-cell"><span className="avatar soft">{initials(account.fullName)}</span><div><strong>{account.fullName}</strong><small>{account.email}</small></div></div><strong className="unit-cell">Unit {account.room}</strong><span className="access-badge"><ShieldCheck size={14} /> Mess officer</span></div>)}{accounts.length === 0 && <EmptyState icon={UserCog} title="No officer accounts found" description="Create the first additional officer account to share operational access." />}</section>
      {showForm && <div className="modal-layer"><button className="modal-backdrop" onClick={() => setShowForm(false)} aria-label="Close officer form" /><form className="menu-modal" onSubmit={submitOfficer}><div className="modal-heading"><div><span>Dedicated access</span><h2>Add mess officer</h2><p>Create credentials that you can securely provide to the new officer.</p></div><button type="button" onClick={() => setShowForm(false)} aria-label="Close"><X size={20} /></button></div><label><span>Full name</span><input required name="name" autoComplete="name" /></label><label><span>Email address</span><input required type="email" name="email" autoComplete="email" /></label><label><span>Temporary password</span><input required minLength={8} type="password" name="password" autoComplete="new-password" /></label><label><span>Unit number</span><input required name="unit" inputMode="numeric" /></label><div className="modal-actions"><button type="button" className="button light" onClick={() => setShowForm(false)}>Cancel</button><button className="button dark" disabled={creating}><Plus size={16} /> {creating ? "Creating…" : "Create officer"}</button></div></form></div>}
    </PortalShell>
  );
}
