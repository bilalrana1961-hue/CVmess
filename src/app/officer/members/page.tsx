"use client";

import { Check, Download, KeyRound, Plus, Search, ShieldCheck, Users, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCVMess } from "@/components/app-provider";
import { PortalShell } from "@/components/portal-shell";
import { StatusPill } from "@/components/status-pill";
import { formatMoney, initials } from "@/lib/format";
import type { MemberSummary } from "@/lib/types";

export default function OfficerMembersPage() {
  const { members, accounts, markPayment, createOfficer, resetMemberPassword } = useCVMess();
  const [search, setSearch] = useState("");
  const [showOfficerForm, setShowOfficerForm] = useState(false);
  const [resetMember, setResetMember] = useState<MemberSummary | null>(null);
  const [resetting, setResetting] = useState(false);
  const visible = useMemo(() => members.filter((member) => `${member.fullName} ${member.email} ${member.room}`.toLowerCase().includes(search.toLowerCase())), [members, search]);
  const total = members.reduce((sum, member) => sum + member.monthTotal, 0);
  const collected = members.filter((member) => member.paymentStatus === "paid").reduce((sum, member) => sum + member.monthTotal, 0);
  const monthName = new Intl.DateTimeFormat("en", { month: "long" }).format(new Date());

  async function submitReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resetMember) return;
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    const confirmation = String(form.get("confirmation"));
    if (password !== confirmation) { toast.error("The temporary passwords do not match."); return; }
    setResetting(true);
    try {
      await resetMemberPassword(resetMember.id, password);
      setResetMember(null);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "The password could not be reset.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <PortalShell title="Members & bills" description="Review monthly totals, payments, and member access.">
      <section className="member-summary-band"><div><Users size={21} /><span>Active members<strong>{members.length}</strong></span></div><div><span>Current total<strong>{formatMoney(total)}</strong></span></div><div><span>Collected<strong>{formatMoney(collected)}</strong></span></div><div><span>Outstanding<strong>{formatMoney(total - collected)}</strong></span></div></section>
      <div className="toolbar panel"><label className="search-field wide"><Search size={17} /><input placeholder="Search by member, email, or unit" value={search} onChange={(event) => setSearch(event.target.value)} /></label><button className="button light small"><Download size={16} /> Export statement</button></div>

      <section className="panel members-table">
        <div className="section-title"><div><span className="eyebrow"><ShieldCheck size={15} /> Separate access</span><h2>Mess officers</h2><p>Create dedicated officer credentials. These accounts are not taken from members.</p></div><button className="button confirm small" onClick={() => setShowOfficerForm((value) => !value)}><Plus size={16} /> Add officer</button></div>
        {showOfficerForm && <form className="toolbar" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void createOfficer({ name: String(data.get("name")), email: String(data.get("email")), password: String(data.get("password")), unit: String(data.get("unit")) }).then(() => setShowOfficerForm(false)).catch((cause) => toast.error(cause instanceof Error ? cause.message : "Officer account could not be created.")); }}><label><span>Name</span><input required name="name" /></label><label><span>Email</span><input required type="email" name="email" /></label><label><span>Password</span><input required minLength={8} type="password" name="password" /></label><label><span>Unit</span><input required name="unit" /></label><button className="button confirm small">Create account</button></form>}
        {accounts.map((account) => <div className="members-row" key={`role-${account.id}`}><div className="member-cell"><span className="avatar soft">{initials(account.fullName)}</span><div><strong>{account.fullName}</strong><small>{account.email}</small></div></div><span>{account.room}</span><span>Officer</span><span /><span /><span>Separate account</span></div>)}
      </section>

      <section className="panel members-table">
        <div className="members-head"><span>Member</span><span>Contact</span><span>Orders</span><span>{monthName} bill</span><span>Payment</span><span>Actions</span></div>
        {visible.map((member) => <div className="members-row" key={member.id}><div className="member-cell"><span className="avatar soft">{initials(member.fullName)}</span><div><strong>{member.fullName}</strong><small>{member.room}</small></div></div><div><span>{member.email}</span><small>{member.phone}</small></div><strong>{member.orderCount}</strong><strong>{formatMoney(member.monthTotal)}</strong><StatusPill status={member.paymentStatus} /><div className="member-actions"><button className="button light small" onClick={() => setResetMember(member)}><KeyRound size={15} /> Reset password</button><button className={member.paymentStatus === "due" ? "button confirm small" : "text-button"} onClick={() => void markPayment(member.id, member.paymentStatus !== "paid")}>{member.paymentStatus === "due" ? <><Check size={15} /> Mark paid</> : "Undo payment"}</button></div></div>)}
      </section>

      {resetMember && <div className="modal-layer"><button className="modal-backdrop" onClick={() => setResetMember(null)} aria-label="Close password reset" /><form className="menu-modal" onSubmit={submitReset}><div className="modal-heading"><div><span>Officer-assisted recovery</span><h2>Reset member password</h2><p>{resetMember.fullName} · {resetMember.email} · {resetMember.room}</p></div><button type="button" onClick={() => setResetMember(null)} aria-label="Close"><X size={20} /></button></div><p className="recovery-warning">Verify the member’s identity before continuing. You are replacing their password, not viewing the old one.</p><label><span>Temporary password</span><input required minLength={8} name="password" type="password" autoComplete="new-password" /></label><label><span>Confirm temporary password</span><input required minLength={8} name="confirmation" type="password" autoComplete="new-password" /></label><div className="modal-actions"><button type="button" className="button light" onClick={() => setResetMember(null)}>Cancel</button><button className="button dark" disabled={resetting}><KeyRound size={16} /> {resetting ? "Resetting…" : "Assign temporary password"}</button></div></form></div>}
    </PortalShell>
  );
}
