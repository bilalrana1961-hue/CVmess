"use client";

import { Check, Download, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useCVMess } from "@/components/app-provider";
import { PortalShell } from "@/components/portal-shell";
import { StatusPill } from "@/components/status-pill";
import { formatMoney, initials } from "@/lib/format";

export default function OfficerMembersPage() {
  const { members, markPayment } = useCVMess();
  const [search, setSearch] = useState("");
  const visible = useMemo(() => members.filter((member) => `${member.fullName} ${member.email} ${member.room}`.toLowerCase().includes(search.toLowerCase())), [members, search]);
  const total = members.reduce((sum, member) => sum + member.monthTotal, 0);
  const collected = members.filter((member) => member.paymentStatus === "paid").reduce((sum, member) => sum + member.monthTotal, 0);
  return (
    <PortalShell title="Members & bills" description="Review monthly totals and record received payments.">
      <section className="member-summary-band"><div><Users size={21} /><span>Active members<strong>100</strong></span></div><div><span>Current total<strong>{formatMoney(total)}</strong></span></div><div><span>Collected<strong>{formatMoney(collected)}</strong></span></div><div><span>Outstanding<strong>{formatMoney(total - collected)}</strong></span></div></section>
      <div className="toolbar panel"><label className="search-field wide"><Search size={17} /><input placeholder="Search by member, email, or room" value={search} onChange={(event) => setSearch(event.target.value)} /></label><button className="button light small"><Download size={16} /> Export statement</button></div>
      <section className="panel members-table">
        <div className="members-head"><span>Member</span><span>Contact</span><span>Orders</span><span>August bill</span><span>Payment</span><span /></div>
        {visible.map((member) => <div className="members-row" key={member.id}><div className="member-cell"><span className="avatar soft">{initials(member.fullName)}</span><div><strong>{member.fullName}</strong><small>{member.room}</small></div></div><div><span>{member.email}</span><small>{member.phone}</small></div><strong>{member.orderCount}</strong><strong>{formatMoney(member.monthTotal)}</strong><StatusPill status={member.paymentStatus} /><button className={member.paymentStatus === "due" ? "button confirm small" : "text-button"} onClick={() => void markPayment(member.id, member.paymentStatus !== "paid")}>{member.paymentStatus === "due" ? <><Check size={15} /> Mark paid</> : "Undo"}</button></div>)}
      </section>
    </PortalShell>
  );
}
