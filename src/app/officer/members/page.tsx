"use client";

import { Check, Download, Search, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useCVMess } from "@/components/app-provider";
import { PortalShell } from "@/components/portal-shell";
import { StatusPill } from "@/components/status-pill";
import { formatMoney, initials } from "@/lib/format";

export default function OfficerMembersPage() {
  const { members, accounts, profile, markPayment, setAccountRole } = useCVMess();
  const [search, setSearch] = useState("");
  const visible = useMemo(() => members.filter((member) => `${member.fullName} ${member.email} ${member.room}`.toLowerCase().includes(search.toLowerCase())), [members, search]);
  const total = members.reduce((sum, member) => sum + member.monthTotal, 0);
  const collected = members.filter((member) => member.paymentStatus === "paid").reduce((sum, member) => sum + member.monthTotal, 0);
  return (
    <PortalShell title="Members & bills" description="Review monthly totals and record received payments.">
      <section className="member-summary-band"><div><Users size={21} /><span>Active members<strong>100</strong></span></div><div><span>Current total<strong>{formatMoney(total)}</strong></span></div><div><span>Collected<strong>{formatMoney(collected)}</strong></span></div><div><span>Outstanding<strong>{formatMoney(total - collected)}</strong></span></div></section>
      <div className="toolbar panel"><label className="search-field wide"><Search size={17} /><input placeholder="Search by member, email, or room" value={search} onChange={(event) => setSearch(event.target.value)} /></label><button className="button light small"><Download size={16} /> Export statement</button></div>
      <section className="panel members-table">
        <div className="section-title"><div><span className="eyebrow"><ShieldCheck size={15} /> Access control</span><h2>Mess officers</h2><p>Multiple officers can manage menus, orders, bills, and member roles.</p></div></div>
        {accounts.map((account) => <div className="members-row" key={`role-${account.id}`}><div className="member-cell"><span className="avatar soft">{initials(account.fullName)}</span><div><strong>{account.fullName}</strong><small>{account.email}</small></div></div><span>{account.room}</span><span>{account.role === "officer" ? "Officer" : "Member"}</span><span /><span /><button disabled={account.id === profile.id} className={account.role === "officer" ? "text-button" : "button confirm small"} onClick={() => void setAccountRole(account.id, account.role === "officer" ? "member" : "officer")}>{account.id === profile.id ? "Current account" : account.role === "officer" ? "Remove officer" : "Make officer"}</button></div>)}
      </section>
      <section className="panel members-table">
        <div className="members-head"><span>Member</span><span>Contact</span><span>Orders</span><span>August bill</span><span>Payment</span><span /></div>
        {visible.map((member) => <div className="members-row" key={member.id}><div className="member-cell"><span className="avatar soft">{initials(member.fullName)}</span><div><strong>{member.fullName}</strong><small>{member.room}</small></div></div><div><span>{member.email}</span><small>{member.phone}</small></div><strong>{member.orderCount}</strong><strong>{formatMoney(member.monthTotal)}</strong><StatusPill status={member.paymentStatus} /><button className={member.paymentStatus === "due" ? "button confirm small" : "text-button"} onClick={() => void markPayment(member.id, member.paymentStatus !== "paid")}>{member.paymentStatus === "due" ? <><Check size={15} /> Mark paid</> : "Undo"}</button></div>)}
      </section>
    </PortalShell>
  );
}
