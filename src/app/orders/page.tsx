"use client";

import { CalendarDays, Clock3, Filter, Search, UtensilsCrossed, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useCVMess } from "@/components/app-provider";
import { EmptyState } from "@/components/empty-state";
import { PortalShell } from "@/components/portal-shell";
import { StatusPill } from "@/components/status-pill";
import { formatMoney, friendlyDate, timeAgo } from "@/lib/format";

export default function OrdersPage() {
  const { profile, orders, updateOrderStatus } = useCVMess();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const own = useMemo(() => orders.filter((order) => order.userId === profile.id && (filter === "all" || order.status === filter) && order.item.name.toLowerCase().includes(search.toLowerCase())), [orders, profile.id, filter, search]);

  return (
    <PortalShell title="My orders" description="Every order and officer decision in one place.">
      <div className="toolbar panel orders-toolbar">
        <label className="search-field wide"><Search size={17} /><input placeholder="Search your orders" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <div className="segmented with-icon"><Filter size={16} />{["all", "pending", "confirmed", "rejected"].map((value) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value}</button>)}</div>
      </div>
      <section className="panel order-history">
        <div className="table-head"><span>Meal</span><span>Service date</span><span>Amount</span><span>Status</span><span /></div>
        {own.length ? own.map((order) => (
          <div className="table-row" key={order.id}>
            <div className="meal-cell"><span><UtensilsCrossed size={18} /></span><div><strong>{order.item.name}</strong><small suppressHydrationWarning>{order.item.mealPeriod} · Ordered {timeAgo(order.createdAt)}</small></div></div>
            <span className="date-cell"><CalendarDays size={15} />{friendlyDate(order.item.serviceDate)}</span>
            <strong>{formatMoney(order.total)}</strong>
            <StatusPill status={order.status} />
            <div>{order.status === "pending" && <button className="text-danger" onClick={() => void updateOrderStatus(order.id, "cancelled")}><X size={15} /> Cancel</button>}</div>
          </div>
        )) : <EmptyState title="No orders found" text="Try a different filter, or pick a meal from the weekly menu." />}
      </section>
      <div className="info-banner"><Clock3 size={19} /><div><strong>About pending orders</strong><p>Your bill only includes meals after the mess officer confirms them. You can cancel while an order is still pending.</p></div></div>
    </PortalShell>
  );
}
