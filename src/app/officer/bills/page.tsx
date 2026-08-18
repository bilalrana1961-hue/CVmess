"use client";

import { Check, CircleDollarSign, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useCVMess } from "@/components/app-provider";
import { EmptyState } from "@/components/empty-state";
import { PortalShell } from "@/components/portal-shell";
import { StatusPill } from "@/components/status-pill";
import { formatMoney, initials } from "@/lib/format";

export default function OfficerBillsPage() {
  const { members, markPayment } = useCVMess();
  const [search, setSearch] = useState("");
  const visible = useMemo(() => { const query = search.trim().toLowerCase(); return members.filter((member) => `${member.fullName} ${member.email} ${member.room}`.toLowerCase().includes(query)); }, [members, search]);
  const total = members.reduce((sum, member) => sum + member.monthTotal, 0);
  const collected = members.filter((member) => member.paymentStatus === "paid").reduce((sum, member) => sum + member.monthTotal, 0);
  const monthName = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date());
  return (
    <PortalShell title="Bills" description="Review this month’s charges and record member payments.">
      <section className="member-summary-band"><div><Users size={21} /><span>Members<strong>{members.length}</strong></span></div><div><span>{monthName} total<strong>{formatMoney(total)}</strong></span></div><div><span>Collected<strong>{formatMoney(collected)}</strong></span></div><div><span>Outstanding<strong>{formatMoney(total - collected)}</strong></span></div></section>
      <div className="toolbar panel"><label className="search-field wide"><Search size={17} /><input aria-label="Search bills" placeholder="Search member, email, or unit" value={search} onChange={(event) => setSearch(event.target.value)} /></label><span className="toolbar-count">{visible.length} bills</span></div>
      <section className="panel bills-table"><div className="bills-head"><span>Member</span><span>Orders</span><span>Monthly bill</span><span>Status</span><span>Payment action</span></div>{visible.map((member) => <div className="bills-row" key={member.id}><div className="member-cell"><span className="avatar soft">{initials(member.fullName)}</span><div><strong>{member.fullName}</strong><small>Unit {member.room}</small></div></div><span className="bill-orders">{member.orderCount} orders</span><strong className="bill-amount">{formatMoney(member.monthTotal)}</strong><StatusPill status={member.paymentStatus} /><button className={member.paymentStatus === "due" ? "button confirm small" : "button light small"} onClick={() => void markPayment(member.id, member.paymentStatus !== "paid")}>{member.paymentStatus === "due" ? <><Check size={15} /> Mark paid</> : "Undo payment"}</button></div>)}{visible.length === 0 && <EmptyState icon={CircleDollarSign} title="No bills found" description={search ? "Try a different member name, email, or unit." : "Member bills will appear as soon as orders are placed."} />}</section>
    </PortalShell>
  );
}
