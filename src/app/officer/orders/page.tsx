"use client";

import { Check, CheckCheck, Filter, Search, UtensilsCrossed, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useCVMess } from "@/components/app-provider";
import { EmptyState } from "@/components/empty-state";
import { PortalShell } from "@/components/portal-shell";
import { StatusPill } from "@/components/status-pill";
import { formatMoney, initials, timeAgo } from "@/lib/format";

export default function OfficerOrdersPage() {
  const { orders, updateOrderStatus } = useCVMess();
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const visible = useMemo(() => orders.filter((order) => (filter === "all" || order.status === filter) && `${order.user?.fullName} ${order.item.name}`.toLowerCase().includes(search.toLowerCase())), [orders, filter, search]);
  const pendingVisible = visible.filter((order) => order.status === "pending");

  async function confirmVisible() {
    await Promise.all(pendingVisible.map((order) => updateOrderStatus(order.id, "confirmed")));
  }

  return (
    <PortalShell title="Order queue" description="Review and action every member order.">
      <div className="toolbar panel orders-toolbar">
        <label className="search-field wide"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search member or meal" /></label>
        <div className="segmented with-icon"><Filter size={16} />{["pending", "confirmed", "rejected", "all"].map((value) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value}</button>)}</div>
        {pendingVisible.length > 1 && <button className="button dark small" onClick={() => void confirmVisible()}><CheckCheck size={16} /> Confirm visible</button>}
      </div>
      <section className="panel officer-orders-table">
        <div className="officer-table-head"><span>Member</span><span>Meal ordered</span><span>Time</span><span>Total</span><span>Status / action</span></div>
        {visible.length ? visible.map((order) => (
          <div className="officer-table-row" key={order.id}>
            <div className="member-cell"><span className="avatar soft small">{initials(order.user?.fullName || "Member")}</span><div><strong>{order.user?.fullName || "Member"}</strong><small>{order.user?.room}</small></div></div>
            <div className="meal-cell simple"><span><UtensilsCrossed size={17} /></span><div><strong>{order.item.name}</strong><small>{order.item.mealPeriod} · Qty {order.quantity}</small></div></div>
            <span>{timeAgo(order.createdAt)}</span><strong>{formatMoney(order.total)}</strong>
            {order.status === "pending" ? <div className="action-buttons"><button className="button reject small" onClick={() => void updateOrderStatus(order.id, "rejected")}><X size={15} /> Reject</button><button className="button confirm small" onClick={() => void updateOrderStatus(order.id, "confirmed")}><Check size={15} /> Confirm</button></div> : <StatusPill status={order.status} />}
          </div>
        )) : <EmptyState title="No matching orders" text="Try another status or search term." />}
      </section>
    </PortalShell>
  );
}
