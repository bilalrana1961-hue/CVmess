"use client";

import { KeyRound, Search, Users, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCVMess } from "@/components/app-provider";
import { EmptyState } from "@/components/empty-state";
import { PortalShell } from "@/components/portal-shell";
import { initials } from "@/lib/format";
import type { MemberSummary } from "@/lib/types";

export default function OfficerMembersPage() {
  const { members, resetMemberPassword } = useCVMess();
  const [search, setSearch] = useState("");
  const [resetMember, setResetMember] = useState<MemberSummary | null>(null);
  const [resetting, setResetting] = useState(false);
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((member) => `${member.fullName} ${member.email} ${member.phone} ${member.room}`.toLowerCase().includes(query));
  }, [members, search]);

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
    <PortalShell title="Manage members" description="Find members, review contact details, and help with account access.">
      <section className="page-intro-card panel"><span className="page-intro-icon"><Users size={22} /></span><div><strong>{members.length} registered members</strong><p>Password resets are available here. Monthly charges and payments are managed separately in Bills.</p></div></section>
      <div className="toolbar panel"><label className="search-field wide"><Search size={17} /><input aria-label="Search members" placeholder="Search name, email, phone, or unit" value={search} onChange={(event) => setSearch(event.target.value)} /></label><span className="toolbar-count">Showing {visible.length} of {members.length}</span></div>
      <section className="panel directory-table member-directory">
        <div className="directory-head"><span>Member</span><span>Contact</span><span>Unit</span><span>Account action</span></div>
        {visible.map((member) => <div className="directory-row" key={member.id}><div className="member-cell"><span className="avatar soft">{initials(member.fullName)}</span><div><strong>{member.fullName}</strong><small>Member account</small></div></div><div className="contact-cell"><span>{member.email}</span><small>{member.phone || "No phone added"}</small></div><strong className="unit-cell">Unit {member.room}</strong><button className="button light small" onClick={() => setResetMember(member)}><KeyRound size={15} /> Reset password</button></div>)}
        {visible.length === 0 && <EmptyState icon={Users} title="No members found" description={search ? "Try a different name, email, phone number, or unit." : "New member accounts will appear here after registration."} />}
      </section>
      {resetMember && <div className="modal-layer"><button className="modal-backdrop" onClick={() => setResetMember(null)} aria-label="Close password reset" /><form className="menu-modal" onSubmit={submitReset}><div className="modal-heading"><div><span>Officer-assisted recovery</span><h2>Reset member password</h2><p>{resetMember.fullName} · {resetMember.email} · Unit {resetMember.room}</p></div><button type="button" onClick={() => setResetMember(null)} aria-label="Close"><X size={20} /></button></div><p className="recovery-warning">Verify the member’s identity before continuing. You are replacing their password, not viewing the old one.</p><label><span>Temporary password</span><input required minLength={8} name="password" type="password" autoComplete="new-password" /></label><label><span>Confirm temporary password</span><input required minLength={8} name="confirmation" type="password" autoComplete="new-password" /></label><div className="modal-actions"><button type="button" className="button light" onClick={() => setResetMember(null)}>Cancel</button><button className="button dark" disabled={resetting}><KeyRound size={16} /> {resetting ? "Resetting…" : "Assign temporary password"}</button></div></form></div>}
    </PortalShell>
  );
}
