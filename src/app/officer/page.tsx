"use client";

import Link from "next/link";
import { ArrowRight, Check, Clock3, IndianRupee, ReceiptText, UtensilsCrossed, Users, X } from "lucide-react";
import { useCVMess } from "@/components/app-provider";
import { EmptyState } from "@/components/empty-state";
import { PortalShell } from "@/components/portal-shell";
import { StatCard } from "@/components/stat-card";
import { StatusPill } from "@/components/status-pill";
import { formatMoney, initials, isoDate, timeAgo } from "@/lib/format";

export default function OfficerDashboardPage() {
  const { orders, menu, members, updateOrderStatus } = useCVMess();
  const pending = orders.filter((order) => order.status === "pending");
  const confirmed = orders.filter((order) => order.status === "confirmed");
  const todayMenu = menu.filter((item) => item.serviceDate === isoDate());
  const todayRevenue = confirmed.filter((order) => order.item.serviceDate === isoDate()).reduce((sum, order) => sum + order.total, 0);
  const monthTotal = members.reduce((sum, member) => sum + member.monthTotal, 0);
  const collected = members.filter((member) => member.paymentStatus === "paid").reduce((sum, member) => sum + member.monthTotal, 0);
  const collectionProgress = monthTotal ? Math.round((collected / monthTotal) * 100) : 0;
  const monthName = new Intl.DateTimeFormat("en", { month: "long" }).format(new Date());

  return (
    <PortalShell title="Mess overview" description="Live operations, order decisions, and member billing.">
      <section className="officer-alert"><div><span><Clock3 size={19} /></span><div><strong>{pending.length} orders waiting for your decision</strong><p>Confirm today’s orders so members can see their updated bills.</p></div></div><Link href="/officer/orders">Open queue <ArrowRight size={16} /></Link></section>
      <section className="stats-grid officer-stats">
        <StatCard label="Pending orders" value={String(pending.length)} helper="Needs your attention" icon={Clock3} tone="rust" />
        <StatCard label="Today’s confirmed" value={formatMoney(todayRevenue)} helper={`${confirmed.filter((order) => order.item.serviceDate === isoDate()).length} meal orders`} icon={IndianRupee} tone="green" />
        <StatCard label="Active members" value={String(members.length)} helper="Registered member accounts" icon={Users} tone="sand" />
        <StatCard label="Month to date" value={formatMoney(monthTotal)} helper="Across all members" icon={ReceiptText} tone="olive" />
      </section>

      <section className="officer-main-grid">
        <article className="panel officer-queue">
          <div className="panel-heading"><div><span>Live queue</span><h3>Orders awaiting confirmation</h3></div><Link href="/officer/orders">View all</Link></div>
          {pending.length ? <div className="queue-list">{pending.slice(0, 5).map((order) => (
            <div className="queue-row" key={order.id}>
              <span className="avatar soft">{initials(order.user?.fullName || "Member")}</span>
              <div className="queue-person"><strong>{order.user?.fullName || "Member"}</strong><small suppressHydrationWarning>{order.user?.room} · {timeAgo(order.createdAt)}</small></div>
              <div className="queue-meal"><strong>{order.item.name}</strong><small>{order.item.mealPeriod} · Qty {order.quantity}</small></div>
              <b>{formatMoney(order.total)}</b>
              <div className="queue-actions"><button className="reject-icon" onClick={() => void updateOrderStatus(order.id, "rejected")} aria-label="Reject order"><X size={17} /></button><button className="confirm-icon" onClick={() => void updateOrderStatus(order.id, "confirmed")} aria-label="Confirm order"><Check size={17} /></button></div>
            </div>
          ))}</div> : <EmptyState title="Queue cleared" text="There are no pending orders right now." />}
        </article>
        <article className="panel today-operations">
          <div className="panel-heading"><div><span>Today</span><h3>Menu status</h3></div><Link href="/officer/menu">Manage</Link></div>
          <div className="ops-menu-list">{todayMenu.length ? todayMenu.map((item) => {
            const count = orders.filter((order) => order.menuItemId === item.id && order.status === "confirmed").reduce((sum, order) => sum + order.quantity, 0);
            return <div key={item.id}><span className="order-icon" style={{ background: `${item.accent}20`, color: item.accent }}><UtensilsCrossed size={17} /></span><div><strong>{item.name}</strong><small>{item.mealPeriod} · {formatMoney(item.price)}</small></div><div className="ops-count"><b>{count}</b><small>orders</small></div><StatusPill status={item.isAvailable ? "available" : "due"} /></div>;
          }) : <EmptyState title="No menu for today" text="Add today’s meals from Manage menu." />}</div>
        </article>
      </section>

      <section className="panel collection-panel">
        <div className="panel-heading"><div><span>Billing pulse</span><h3>{monthName} collection status</h3></div><Link href="/officer/bills">Open bills <ArrowRight size={15} /></Link></div>
        <div className="collection-body"><div className="collection-number"><strong>{formatMoney(collected)}</strong><span>collected so far</span></div><div className="collection-progress"><span style={{ width: `${collectionProgress}%` }} /></div><div className="collection-labels"><span><i className="paid-dot" /> Paid <b>{members.filter((member) => member.paymentStatus === "paid").length}</b></span><span><i className="due-dot" /> Due <b>{members.filter((member) => member.paymentStatus === "due").length}</b></span></div></div>
      </section>
    </PortalShell>
  );
}
