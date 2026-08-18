"use client";

import { AlertTriangle, KeyRound, Search, Trash2, Users, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCVMess } from "@/components/app-provider";
import { EmptyState } from "@/components/empty-state";
import { PortalShell } from "@/components/portal-shell";
import { initials } from "@/lib/format";
import type { MemberSummary } from "@/lib/types";

export default function OfficerMembersPage() {
  const { members, resetMemberPassword, deleteAccount } = useCVMess();
  const [search, setSearch] = useState("");
  const [resetMember, setResetMember] = useState<MemberSummary | null>(null);
  const [deleteMember, setDeleteMember] = useState<MemberSummary | null>(null);
  const [working, setWorking] = useState(false);
  const visible = useMemo(() => { const query = search.trim().toLowerCase(); return members.filter((member) => `${member.fullName} ${member.email} ${member.phone} ${member.room}`.toLowerCase().includes(query)); }, [members, search]);

  async function submitReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resetMember) return;
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (password !== String(data.get("confirmation"))) { toast.error("The temporary passwords do not match."); return; }
    setWorking(true);
    try { await resetMemberPassword(resetMember.id, password); setResetMember(null); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : "The password could not be reset."); }
    finally { setWorking(false); }
  }

  async function confirmDeletion() {
    if (!deleteMember) return;
    setWorking(true);
    try { await deleteAccount(deleteMember.id, "member"); setDeleteMember(null); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : "The account could not be deleted."); }
    finally { setWorking(false); }
  }

  return (
    <PortalShell title="Manage members" description="Head Officer access for member credentials and account removal.">
      <section className="page-intro-card panel"><span className="page-intro-icon"><Users size={22} /></span><div><strong>{members.length} registered members</strong><p>Reset passwords or permanently remove member accounts. Billing remains in the separate Bills page.</p></div></section>
      <div className="toolbar panel"><label className="search-field wide"><Search size={17} /><input aria-label="Search members" placeholder="Search name, email, phone, or unit" value={search} onChange={(event) => setSearch(event.target.value)} /></label><span className="toolbar-count">Showing {visible.length} of {members.length}</span></div>
      <section className="panel directory-table member-directory"><div className="directory-head"><span>Member</span><span>Contact</span><span>Unit</span><span>Account actions</span></div>{visible.map((member) => <div className="directory-row" key={member.id}><div className="member-cell"><span className="avatar soft">{initials(member.fullName)}</span><div><strong>{member.fullName}</strong><small>Member account</small></div></div><div className="contact-cell"><span>{member.email}</span><small>{member.phone || "No phone added"}</small></div><strong className="unit-cell">Unit {member.room}</strong><div className="account-actions"><button className="button light small" onClick={() => setResetMember(member)}><KeyRound size={15} /> Reset password</button><button className="icon-danger-button" onClick={() => setDeleteMember(member)} aria-label={`Delete ${member.fullName}`}><Trash2 size={16} /></button></div></div>)}{visible.length === 0 && <EmptyState icon={Users} title="No members found" description={search ? "Try a different name, email, phone number, or unit." : "New member accounts will appear here after registration."} />}</section>

      {resetMember && <div className="modal-layer"><button className="modal-backdrop" onClick={() => setResetMember(null)} aria-label="Close password reset" /><form className="menu-modal" onSubmit={submitReset}><div className="modal-heading"><div><span>Head Officer action</span><h2>Reset member password</h2><p>{resetMember.fullName} · {resetMember.email} · Unit {resetMember.room}</p></div><button type="button" onClick={() => setResetMember(null)} aria-label="Close"><X size={20} /></button></div><p className="recovery-warning">Verify the member’s identity first. This replaces their password; it never reveals the old one.</p><label><span>Temporary password</span><input required minLength={8} name="password" type="password" autoComplete="new-password" /></label><label><span>Confirm temporary password</span><input required minLength={8} name="confirmation" type="password" autoComplete="new-password" /></label><div className="modal-actions"><button type="button" className="button light" onClick={() => setResetMember(null)}>Cancel</button><button className="button dark" disabled={working}><KeyRound size={16} /> {working ? "Resetting…" : "Assign temporary password"}</button></div></form></div>}
      {deleteMember && <div className="modal-layer"><button className="modal-backdrop" onClick={() => setDeleteMember(null)} aria-label="Close deletion confirmation" /><div className="menu-modal"><div className="modal-heading"><div><span>Permanent action</span><h2>Delete member account?</h2><p>{deleteMember.fullName} · {deleteMember.email}</p></div><button onClick={() => setDeleteMember(null)} aria-label="Close"><X size={20} /></button></div><p className="danger-warning"><AlertTriangle size={18} /> This permanently removes the member and their orders, payments, bills, and notifications. It cannot be undone.</p><div className="modal-actions"><button className="button light" onClick={() => setDeleteMember(null)}>Cancel</button><button className="button danger" disabled={working} onClick={() => void confirmDeletion()}><Trash2 size={16} /> {working ? "Deleting…" : "Delete permanently"}</button></div></div></div>}
    </PortalShell>
  );
}
